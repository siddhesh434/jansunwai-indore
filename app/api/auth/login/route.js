// app/api/auth/login/route.js
import dbConnect from "../../../../lib/dbConnect";
import { User } from "../../../../models";

export async function POST(request) {
  try {
    const dbConnection = await dbConnect();
    if (!dbConnection) {
      return Response.json({ error: "Database connection not available" }, { status: 503 });
    }

    const { email, password } = await request.json();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // In a real app, you'd hash and compare password
    // For simplicity, assuming password is stored as plain text
    if (user.password !== password) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return Response.json({
      message: "Login successful",
      userId: user._id,
      user: user, // Return the full user object as returned by MongoDB
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
