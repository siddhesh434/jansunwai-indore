import Groq from "groq-sdk";

// Initialize Groq client dynamically when needed
let groq = null;

function initializeGroq() {
  console.log("Initializing Groq client (queryUrgency)...");
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

export async function scoreUrgency({ title, description, attachmentAnalyses }) {
  const groqClient = initializeGroq();
  if (!groqClient) {
    // Fallback to basic urgency scoring when Groq is not available
    const text = `${title} ${description}`.toLowerCase();
    let score = 3; // Default medium
    let label = "Medium";
    let reason = "AI analysis not available - using basic scoring";

    // Basic keyword-based scoring
    if (text.includes("emergency") || text.includes("urgent") || text.includes("critical") || text.includes("fire") || text.includes("flood")) {
      score = 5;
      label = "Critical";
      reason = "Contains emergency/critical keywords";
    } else if (text.includes("water") || text.includes("electricity") || text.includes("gas") || text.includes("sewage")) {
      score = 4;
      label = "High";
      reason = "Essential service disruption";
    } else if (text.includes("road") || text.includes("street") || text.includes("traffic") || text.includes("parking")) {
      score = 3;
      label = "Medium";
      reason = "Infrastructure issue";
    } else if (text.includes("garbage") || text.includes("clean") || text.includes("maintenance")) {
      score = 2;
      label = "Low";
      reason = "General maintenance issue";
    }

    return { score, label, reason };
  }

  try {
    const prompt = `You are an assistant for a municipal complaint system. Assess the urgency of the complaint.


Title: ${title}
Description: ${description}
Attachment Analyses: ${JSON.stringify(attachmentAnalyses || [], null, 2)}

Return a strict JSON with: { "score": 1-5 integer (1 lowest, 5 highest), "label": one of ["Low","Medium","High","Critical"], "reason": short one-sentence reason }.
Rules: Consider public safety, health risk, essential services disruption (water/electricity), environmental hazards, vulnerable groups impact, scale, and immediacy.
`;

    const completion = await groqClient.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 160,
    });

    const text = completion.choices?.[0]?.message?.content || "{}";
    try {
      const parsed = JSON.parse(text.trim());
      const score = Math.max(1, Math.min(5, parseInt(parsed.score, 10) || 3));
      const label = ["Low", "Medium", "High", "Critical"].includes(parsed.label)
        ? parsed.label
        : score >= 5
        ? "Critical"
        : score >= 4
        ? "High"
        : score >= 3
        ? "Medium"
        : "Low";
      const reason = String(parsed.reason || "");
      return { score, label, reason };
    } catch {
      return { score: 3, label: "Medium", reason: "Defaulted due to parsing error" };
    }
  } catch (error) {
    console.error("Groq urgency scoring error:", error);
    return { score: 3, label: "Medium", reason: "AI analysis failed - using default scoring" };
  }
}

