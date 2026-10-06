import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🌾 Mithila Makhana Backend API Server Running`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`✨ Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🖼️ Static Images: http://localhost:${PORT}/images/`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Fatal Server Error:', error);
    process.exit(1);
  }
};

startServer();
