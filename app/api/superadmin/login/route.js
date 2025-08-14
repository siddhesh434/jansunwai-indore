import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "../../../../lib/dbConnect";
import { SuperAdmin } from "../../../../models";

export async function POST(request) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find superadmin by email
    const superadmin = await SuperAdmin.findOne({ email });

    if (!superadmin) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password (in production, use proper hashing)
    if (superadmin.password !== password) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return superadmin data (without password)
    const { password: _, ...superadminData } = superadmin.toObject();

    return NextResponse.json({
      success: true,
      superadmin: superadminData,
      message: "Login successful"
    });

  } catch (error) {
    console.error("Superadmin login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
