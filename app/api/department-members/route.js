import dbConnect from "../../../lib/dbConnect";
import { DepartmentMember } from "../../../models";

export async function GET() {
  try {
    await dbConnect();
    const members = await DepartmentMember.find({}).populate('department', 'departmentName');
    return Response.json(members);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const member = await DepartmentMember.create(body);
    return Response.json(member, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}