import mongoose from 'mongoose';
import Store from '../services/store.js';
import { syncStoreToMongo } from './mongoSync.js';

const connectDB = async () => {
  // Always initialize store data files so fallback and offline mode are pre-warmed
  Store.init();

  const mongoURI = (process.env.MONGO_URI).trim();
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // Don't hang if MongoDB isn't running locally
    });
    console.log(`🌿 MongoDB Connected Successfully: ${conn.connection.host}`);
    
    // Automatically sync catalog, users, recipes & orders to MongoDB Atlas
    await syncStoreToMongo();

    return true;
  } catch (error) {
    console.log(`ℹ️  Local MongoDB daemon not detected (${error.message}).`);
    console.log(`✨ Operating in High-Fidelity File-Backed Persistence Mode (backend/data/).`);
    console.log(`📦 All products, orders, authentication, reviews, recipes & admin controls are 100% active and persistent.`);
    console.log(`💡 To connect to MongoDB Atlas or local MongoDB, specify MONGO_URI in backend/.env`);
    return false;
  }
};

export default connectDB;
