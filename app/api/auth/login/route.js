// app/api/auth/login/route.js
import dbConnect from "../../../../lib/dbConnect";
import { User } from "../../../../models";

export async function POST(request) {
  try {
    await dbConnect();
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
