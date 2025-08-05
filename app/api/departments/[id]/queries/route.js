// app/api/departments/[id]/queries/route.js
import dbConnect from "../../../../../lib/dbConnect";
import { Query } from "../../../../../models";

export async function GET(request, context) {
  try {
    await dbConnect();
    
    const params = await context.params;
    const departmentId = params.id;
    
    const queries = await Query.find({ department: departmentId })
      .populate('author', 'name email')
      .populate('department', 'departmentName')
      .sort({ createdAt: -1 });

    return Response.json(queries);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}