export function clampWords(text, min = 50, max = 60) {
  // Gracefully handle null/undefined and non-string inputs
  if (text == null) return "";

  const normalized =
    typeof text === "string"
      ? text
      : Array.isArray(text)
      ? text.join(" ")
      : String(text);

  const trimmed = normalized.trim();
  if (trimmed.length === 0) return "";

  const words = trimmed.split(/\s+/);
  if (words.length <= max && words.length >= min) return trimmed;
  if (words.length < min) return trimmed;
  return words.slice(0, max).join(" ") + "…";
}


