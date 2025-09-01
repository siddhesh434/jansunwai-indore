// app/api/queries/[id]/conversations/route.js
import dbConnect from "../../../lib/dbConnect";
import { Query } from "../../../../../models";

export async function POST(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const body = await request.json();
    const { message, authorId, authorType } = body;

    if (!message || !authorId || !authorType) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate authorType
    if (!["User", "DepartmentMember"].includes(authorType)) {
      return Response.json(
        { error: "Invalid author type" },
        { status: 400 }
      );
    }

    // Create new thread object
    const newThread = {
      message,
      authorType,
      authorId,
      timestamp: new Date(),
    };

    // Add thread to query
    const query = await Query.findByIdAndUpdate(
      params.id,
      { $push: { objects: newThread } },
      { new: true }
    ).populate(["author", "department"]);

    if (!query) {
      return Response.json(
        { error: "Query not found" },
        { status: 404 }
      );
    }

    // Update query status to in_progress if it was open and department member is responding
    if (authorType === "DepartmentMember" && query.status === "open") {
      await Query.findByIdAndUpdate(params.id, { status: "in_progress" });
      query.status = "in_progress";
    }

    return Response.json({
      success: true,
      query,
      newThread,
    });
  } catch (error) {
    console.error("Error adding conversation:", error);
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

    const query = await Query.findById(params.id)
      .populate(["author", "department"])
      .select("objects status title description address createdAt updatedAt");

    if (!query) {
      return Response.json(
        { error: "Query not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      conversations: query.objects || [],
      query: {
        id: query._id,
        title: query.title,
        description: query.description,
        address: query.address,
        status: query.status,
        createdAt: query.createdAt,
        updatedAt: query.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
