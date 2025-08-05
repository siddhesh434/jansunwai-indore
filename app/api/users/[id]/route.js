// app/api/users/[id]/route.js
import dbConnect from "../../../../lib/dbConnect";
import { User } from "../../../../models";

export async function GET(request, context) {
  try {
    await dbConnect();

    const params = await context.params; // ✅ Await params directly
    const userId = params.id;

    const user = await User.findById(userId).populate("queries");
    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });

    return Response.json(user);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    await dbConnect();
    const params = await context.params; // ✅ Await params directly
    const userId = params.id;

    const body = await request.json();
    const user = await User.findByIdAndUpdate(userId, body, { new: true });
    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });

    return Response.json(user);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, context) {
  try {
    await dbConnect();
    const params = await context.params; // ✅ Await params directly
    const userId = params.id;

    const user = await User.findByIdAndDelete(userId);
    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });

    return Response.json({ message: "User deleted" });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
