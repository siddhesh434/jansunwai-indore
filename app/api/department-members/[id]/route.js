// app/api/department-members/[id]/route.js
import dbConnect from "../../../../lib/dbConnect";
import { DepartmentMember } from "../../../../models";

export async function GET(request, context) {
  try {
    await dbConnect();
    
    const params = await context.params;
    const memberId = params.id;
    
    const member = await DepartmentMember.findById(memberId).populate('department');
    
    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    return Response.json(member);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    await dbConnect();
    
    const params = await context.params;
    const memberId = params.id;
    const body = await request.json();
    
    const member = await DepartmentMember.findByIdAndUpdate(memberId, body, { new: true });
    
    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    return Response.json(member);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, context) {
  try {
    await dbConnect();
    
    const params = await context.params;
    const memberId = params.id;
    
    const member = await DepartmentMember.findByIdAndDelete(memberId);
    
    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    return Response.json({ message: "Member deleted" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}