// Alternative public instances to try
const ALTERNATIVE_INSTANCES = [
  "https://translate.astian.org/translate",
  "https://translate.terraprint.co/translate", 
  "https://libretranslate.com/translate"
];

import fetch from "node-fetch";

const tryTranslation = async (instance, text, sourceLang = "en", targetLang = "hi") => {
  try {
    console.log(`\n🔄 Trying instance: ${instance}`);
    
    const res = await fetch(instance, {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text"
      }),
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    const responseText = await res.text();
    
    if (res.status === 200) {
      try {
        const data = JSON.parse(responseText);
        if (data.translatedText) {
          console.log(`✅ Success with ${instance}`);
          console.log(`Translation: "${data.translatedText}"`);
          return data.translatedText;
        }
      } catch (e) {
        console.log(`❌ Invalid JSON from ${instance}`);
      }
    } else {
      console.log(`❌ Failed with status ${res.status}: ${responseText.substring(0, 100)}`);
    }
  } catch (err) {
    console.log(`❌ Network error with ${instance}: ${err.message}`);
  }
  return null;
};

const runAlternatives = async () => {
  const text = "Hello World";
  console.log(`🌍 Translating: "${text}" from English to Hindi`);
  
  for (const instance of ALTERNATIVE_INSTANCES) {
    const result = await tryTranslation(instance, text);
    if (result) {
      console.log(`\n🎉 Found working instance: ${instance}`);
      break;
    }
  }
};

runAlternatives();