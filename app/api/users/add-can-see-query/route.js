// app/api/users/add-can-see-query/route.js
import dbConnect from "../../../api/lib/dbConnect";
import { User, Query } from "../../../../models";

export async function POST(request) {
  try {
    await dbConnect();
    
    const { userId, queryId } = await request.json();
    
    if (!userId || !queryId) {
      return Response.json({ 
        error: "Both userId and queryId are required",
        success: false 
      }, { status: 400 });
    }

    // Verify the query exists
    const query = await Query.findById(queryId);
    if (!query) {
      return Response.json({ 
        error: "Query not found",
        success: false 
      }, { status: 404 });
    }

    // Add query to user's can_see array if not already present
    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ 
        error: "User not found",
        success: false 
      }, { status: 404 });
    }

    // Check if query is already in can_see array
    if (user.can_see && user.can_see.includes(queryId)) {
      return Response.json({ 
        error: "Query already in user's dashboard",
        success: false 
      }, { status: 400 });
    }

    // Add query to can_see array
    if (!user.can_see) {
      user.can_see = [];
    }
    user.can_see.push(queryId);
    await user.save();

    // Increment impressions for the query
    query.impressions = (query.impressions || 1) + 1;
    await query.save();

    return Response.json({
      success: true,
      message: "Query added to your dashboard successfully",
      user: {
        _id: user._id,
        can_see: user.can_see
      }
    });

  } catch (error) {
    console.error("Error adding query to can_see:", error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}
