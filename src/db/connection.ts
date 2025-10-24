import mongoose from "mongoose";

interface connectionObj {
  isConnected?: number;
}

const connection: connectionObj = {};

/**
 * Connects to MongoDB using Mongoose in a stable way.
 * If already connected, it returns immediately to avoid multiple connections.
 *
 * Note:
 * - MongoDB databases can be hosted in different continents (geo-distributed).
 * - Next.js API routes or server-side functions can be invoked multiple times.
 * - Hence, this function prevents creating multiple connections in hot reloads or multiple API calls by reusing existing connection.
 */
export const dbConnect = async () => {
  if (connection.isConnected) {
    console.log("Already Connected to Database!");
    return;
  }

  try {
    const mongoDbConnection = await mongoose.connect(
      process.env.MONGODB_URL as string
    );

    connection.isConnected = mongoDbConnection.connection.readyState;
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Error connecting to Database:", error);
    process.exit(1);
  }
};
