// app/api/queries/top-urgent/route.js
import dbConnect from "../../lib/dbConnect";
import { Query, User, Department } from "../../../../models";

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch top 3 queries with highest urgency scores, excluding resolved queries and those without urgency scores
    const topQueries = await Query.find({ 
      urgencyScore: { $exists: true, $ne: null },
      status: { $ne: "resolved" }
    })
    .sort({ urgencyScore: -1 })
    .limit(3)
    .populate([
      { path: "author", select: "name username" },
      { path: "department", select: "departmentName" }
    ])
    .select("title description address status urgencyScore urgencyLabel urgencyReason createdAt");

    return Response.json(topQueries);
  } catch (error) {
    console.error("Error fetching top urgent queries:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
