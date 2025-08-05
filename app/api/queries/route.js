// app/api/queries/route.js
import dbConnect from "../../../lib/dbConnect";
import { Query, User, Department } from "../../../models";

export async function GET() {
  try {
    await dbConnect();
    const queries = await Query.find({}).populate(["author", "department"]);
    return Response.json(queries);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Create the query
    const query = await Query.create(body);
    console.log("Query created:", query);
    console.log("Request body:", body);

    // Add query ID to user's queries array
    if (body.author) {
      await User.findByIdAndUpdate(
        body.author,
        { $push: { queries: query._id } },
        { new: true }
      );
      console.log("Query ID added to user's queries array");
    }

    // Add query ID to department's queries array
    if (body.department) {
      await Department.findByIdAndUpdate(
        body.department,
        { $push: { queries: query._id } },
        { new: true }
      );
      console.log("Query ID added to department's queries array");
    }

    return Response.json(query, { status: 201 });
  } catch (error) {
    console.error("Error creating query:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}
