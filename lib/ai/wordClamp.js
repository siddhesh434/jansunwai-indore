export function clampWords(text, min = 50, max = 60) {
  if (!text) return text;
  const words = text.trim().split(/\s+/);
  if (words.length <= max && words.length >= min) return text.trim();
  if (words.length < min) return text.trim();
  return words.slice(0, max).join(" ") + "…";
}


