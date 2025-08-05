// app/api/queries/[id]/route.js
import dbConnect from "../../../../lib/dbConnect";
import { Query } from "../../../../models";

export async function GET(request, context) {
  try {
    await dbConnect();
    const params = await context.params; // ✅ Await params directly
    const query = await Query.findById(params.id).populate([
      "author",
      "department",
    ]);
    if (!query)
      return Response.json({ error: "Query not found" }, { status: 404 });
    return Response.json(query);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    await dbConnect();
    const params = await context.params; // ✅ Await params directly
    const body = await request.json();
    const query = await Query.findByIdAndUpdate(params.id, body, { new: true });
    if (!query)
      return Response.json({ error: "Query not found" }, { status: 404 });
    return Response.json(query);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, context) {
  try {
    await dbConnect();
    const params = await context.params; // ✅ Await params directly
    const query = await Query.findByIdAndDelete(params.id);
    if (!query)
      return Response.json({ error: "Query not found" }, { status: 404 });
    return Response.json({ message: "Query deleted" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
