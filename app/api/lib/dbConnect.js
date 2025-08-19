// lib/dbConnect.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGOURL;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Check if MongoDB URI is available
  if (!MONGODB_URI) {
    console.warn("MONGOURL environment variable is not defined. Database connection will not be established.");
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("Database connection error:", e.message);
    return null;
  }

  return cached.conn;
}

export default dbConnect;
