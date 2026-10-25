import mongoose from 'mongoose';
import logger from '../utils/logger.js';

let isConnected = false;

export const connectDatabase = async (customUri) => {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_booking';

  if (isConnected && mongoose.connection.readyState === 1) {
    logger.info('MongoDB is already connected');
    return mongoose.connection;
  }

  try {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      logger.info('MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB connection lost. Reconnecting...');
    });

    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    return mongoose.connection;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to MongoDB');
    throw error;
  }
};

export const disconnectDatabase = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB connection closed');
  }
};

export default { connectDatabase, disconnectDatabase };
