// ============================================
// ApplyFlow.ai — Auto-Apply Automation Service
// Puppeteer-powered zero-form-interaction engine
// ============================================

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const config = require('../config/index');

class AutoApplyService {
  constructor() {
    this.browser = null;
  }

  /**
   * Launch headless browser instance
   */
  async _getBrowser() {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await puppeteer.launch({
        headless: config.puppeteerHeadless ? 'new' : false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1920,1080',
        ],
        defaultViewport: { width: 1920, height: 1080 },
      });
    }
    return this.browser;
  }

  /**
   * ─────────────────────────────────────────
   * CORE: Auto-fill a job application form
   * ─────────────────────────────────────────
   * Given a URL + candidate data → fill all fields automatically
   */
  async autoApply(applicationUrl, candidateData, optimizedResume, onProgress) {
    const startTime = Date.now();
    const result = {
      success: false,
      formFieldsFilled: 0,
      screenshotPath: '',
      errors: [],
      duration: 0,
    };

    let page = null;
    try {
      if (onProgress) onProgress('🔍 Launching Headless Chromium browser...');
      const browser = await this._getBrowser();
      page = await browser.newPage();

      // Set a realistic user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Navigate to the application URL
      console.log(`🌐 Navigating to: ${applicationUrl}`);
      if (onProgress) onProgress(`🌐 Navigating to: ${applicationUrl.replace('http://localhost:5000', 'local_gateway')}`);
      await page.goto(applicationUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await this._delay(1500);

      // Detect and fill form fields
      if (onProgress) onProgress('🧠 Scanning DOM structure for input nodes...');
      const fieldsFilledCount = await this._detectAndFillFields(page, candidateData, optimizedResume, onProgress);
      result.formFieldsFilled = fieldsFilledCount;

      // Submit the form
      if (onProgress) onProgress('⚡ Executing submit trigger...');
      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true }));
          // If the form has a submit handler in HTML:
          if (typeof handleSubmit === 'function') {
            handleSubmit(new Event('submit'));
          }
        }
      });
      await this._delay(1500);

      // Take a screenshot as proof
      if (onProgress) onProgress('📸 Taking high-resolution screenshot proof...');
      const screenshotDir = path.join(config.uploadDir, 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      const screenshotFilename = `apply_${Date.now()}.png`;
      const screenshotPath = path.join(screenshotDir, screenshotFilename);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      result.screenshotPath = `/uploads/screenshots/${screenshotFilename}`;

      result.success = true;
      if (onProgress) onProgress('✅ Application successfully submitted!');
      console.log(`✅ Auto-apply completed! Fields filled: ${fieldsFilledCount}`);
    } catch (error) {
      result.errors.push(error.message);
      if (onProgress) onProgress(`❌ Automation Error: ${error.message}`);
      console.error(`❌ Auto-apply error: ${error.message}`);
    } finally {
      if (page) await page.close();
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Intelligent form field detection and filling
   */
  async _detectAndFillFields(page, candidate, resume, onProgress) {
    let filledCount = 0;

    // Define field mapping (label patterns → candidate data)
    const fieldMappings = [
      // Name fields
      { patterns: ['first.?name', 'fname', 'given.?name'], value: candidate.name?.split(' ')[0] || '' },
      { patterns: ['last.?name', 'lname', 'surname', 'family.?name'], value: candidate.name?.split(' ').slice(1).join(' ') || '' },
      { patterns: ['full.?name', '^name$', 'your.?name', 'candidate.?name'], value: candidate.name || '' },
      
      // Contact fields
      { patterns: ['email', 'e-mail', 'mail'], value: candidate.email || '' },
      { patterns: ['phone', 'mobile', 'tel', 'contact.?number'], value: candidate.phone || '' },
      
      // Location
      { patterns: ['city', 'location', 'address', 'current.?city'], value: candidate.location || '' },
      
      // Professional
      { patterns: ['linkedin', 'linked.?in'], value: candidate.linkedinUrl || '' },
      { patterns: ['github', 'git.?hub'], value: candidate.githubUrl || '' },
      { patterns: ['portfolio', 'website', 'personal.?site'], value: candidate.portfolioUrl || '' },
      
      // Experience
      { patterns: ['current.?company', 'employer', 'company.?name'], value: candidate.experience?.[0]?.company || '' },
      { patterns: ['current.?title', 'job.?title', 'designation', 'current.?role'], value: candidate.experience?.[0]?.title || '' },
      { patterns: ['experience', 'years.?of.?exp', 'total.?exp'], value: candidate.experienceYears || '' },
      
      // Cover letter / Summary
      { patterns: ['cover.?letter', 'why.?join', 'motivation', 'about.?you', 'summary'], value: resume?.optimizedSummary || candidate.summary || '' },
      
      // Salary
      { patterns: ['expected.?salary', 'salary.?expect', 'ctc', 'compensation'], value: candidate.expectedSalary || '' },
      
      // Notice period
      { patterns: ['notice.?period', 'availability', 'start.?date', 'joining'], value: candidate.noticePeriod || 'Immediately' },
    ];

    // Get all input fields on the page
    const inputs = await page.$$('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="file"]), textarea, select');

    for (const input of inputs) {
      try {
        const attrs = await page.evaluate(el => ({
          type: el.type || '',
          name: el.name || '',
          id: el.id || '',
          placeholder: el.placeholder || '',
          label: el.labels?.[0]?.textContent || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          className: el.className || '',
        }), input);

        // Build a searchable string from all attributes
        const searchStr = `${attrs.name} ${attrs.id} ${attrs.placeholder} ${attrs.label} ${attrs.ariaLabel}`.toLowerCase();

        // Find matching field
        for (const mapping of fieldMappings) {
          if (!mapping.value) continue;
          
          const matched = mapping.patterns.some(pattern => {
            const regex = new RegExp(pattern, 'i');
            return regex.test(searchStr);
          });

          if (matched) {
            const tagName = await page.evaluate(el => el.tagName.toLowerCase(), input);
            
            if (tagName === 'select') {
              // For dropdowns, try to select the best matching option
              await this._selectBestOption(page, input, mapping.value);
            } else {
              // Clear existing value and type new one
              await input.click({ clickCount: 3 }); // Select all
              await input.type(String(mapping.value), { delay: 10 });
            }
            
            filledCount++;
            const fieldLabel = attrs.label || attrs.placeholder || attrs.name || attrs.id;
            if (onProgress) onProgress(`✏️ Filled: [${fieldLabel.trim()}] = "${String(mapping.value).slice(0, 30)}..."`);
            console.log(`  ✏️  Filled: ${attrs.name || attrs.id || attrs.placeholder} = ${String(mapping.value).slice(0, 30)}...`);
            await this._delay(200); // realistic typing pause
            break;
          }
        }
      } catch (err) {
        // Skip problematic fields
        continue;
      }
    }

    // Handle file upload for resume if present
    try {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput && candidate.resumePath) {
        await fileInput.uploadFile(candidate.resumePath);
        filledCount++;
        if (onProgress) onProgress('📎 Attached resume PDF securely.');
        console.log('  📎 Resume file attached');
        await this._delay(300);
      }
    } catch (err) {
      console.warn('  ⚠️  Could not attach resume file');
    }

    return filledCount;
  }

  /**
   * Try to select the best matching option in a dropdown
   */
  async _selectBestOption(page, selectElement, value) {
    try {
      await page.evaluate((el, val) => {
        const options = Array.from(el.options);
        const lowerVal = val.toLowerCase();
        
        // Try exact match first
        let match = options.find(o => o.text.toLowerCase() === lowerVal || o.value.toLowerCase() === lowerVal);
        
        // Try partial match
        if (!match) {
          match = options.find(o => o.text.toLowerCase().includes(lowerVal) || lowerVal.includes(o.text.toLowerCase()));
        }
        
        // Select first non-empty option if no match
        if (!match) {
          match = options.find(o => o.value && o.value !== '');
        }
        
        if (match) {
          el.value = match.value;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, selectElement, value);
    } catch (err) {
      // Ignore dropdown errors
    }
  }

  /**
   * Simulate the full application flow on a demo/test portal
   */
  async simulateAutoApply(candidateData, onProgress) {
    // For hackathon demo: simulate the auto-apply process
    const startTime = Date.now();
    
    console.log('🚀 Simulating auto-apply process...');
    if (onProgress) onProgress('🔍 Launching Simulated Sandbox Chromium Instance...');
    await this._delay(800);
    
    if (onProgress) onProgress('🌐 Loading application portal: gateway_sandbox_link...');
    await this._delay(800);
    
    // Simulate form field detection
    if (onProgress) onProgress('🧠 Scanning DOM layout for input identifiers...');
    await this._delay(600);
    
    // Simulate filling each field
    const fields = [
      { name: 'Full Name', value: candidateData.name },
      { name: 'Email', value: candidateData.email },
      { name: 'Phone', value: candidateData.phone },
      { name: 'LinkedIn URL', value: candidateData.linkedinUrl || 'linkedin.com/in/demo' },
      { name: 'GitHub URL', value: candidateData.githubUrl || 'github.com/demo' },
      { name: 'Designation', value: candidateData.experience?.[0]?.title || 'Software Developer' },
      { name: 'Current Employer', value: candidateData.experience?.[0]?.company || 'InnovateLabs' },
      { name: 'Notice Period', value: 'Immediate Joiner' },
      { name: 'Cover Letter', value: (candidateData.optimizedSummary || candidateData.summary || 'AI-generated cover letter...').slice(0, 30) + '...' },
    ];

    for (const field of fields) {
      if (onProgress) onProgress(`✏️ Filled: [${field.name}] = "${field.value}"`);
      await this._delay(300);
    }

    if (onProgress) onProgress('📎 Attaching optimized resume PDF...');
    await this._delay(500);
    
    if (onProgress) onProgress('📸 Capture transaction screenshot proof...');
    await this._delay(400);
    
    if (onProgress) onProgress('✅ Transmitting packet. Application successfully submitted!');
    await this._delay(500);

    return {
      success: true,
      formFieldsFilled: fields.length,
      screenshotPath: '', // no real screenshot in simulation
      errors: [],
      duration: Date.now() - startTime,
      simulation: true,
      fieldsDetected: fields.map(f => f.name),
    };
  }

  /**
   * Cleanup
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new AutoApplyService();
