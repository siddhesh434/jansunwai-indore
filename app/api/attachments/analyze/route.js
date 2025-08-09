import { NextResponse } from "next/server";
import { analyzeAttachmentBuffer } from "@/lib/ai/attachmentAnalysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "File is required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name || "attachment";
    const filetype = file.type || undefined;

    const analysis = await analyzeAttachmentBuffer({ buffer, filename, filetype });

    return NextResponse.json({ success: true, filename, analysis });
  } catch (error) {
    console.error("Attachment analyze error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze attachment" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "healthy", route: "attachments/analyze" });
}


