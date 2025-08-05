// app/api/auth/department-login/route.js
import dbConnect from "../../../../lib/dbConnect";
import { DepartmentMember } from "../../../../models";

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    const member = await DepartmentMember.findOne({ email }).populate('department');
    if (!member) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // In a real app, you'd hash and compare password
    // For simplicity, assuming password is stored as plain text (like your user login)
    if (member.password !== password) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return Response.json({ 
      departmentMemberId: member._id,
      message: "Login successful",
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        department: member.department
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}