require("dotenv").config();
const fs = require("fs");
const fetch = require("node-fetch");

async function testGemini() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY not found in .env");
        return;
    }

    const filePath = "demo.jpg"; // Change to your test image
    const imageBase64 = fs.readFileSync(filePath).toString("base64");

    console.log("🔍 Sending image to Gemini Vision...");

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Describe this image in detail." },
                        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
                    ]
                }]
            })
        }
    );

    const data = await res.json();
    console.log("📄 Raw Gemini response:", JSON.stringify(data, null, 2));

    const description = data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ No description found.";
    console.log("\n✅ Gemini Vision Description:", description);
}

testGemini();
