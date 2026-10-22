const text = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
};

export const loadJson = async (url) => JSON.parse(await text(url));
export const loadText = text;

export async function loadOptionalJson(url, fallback = {}) {
  try {
    return await loadJson(url);
  } catch {
    return fallback;
  }
}
