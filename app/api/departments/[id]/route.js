// app/api/departments/[id]/route.js
import dbConnect from "../../../../lib/dbConnect";
import { Department } from "../../../../models";

export async function GET(request, context) {
  try {
    await dbConnect();

    const params = await context.params; // ✅ Await params directly
    const departmentId = params.id;

    const department = await Department.findById(departmentId).populate([
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

export async function PUT(request, context) {
  try {
    await dbConnect();

    const params = await context.params; // ✅ Await params directly
    const departmentId = params.id;

    const body = await request.json();

    const department = await Department.findByIdAndUpdate(departmentId, body, {
      new: true,
    });

    if (!department)
      return Response.json({ error: "Department not found" }, { status: 404 });

    return Response.json(department);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, context) {
  try {
    await dbConnect();

    const params = await context.params; // ✅ Await params directly
    const departmentId = params.id;

    const department = await Department.findByIdAndDelete(departmentId);

    if (!department)
      return Response.json({ error: "Department not found" }, { status: 404 });

    return Response.json({ message: "Department deleted" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
