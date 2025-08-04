// app/api/departments/[id]/route.js
import dbConnect from "../../../../lib/dbConnect";
import { Department } from "../../../../models";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const department = await Department.findById(params.id).populate([
      "members",
      "queries",
    ]);
    if (!department)
      return Response.json({ error: "Department not found" }, { status: 404 });
    return Response.json(department);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const department = await Department.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    if (!department)
      return Response.json({ error: "Department not found" }, { status: 404 });
    return Response.json(department);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const department = await Department.findByIdAndDelete(params.id);
    if (!department)
      return Response.json({ error: "Department not found" }, { status: 404 });
    return Response.json({ message: "Department deleted" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
