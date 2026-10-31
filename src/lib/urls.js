// Shared link helpers so every URL in the app resolves to a real destination.
export function normalizeUrl(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

// Turn any phone number into a dialable tel: link.
export function telHref(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}