// app/api/queries/route.js
import dbConnect from "../../../lib/dbConnect";
import { Query, User, Department } from "../../../models";
import mongoose from "mongoose";
import { promises as fs } from "fs";
import path from "path";
import { scoreUrgency } from "../../../lib/ai/queryUrgency";

// Ensure Node.js runtime for fs access
export const runtime = "nodejs";

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

    const contentType = request.headers.get("content-type") || "";

    let payload = {};
    let attachments = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), "public", "upload");
      await fs.mkdir(uploadDir, { recursive: true });

      // Collect files (input name: attachments)
      const files = formData.getAll("attachments");
      for (const file of files) {
        if (!file || typeof file === "string") continue;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const ext = path.extname(file.name) || "";
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "_");
        const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${baseName}${ext}`;
        const filePath = path.join(uploadDir, uniqueName);
        await fs.writeFile(filePath, buffer);

        attachments.push({
          filename: uniqueName,
          originalName: file.name,
          mimetype: file.type || "application/octet-stream",
          size: buffer.length,
          url: `/upload/${uniqueName}`,
        });
      }

      // Extract non-file fields
      payload = {
        title: formData.get("title") || "",
        description: formData.get("description") || "",
        address: formData.get("address") || "",
        author: formData.get("author"),
        department: formData.get("department"),
        status: formData.get("status") || undefined,
        // optional: client-provided attachment analyses
        attachmentAnalyses: (() => {
          const raw = formData.get("attachmentAnalyses");
          if (!raw) return undefined;
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
          } catch {}
          return undefined;
        })(),
      };
    } else {
      // JSON fallback
      const body = await request.json();
      payload = body || {};
      attachments = body?.attachments || [];
    }

    // Basic validation
    if (!payload.title) {
      return Response.json({ error: "Missing title" }, { status: 400 });
    }

    // Normalize ids
    const authorId = typeof payload.author === "string" && mongoose.Types.ObjectId.isValid(payload.author)
      ? new mongoose.Types.ObjectId(payload.author)
      : undefined;
    const departmentId = typeof payload.department === "string" && mongoose.Types.ObjectId.isValid(payload.department)
      ? new mongoose.Types.ObjectId(payload.department)
      : undefined;

    // Compute urgency using AI (best-effort; do not block creation if fails)
    let urgency = null;
    try {
      urgency = await scoreUrgency({
        title: payload.title,
        description: payload.description,
        attachmentAnalyses: Array.isArray(payload.attachmentAnalyses)
          ? payload.attachmentAnalyses
          : [],
      });
    } catch {}

    const query = await Query.create({
      title: payload.title,
      description: payload.description || "",
      address: payload.address || "",
      author: authorId,
      department: departmentId,
      status: payload.status || undefined,
      attachments: attachments || [],
      attachmentAnalyses: Array.isArray(payload.attachmentAnalyses)
        ? payload.attachmentAnalyses
        : [],
      urgencyScore: urgency?.score,
      urgencyLabel: urgency?.label,
      urgencyReason: urgency?.reason,
    });

    // Add query ID to user's queries array
    if (authorId) {
      try {
        await User.findByIdAndUpdate(
          authorId,
          { $push: { queries: query._id } },
          { new: true }
        );
      } catch {}
    }

    // Add query ID to department's queries array
    if (departmentId) {
      try {
        await Department.findByIdAndUpdate(
          departmentId,
          { $push: { queries: query._id } },
          { new: true }
        );
      } catch {}
    }

    return Response.json(query, { status: 201 });
  } catch (error) {
    console.error("Error creating query:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}
