import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined');
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`🎯 MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};