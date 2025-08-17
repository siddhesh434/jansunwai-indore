// app/api/debug/users/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import { User } from "../../../models";

export async function GET(request) {
  try {
    await dbConnect();
    
    // Get all users (for debugging only - remove in production)
    const users = await User.find({}).select('name username email authMethod createdAt').sort({ createdAt: -1 });
    
    console.log('Debug: All users in database:', users);
    
    return NextResponse.json({
      message: "Debug info - all users",
      count: users.length,
      users: users
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
