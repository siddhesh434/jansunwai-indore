// app/api/queries/[id]/feedback/route.js
import dbConnect from "../../../../../lib/dbConnect";
import { Query } from "../../../../../models";

export async function POST(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const queryId = params.id;
    
    const body = await request.json();
    const { rating, description } = body;

    // Validate required fields
    if (!rating || !description) {
      return Response.json(
        { error: "Rating and description are required" },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return Response.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate description length
    if (description.length > 500) {
      return Response.json(
        { error: "Description must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Find the query and check if it's resolved
    const query = await Query.findById(queryId);
    if (!query) {
      return Response.json(
        { error: "Query not found" },
        { status: 404 }
      );
    }

    if (query.status !== "resolved") {
      return Response.json(
        { error: "Feedback can only be submitted for resolved queries" },
        { status: 400 }
      );
    }

    // Check if feedback already exists
    if (query.feedback) {
      return Response.json(
        { error: "Feedback has already been submitted for this query" },
        { status: 400 }
      );
    }

    // Update query with feedback
    console.log("Updating query with feedback:", { queryId, rating, description });
    
    const updatedQuery = await Query.findByIdAndUpdate(
      queryId,
      {
        feedback: {
          rating,
          description,
          submittedAt: new Date()
        }
      },
      { new: true }
    ).populate(["author", "department"]);

    console.log("Updated query result:", updatedQuery);

    const response = {
      success: true,
      query: updatedQuery,
      message: "Feedback submitted successfully"
    };
    
    console.log("Updated query feedback:", updatedQuery.feedback);
    
    return Response.json(response);

  } catch (error) {
    console.error("Error submitting feedback:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const queryId = params.id;

    const query = await Query.findById(queryId)
      .populate(["author", "department"])
      .select("feedback status title");

    if (!query) {
      return Response.json(
        { error: "Query not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      feedback: query.feedback || null,
      status: query.status,
      title: query.title
    });

  } catch (error) {
    console.error("Error fetching feedback:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
