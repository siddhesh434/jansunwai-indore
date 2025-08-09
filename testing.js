require("dotenv").config();
const fs = require("fs");
const path = require("path");
const exifr = require("exifr");
const mime = require("mime-types");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGeminiDescription(filePath, mimeType) {
  const data = fs.readFileSync(filePath).toString("base64");
  const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

  let prompt = "";
  if (mimeType.startsWith("image/")) prompt = "Describe this image in detail.";
  else if (mimeType === "application/pdf") prompt = "Summarize the contents of this PDF file.";
  else if (mimeType.startsWith("video/")) prompt = "Describe what is happening in this video.";
  else prompt = "Analyze this file.";

  const result = await model.generateContent([
    { inlineData: { data, mimeType } },
    prompt,
  ]);

  return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No description available.";
}

async function getMetadata(filePath, mimeType) {
  if (mimeType.startsWith("image/")) {
    return (await exifr.parse(filePath)) || {};
  }
  const stats = fs.statSync(filePath);
  return { sizeBytes: stats.size, modified: stats.mtime };
}

async function summarizeWithGroq(metadata, description) {
  const prompt = `
  You are given:
  1. File metadata: ${JSON.stringify(metadata, null, 2)}
  2. AI description: ${description}

  Summarize this into a short but detailed report including:
  - Content overview
  - Possible context or location if available
  - Notable technical or contextual details
  `;

  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0]?.message?.content || "No summary generated.";
}

(async () => {
  const filePath = path.join(__dirname, process.argv[2] || "public/upload/demo.jpg");
  const mimeType = mime.lookup(filePath) || "application/octet-stream";

  console.log(`📂 Analyzing file: ${filePath} (${mimeType})`);

  console.log("📸 Extracting metadata...");
  const metadata = await getMetadata(filePath, mimeType);

  console.log("🔍 Getting Gemini description...");
  const description = await getGeminiDescription(filePath, mimeType);

  console.log("🧠 Summarizing with Groq...");
  const summary = await summarizeWithGroq(metadata, description);

  console.log("\n=== FINAL REPORT ===");
  console.log(JSON.stringify({ metadata, description, summary }, null, 2));
})();
