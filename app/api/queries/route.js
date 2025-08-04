// app/api/queries/route.js
import dbConnect from "../../../lib/dbConnect";
import { Query } from "../../../models";

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
    const query = await Query.create(body);
    return Response.json(query, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
