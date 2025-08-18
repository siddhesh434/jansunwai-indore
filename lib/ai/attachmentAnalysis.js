import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import exifr from "exifr";
import mime from "mime-types";

// Initialize AI clients only if API keys are available
let gemini = new GoogleGenerativeAI("AIzaSyAhds6xWuL1818QXqlM5KUlclBmelCeEnE");
let groq = new Groq({ apiKey: "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" });



export function inferMimeType(filename, providedType) {
  return (
    providedType ||
    (filename ? mime.lookup(filename) : null) ||
    "application/octet-stream"
  );
}


export async function extractMetadataFromBuffer(buffer, mimeType) {
  try {
    const base = {
      sizeBytes: buffer?.length || 0,
    };

    if (mimeType.startsWith("image/")) {
      try {
        const exifData = await exifr.parse(buffer, {
          gps: true,
          xmp: true,
          icc: true,
          iptc: true,
          jfif: true,
          ihdr: true,
          tiff: true,
          exif: true,
        });
        return { ...(exifData || {}), ...base };
      } catch (exifError) {
        // Fall through to basic metadata
        return base;
      }
    }

    return base;
  } catch {
    return {};
  }
}

export function buildMetadataContext(metadata) {
  if (!metadata) return "";
  let ctx = "";
  if (metadata.Make && metadata.Model) ctx += ` Camera: ${metadata.Make} ${metadata.Model}.`;
  if (metadata.DateTimeOriginal) ctx += ` Date taken: ${metadata.DateTimeOriginal}.`;
  if (metadata.ISO) ctx += ` ISO: ${metadata.ISO}.`;
  if (metadata.FNumber) ctx += ` F-stop: f/${metadata.FNumber}.`;
  if (metadata.ExposureTime) ctx += ` Exposure: ${metadata.ExposureTime}s.`;
  if (metadata.latitude && metadata.longitude) ctx += ` GPS: ${metadata.latitude}, ${metadata.longitude}.`;
  if (metadata.ExifImageWidth && metadata.ExifImageHeight) ctx += ` Resolution: ${metadata.ExifImageWidth}x${metadata.ExifImageHeight}.`;
  if (metadata.sizeBytes) ctx += ` Size: ${Math.round((metadata.sizeBytes || 0) / 1024)}KB.`;
  return ctx.trim();
}

export async function describeWithGemini({ buffer, mimeType, metadata }) {
  if (!gemini) {
    return "AI analysis not available - Gemini API key not configured.";
  }

  try {
    const base64Data = Buffer.from(buffer).toString("base64");
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

    const metadataContext = buildMetadataContext(metadata);
    let prompt = "";
    if (mimeType.startsWith("image/")) {
      prompt = `Describe this image in 20 to 30 words. Include visible details and any context relevant to a municipal complaint. ${metadataContext ? `Technical details:${metadataContext}` : ""}`;
    } else if (mimeType === "application/pdf") {
      prompt = `Summarize this PDF in 20 to 30 words. Focus on information relevant to a municipal complaint. ${metadataContext ? `File info:${metadataContext}` : ""}`;
    } else if (mimeType.startsWith("video/")) {
      prompt = `Describe what happens in this video in 20 to 30 words. Emphasize anything relevant to a municipal complaint. ${metadataContext ? `File info:${metadataContext}` : ""}`;
    } else {
      prompt = `Analyze this file in 20 to 30 words. Include information relevant to a municipal complaint. ${metadataContext ? `File info:${metadataContext}` : ""}`;
    }

    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType } },
      prompt,
    ]);

    return (
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No description available."
    );
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "AI analysis failed - please try again later.";
  }
}

export async function summarizeWithGroq({ metadata, description, filename }) {
  if (!groq) {
    return "AI summary not available - Groq API key not configured.";
  }

  try {
    const prompt = `You are analyzing a user attachment for a municipal complaint system.\n\nAttachment: ${filename}\nMetadata: ${JSON.stringify(metadata || {}, null, 2)}\nAI Description: ${description}\n\nWrite a single paragraph of 20 to 30 words summarizing the attachment content for municipal authorities. Incorporate useful metadata (camera, time, GPS, resolution) when available. Focus on actionable details relevant to municipal services.`;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 220,
    });

    return (
      completion.choices?.[0]?.message?.content || "No summary generated."
    );
  } catch (error) {
    console.error("Groq analysis error:", error);
    return "AI summary failed - please try again later.";
  }
}

export async function analyzeAttachmentBuffer({ buffer, filename, filetype }) {
  const mimeType = inferMimeType(filename, filetype);
  const metadata = await extractMetadataFromBuffer(buffer, mimeType);
  const description = await describeWithGemini({ buffer, mimeType, metadata });
  const summary = await summarizeWithGroq({ metadata, description, filename });
  return { mimeType, metadata, description, summary };
}


