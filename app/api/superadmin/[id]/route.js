import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "../../../../lib/dbConnect";
import { SuperAdmin } from "../../../../models";

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Superadmin ID is required" },
        { status: 400 }
      );
    }

    // Find superadmin by ID
    const superadmin = await SuperAdmin.findById(id).select('-password');

    if (!superadmin) {
      return NextResponse.json(
        { success: false, error: "Superadmin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      superadmin
    });

  } catch (error) {
    console.error("Error fetching superadmin:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
