// app/api/similar-queries/route.js
import dbConnect from "../../api/lib/dbConnect";
import { Query } from "../../../models";

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const address = searchParams.get("address");
    const excludeUserId = searchParams.get("excludeUserId"); // Exclude user's own queries
    
    if (!departmentId) {
      return Response.json({ error: "Department ID is required" }, { status: 400 });
    }

    // Build query conditions
    const conditions = {
      department: departmentId,
      status: { $ne: "resolved" } // Only show active queries
    };

    // Add address filter if provided
    if (address && address.trim()) {
      // Use case-insensitive search for address
      conditions.address = { 
        $regex: address.trim(), 
        $options: 'i' 
      };
    }

    // Exclude user's own queries if userId provided
    if (excludeUserId) {
      conditions.author = { $ne: excludeUserId };
    }

    // Find similar queries
    const similarQueries = await Query.find(conditions)
      .populate('author', 'name')
      .populate('department', 'departmentName')
      .sort({ createdAt: -1 })
      .limit(5); // Limit to 5 most recent similar queries

    return Response.json({
      success: true,
      similarQueries,
      count: similarQueries.length
    });

  } catch (error) {
    console.error("Error finding similar queries:", error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}
