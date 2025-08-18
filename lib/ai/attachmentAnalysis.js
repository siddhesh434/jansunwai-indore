import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import exifr from "exifr";
import mime from "mime-types";

// Initialize AI clients dynamically when needed
let gemini = null;
let groq = null;

function initializeGemini() {
  console.log("Initializing Gemini client...");
  console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
  
  if (!gemini && process.env.GEMINI_API_KEY) {
    try {
      gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log("Gemini client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Gemini client:", error.message);
    }
  } else if (!process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY environment variable is not set");
  }
  return gemini;
}

function initializeGroq() {
  console.log("Initializing Groq client...");
  console.log("GROQ_API_KEY present:", !!process.env.GROQ_API_KEY);
  
  if (!groq && process.env.GROQ_API_KEY) {
    try {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      console.log("Groq client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Groq client:", error.message);
    }
  } else if (!process.env.GROQ_API_KEY) {
    console.log("GROQ_API_KEY environment variable is not set");
  }
  return groq;
}

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
  const geminiClient = initializeGemini();
  if (!geminiClient) {
    return "AI analysis not available - Gemini API key not configured.";
  }

  try {
    // Validate buffer
    if (!buffer || buffer.length === 0) {
      return "No image data provided for analysis.";
    }

    const base64Data = Buffer.from(buffer).toString("base64");
    console.log("Buffer size:", buffer.length, "Base64 length:", base64Data.length);
    
    // Check if file is too large for Gemini (max ~20MB for base64)
    if (base64Data.length > 20 * 1024 * 1024) {
      return "File too large for AI analysis. Please use a smaller image.";
    }
    
    // Try different models in order of preference
    let model;
    try {
      model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log("Using gemini-1.5-flash model");
    } catch (modelError) {
      console.log("Falling back to gemini-1.5-pro model");
      model = geminiClient.getGenerativeModel({ model: "gemini-1.5-pro" });
    }

    const metadataContext = buildMetadataContext(metadata);
    console.log("Metadata context:", metadataContext);
    console.log("Original metadata:", metadata);
    
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

    console.log("Gemini result structure:", {
      hasResponse: !!result.response,
      hasCandidates: !!result.response?.candidates,
      candidatesLength: result.response?.candidates?.length,
      hasContent: !!result.response?.candidates?.[0]?.content,
      hasParts: !!result.response?.candidates?.[0]?.content?.parts,
      partsLength: result.response?.candidates?.[0]?.content?.parts?.length,
      hasText: !!result.response?.candidates?.[0]?.content?.parts?.[0]?.text,
      textLength: result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.length
    });

    const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (responseText) {
      console.log("Gemini response text:", responseText.substring(0, 100) + "...");
      return responseText;
    } else {
      console.log("No valid response text found, result:", JSON.stringify(result, null, 2));
      return "No description available from AI.";
    }
  } catch (error) {
    console.error("Gemini analysis error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack
    });
    return `AI analysis failed - ${error.message}`;
  }
}

export async function summarizeWithGroq({ metadata, description, filename }) {
  const groqClient = initializeGroq();
  if (!groqClient) {
    return "AI summary not available - Groq API key not configured.";
  }

  try {
    const prompt = `You are analyzing a user attachment for a municipal complaint system.\n\nAttachment: ${filename}\nMetadata: ${JSON.stringify(metadata || {}, null, 2)}\nAI Description: ${description}\n\nWrite a single paragraph of 20 to 30 words summarizing the attachment content for municipal authorities. Incorporate useful metadata (camera, time, GPS, resolution) when available. Focus on actionable details relevant to municipal services.`;

    const completion = await groqClient.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 220,
    });

    console.log("Groq completion structure:", {
      hasChoices: !!completion.choices,
      choicesLength: completion.choices?.length,
      hasMessage: !!completion.choices?.[0]?.message,
      hasContent: !!completion.choices?.[0]?.message?.content,
      contentLength: completion.choices?.[0]?.message?.content?.length
    });

    const summaryText = completion.choices?.[0]?.message?.content;
    
    if (summaryText) {
      console.log("Groq summary text:", summaryText.substring(0, 100) + "...");
      return summaryText;
    } else {
      console.log("No valid summary text found, completion:", JSON.stringify(completion, null, 2));
      return "No summary generated from AI.";
    }
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


