// ============================================
// ApplyFlow.ai — MongoDB Connection
// ============================================

const mongoose = require('mongoose');
const config = require('./index');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const overrideUri = 'mongodb://ApplyFlow:Pritam.99@ac-xqzjekf-shard-00-00.hdop9ag.mongodb.net:27017,ac-xqzjekf-shard-00-01.hdop9ag.mongodb.net:27017,ac-xqzjekf-shard-00-02.hdop9ag.mongodb.net:27017/mydb?ssl=true&replicaSet=atlas-ml9iux-shard-0&authSource=admin&retryWrites=true&w=majority';
    const conn = await mongoose.connect(overrideUri, {
      serverSelectionTimeoutMS: 5000
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // In hackathon mode, we'll continue without DB and use in-memory fallback
    console.warn('⚠️  Running in IN-MEMORY mode (no MongoDB). Data will not persist.');
  }
};

module.exports = connectDB;
