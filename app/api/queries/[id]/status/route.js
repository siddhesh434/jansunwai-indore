// app/api/queries/[id]/status/route.js
import dbConnect from "../../../../../lib/dbConnect";
import { Query } from "../../../../../models";

export async function PUT(request, context) {
  try {
    await dbConnect();
    
    const params = await context.params;
    const queryId = params.id;
    const { status } = await request.json();

    const query = await Query.findByIdAndUpdate(
      queryId,
      { status },
      { new: true }
    );

    if (!query) {
      return Response.json({ error: "Query not found" }, { status: 404 });
    }

    return Response.json({ message: "Status updated successfully", query });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}