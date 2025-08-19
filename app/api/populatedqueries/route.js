    // app/api/populatedqueries/route.js
import dbConnect from "../lib/dbConnect";
import { Query } from "../../../models";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const sortOrder = searchParams.get('sortOrder') || 'newest';
    
    // Determine sort direction based on sortOrder parameter
    const sortDirection = sortOrder === 'oldest' ? 1 : -1;

    const queries = await Query.find({})
      .populate('author', 'name email')
      .populate('department', 'departmentName')
      .sort({ createdAt: sortDirection });

    return Response.json(queries);
  } catch (error) {
    console.error('Error fetching queries:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}