// app/api/departments/route.js
import dbConnect from "../../../lib/dbConnect";
import { Department } from "../../../models";

export async function GET() {
  try {
    await dbConnect();
    const departments = await Department.find({}).populate([
      "members",
      "queries",
    ]);
    return Response.json(departments);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const department = await Department.create(body);
    return Response.json(department, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
