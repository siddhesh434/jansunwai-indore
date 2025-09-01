// app/api/conversations/[queryId]/route.js
import dbConnect from "../../lib/dbConnect";
import { Query, User, DepartmentMember } from "../../../../models";

export async function GET(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const includeAuthorDetails = searchParams.get("includeAuthorDetails") === "true";

    const query = await Query.findById(params.queryId)
      .populate("author", "name username")
      .populate("department", "departmentName")
      .select("objects status title description address createdAt updatedAt");

    if (!query) {
      return Response.json(
        { error: "Query not found" },
        { status: 404 }
      );
    }

    let conversations = query.objects || [];
    
    // If requested, populate author details for each conversation
    if (includeAuthorDetails) {
      const authorIds = conversations
        .map(conv => conv.authorId)
        .filter(id => id);
      
      const [users, deptMembers] = await Promise.all([
        User.find({ _id: { $in: authorIds } }).select("name username"),
        DepartmentMember.find({ _id: { $in: authorIds } }).select("name username")
      ]);

      const userMap = {};
      users.forEach(user => userMap[user._id.toString()] = user);
      deptMembers.forEach(member => userMap[member._id.toString()] = member);

      conversations = conversations.map(conv => ({
        ...conv.toObject(),
        authorDetails: userMap[conv.authorId.toString()] || null
      }));
    }

    return Response.json({
      success: true,
      conversations,
      query: {
        id: query._id,
        title: query.title,
        description: query.description,
        address: query.address,
        status: query.status,
        createdAt: query.createdAt,
        updatedAt: query.updatedAt,
        author: query.author,
        department: query.department,
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

export async function POST(request, context) {
  try {
    await dbConnect();
    const params = await context.params;
    const body = await request.json();
    const { message, authorId, authorType, attachments } = body;

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
      attachments: attachments || [],
    };

    // Add thread to query
    const query = await Query.findByIdAndUpdate(
      params.queryId,
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
      await Query.findByIdAndUpdate(params.queryId, { status: "in_progress" });
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
