// app/api/users/route.js
import dbConnect from "../../../lib/dbConnect";
import { User } from "../../../models";

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}).populate("queries");
    return Response.json(users);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const user = await User.create(body);
    return Response.json(user, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
