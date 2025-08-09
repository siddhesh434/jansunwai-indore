import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import mime from "mime-types";
import { analyzeAttachmentBuffer } from "@/lib/ai/attachmentAnalysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { filename, originalName, mimetype } = await request.json();
    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { success: false, error: "filename is required" },
        { status: 400 }
      );
    }

    // Prevent path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "upload", safeName);

    let buffer;
    try {
      buffer = await fs.readFile(filePath);
    } catch {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    const detectedType = mimetype || mime.lookup(filePath) || "application/octet-stream";

    const analysis = await analyzeAttachmentBuffer({
      buffer,
      filename: originalName || safeName,
      filetype: detectedType,
    });

    return NextResponse.json({ success: true, filename: safeName, analysis });
  } catch (error) {
    console.error("analyze-existing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze existing attachment" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "healthy", route: "attachments/analyze-existing" });
}


