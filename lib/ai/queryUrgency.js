import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function scoreUrgency({ title, description, attachmentAnalyses }) {
  const prompt = `You are an assistant for a municipal complaint system. Assess the urgency of the complaint.

Title: ${title}
Description: ${description}
Attachment Analyses: ${JSON.stringify(attachmentAnalyses || [], null, 2)}

Return a strict JSON with: { "score": 1-5 integer (1 lowest, 5 highest), "label": one of ["Low","Medium","High","Critical"], "reason": short one-sentence reason }.
Rules: Consider public safety, health risk, essential services disruption (water/electricity), environmental hazards, vulnerable groups impact, scale, and immediacy.`;

  const completion = await groq.chat.completions.create({
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
}


