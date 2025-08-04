// app/api/users/[id]/route.js
import dbConnect from "../../../../lib/dbConnect";
import { User } from "../../../../models";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const user = await User.findById(params.id).populate("queries");
    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json(user);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const user = await User.findByIdAndUpdate(params.id, body, { new: true });
    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json(user);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const user = await User.findByIdAndDelete(params.id);
    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json({ message: "User deleted" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
