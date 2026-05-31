// ============================================
// ApplyFlow.ai — AI Interview Simulator Controller
// Conversational AI Recruiter with Graded Scorecard
// ============================================

const User = require('../models/User');
const jobMatchingService = require('../services/jobMatchingService');
const { getModel } = require('../config/gemini');

// In-memory active interview sessions
const activeInterviews = new Map();

/**
 * Start a new AI Interview session
 * POST /api/apply/interview/start
 */
const startInterview = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = String(req.user._id);

    if (!jobId) {
      return res.status(400).json({ success: false, error: 'Job ID is required' });
    }

    // 1. Get job
    let job;
    try {
      const Job = require('../models/Job');
      job = await Job.findById(jobId).lean();
    } catch (e) {
      const sampleJobs = jobMatchingService._getSampleJobs();
      job = sampleJobs.find(j => j._id === jobId);
    }

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // 2. Get candidate profile
    let candidate = { name: req.user.name || 'Candidate', skills: ['JavaScript', 'React'] };
    try {
      const user = await User.findById(req.user._id);
      if (user?.profile) {
        candidate = {
          name: user.name,
          skills: user.profile.skills || [],
          summary: user.profile.summary || '',
        };
      }
    } catch (e) {}

    const companyName = job.company?.name || job.company || 'TechCorp';
    const jobTitle = job.title;

    console.log(`🎤 STARTING INTERVIEW for ${candidate.name} - Job: ${jobTitle} at ${companyName}`);

    // 3. Ask Gemini to generate 3 tailored interview questions in one go
    let questions = [];
    const model = getModel();

    if (model) {
      const prompt = `You are a Lead Recruiter hiring a ${jobTitle} for ${companyName}.
Candidate Profile:
Name: ${candidate.name}
Skills: ${candidate.skills.join(', ')}

Your task is to generate 3 highly targeted interview questions (mix of technical conceptual and behavioral) for this candidate applying to this job.
Return STRICTLY a JSON array of strings containing the 3 questions (no code block wrap, no markdown):
[
  "Question 1...",
  "Question 2...",
  "Question 3..."
]`;

      try {
        const result = await model.generateContent(prompt);
        let cleaned = result.response.text().trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        questions = JSON.parse(cleaned.trim());
      } catch (err) {
        console.error('Gemini startInterview generate questions error:', err.message);
      }
    }

    // Fallback if Gemini or JSON parsing fails
    if (!questions || questions.length < 3) {
      questions = [
        `Can you describe a challenging project you built using ${candidate.skills[0] || 'your core skills'}, and how you resolved its technical hurdles?`,
        `For the ${jobTitle} role at ${companyName}, how would you ensure high performance and scalability in your frontend or backend code?`,
        `Tell me about a time you had to learn a new programming language or tool in a very short timeline. How did you approach the learning curve?`
      ];
    }

    const greeting = `Hello ${candidate.name}, welcome to your AI technical interview for the **${jobTitle}** role at **${companyName}**. I am your interviewer today. Let's begin!`;

    // 4. Save interview state in memory
    const sessionKey = `${userId}_${jobId}`;
    const interviewSession = {
      userId,
      jobId,
      jobTitle,
      company: companyName,
      candidateName: candidate.name,
      candidateSkills: candidate.skills,
      questions,
      currentQuestionIndex: 0,
      maxQuestions: 3,
      history: [
        { role: 'recruiter', text: `${greeting}\n\n${questions[0]}` }
      ],
      answers: []
    };

    activeInterviews.set(sessionKey, interviewSession);

    res.status(200).json({
      success: true,
      message: 'Interview session established! 🎤',
      data: {
        greeting,
        firstQuestion: questions[0],
        currentQuestionIndex: 0,
        totalQuestions: 3,
        history: interviewSession.history,
      }
    });

  } catch (error) {
    console.error('Start interview controller error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to start interview' });
  }
};

/**
 * Submit candidate answer, receive feedback and next question (or scorecard)
 * POST /api/apply/interview/answer
 */
const submitAnswer = async (req, res) => {
  try {
    const { jobId, answerText } = req.body;
    const userId = String(req.user._id);

    if (!jobId || !answerText) {
      return res.status(400).json({ success: false, error: 'Job ID and answer are required' });
    }

    const sessionKey = `${userId}_${jobId}`;
    const session = activeInterviews.get(sessionKey);

    if (!session) {
      return res.status(400).json({ success: false, error: 'No active interview session found for this job' });
    }

    const currentIndex = session.currentQuestionIndex;
    const currentQuestion = session.questions[currentIndex];
    
    // Save answer
    session.history.push({ role: 'candidate', text: answerText });
    session.answers.push({ question: currentQuestion, answer: answerText });

    console.log(`🎤 Candidate answered question ${currentIndex + 1}/3`);

    const model = getModel();

    // Case 1: More questions remain (Index 0 or 1 answered)
    if (currentIndex < session.maxQuestions - 1) {
      session.currentQuestionIndex += 1;
      const nextQuestion = session.questions[session.currentQuestionIndex];

      // Generate conversational recruiter feedback for the current answer
      let feedback = "Thank you for that detailed response. That covers the core fundamentals quite well.";
      if (model) {
        const prompt = `You are the Lead Recruiter hiring a ${session.jobTitle} for ${session.company}.
Question Asked: "${currentQuestion}"
Candidate Answer: "${answerText}"

Provide a brief, encouraging 1-2 sentence response validating their points or constructively adding a minor pointer. Do not ask a new question, just give the response.`;
        try {
          const result = await model.generateContent(prompt);
          feedback = result.response.text().trim();
        } catch (e) {}
      }

      const replyText = `${feedback}\n\nHere is my next question:\n**${nextQuestion}**`;
      session.history.push({ role: 'recruiter', text: replyText });

      return res.status(200).json({
        success: true,
        data: {
          isFinished: false,
          feedback,
          nextQuestion,
          currentQuestionIndex: session.currentQuestionIndex,
          totalQuestions: 3,
          history: session.history,
        }
      });
    }

    // Case 2: Final question answered (Index 2 answered). Time to compile the Scorecard!
    onProgressLog(`🤖 Interview complete. Analyzing answer patterns and grading candidate profile...`);

    let scorecard = null;
    if (model) {
      const prompt = `You are a Lead Tech Recruiter at ${session.company} grading a candidate for ${session.jobTitle}.
Candidate Name: ${session.candidateName}
Skills: ${session.candidateSkills.join(', ')}

Review the candidate's interview session:
${session.answers.map((a, i) => `Q${i+1}: ${a.question}\nAns: ${a.answer}\n`).join('\n')}

Generate a detailed final scorecard assessment.
Return STRICTLY a JSON object with this structure (no code block wrapping, no markdown):
{
  "overallGrade": "A+ or A or B+ or B or C",
  "overallScore": 88,
  "strengths": [
    "Compelling strength 1 observed during interview",
    "Strength 2...",
    "Strength 3..."
  ],
  "weaknesses": [
    "Constructive criticism 1",
    "Criticism 2..."
  ],
  "advisorFeedback": "A highly motivating, detailed career advisor paragraph helping them optimize their skills specifically for hiring at ${session.company}."
}`;

      try {
        const result = await model.generateContent(prompt);
        let cleaned = result.response.text().trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        scorecard = JSON.parse(cleaned.trim());
      } catch (e) {
        console.error('Gemini score generation error:', e.message);
      }
    }

    // Fallback Mock Scorecard if Gemini or parser fails
    if (!scorecard) {
      scorecard = {
        overallGrade: 'B+',
        overallScore: 82,
        strengths: [
          `Strong understanding of ${session.candidateSkills[0] || 'core technical'} workflows.`,
          "Quantified past project achievements effectively in responses.",
          "Confident communication and structured thought process."
        ],
        weaknesses: [
          "Could be more specific about database optimization details.",
          "Consider expanding on unit testing and CI/CD parameters."
        ],
        advisorFeedback: `You did a great job, ${session.candidateName}! To secure a final offer at ${session.company}, double-down on studying system design fundamentals and REST API caching. Practice explaining memory efficiency and state hooks.`
      };
    }

    const endGreeting = `Thank you so much for your time, ${session.candidateName}. That completes our technical interview cycle! I have compiled your graded assessment scorecard. Best of luck!`;
    session.history.push({ role: 'recruiter', text: endGreeting });

    // Clear active session since it is finished
    activeInterviews.delete(sessionKey);

    res.status(200).json({
      success: true,
      data: {
        isFinished: true,
        endGreeting,
        scorecard,
        history: session.history,
      }
    });

  } catch (error) {
    console.error('Submit answer controller error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to submit answer' });
  }
};

// Help helper for logging
function onProgressLog(msg) {
  console.log(`[AI Recruiter]: ${msg}`);
}

module.exports = { startInterview, submitAnswer };
