const GEMINI_TEXT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const GEMINI_IMAGE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

export function getServerGeminiKey() {
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '').trim();
}

export async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function callGeminiText(apiKey, requestBody) {
  return callGemini(apiKey, GEMINI_TEXT_URL, requestBody);
}

export async function callGeminiImage(apiKey, requestBody) {
  return callGemini(apiKey, GEMINI_IMAGE_URL, requestBody);
}

async function callGemini(apiKey, url, requestBody) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.error?.message || 'Gemini request failed.');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => part?.text || '')
    .join('\n')
    .trim();
}

export function extractJsonObject(text) {
  const firstBrace = String(text).indexOf('{');
  const lastBrace = String(text).lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return '';
  }

  return String(text).slice(firstBrace, lastBrace + 1);
}

export function parseJsonFromGeminiText(text) {
  const jsonText = extractJsonObject(text);
  if (!jsonText) {
    return null;
  }

  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

export function inferCategory(value) {
  const text = String(value).toLowerCase();
  if (hasAny(text, ['cá', 'fish', 'salmon', 'ca kho', 'ca bong'])) return 'fish';
  if (hasAny(text, ['beef', 'pork', 'meat', 'thịt', 'thit', 'heo', 'bò', 'bo', 'patty'])) return 'meat';
  if (hasAny(text, ['milk', 'cheese', 'sữa', 'sua', 'butter'])) return 'dairy';
  if (hasAny(text, ['egg', 'trứng', 'trung'])) return 'egg';
  if (hasAny(text, ['rice', 'cơm', 'com', 'gao', 'gạo', 'bun', 'bread'])) return 'pantry';
  return 'vegetable';
}

export function parseQuantityValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const text = String(value || '').trim();
  if (!text) {
    return 1;
  }

  const mixedFraction = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedFraction) {
    return Number(mixedFraction[1]) + Number(mixedFraction[2]) / Number(mixedFraction[3]);
  }

  const fraction = text.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    return Number(fraction[1]) / Number(fraction[2]);
  }

  const numeric = Number(text.replace(/,/g, '.'));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
}

export function normalizeIngredientEntries(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((entry) => {
      const name = String(entry?.name || entry?.ingredient || '').trim();
      if (!name) {
        return null;
      }

      const requestedCategory = String(entry?.category || '').toLowerCase();
      const category = ['vegetable', 'meat', 'fish', 'dairy', 'pantry', 'egg'].includes(requestedCategory)
        ? requestedCategory
        : inferCategory(name);

      return {
        name,
        quantity: parseQuantityValue(entry?.quantity),
        unit: String(entry?.unit || 'item').trim() || 'item',
        category,
      };
    })
    .filter(Boolean)
    .slice(0, 20);
}

export function normalizeInstructionSteps(values) {
  const list = Array.isArray(values)
    ? values
    : String(values || '').split(/\n+/);

  return list
    .map((step) => String(step).trim().replace(/^\d+[.)-]?\s*/, ''))
    .filter(Boolean)
    .slice(0, 12);
}

export function normalizeRecipeLinks(values, title) {
  const links = (Array.isArray(values) ? values : [values])
    .map((value) => String(value || '').trim())
    .filter((value) => /^https?:\/\//i.test(value));

  const uniqueLinks = [...new Set(links)];
  if (uniqueLinks.length) {
    return uniqueLinks.slice(0, 3);
  }

  return [`https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} recipe`)}`];
}

export function extractGroundingLinks(metadata) {
  const chunks = metadata?.groundingChunks || [];
  const links = [];

  chunks.forEach((chunk) => {
    const uri = chunk?.web?.uri;
    if (!/^https?:\/\//i.test(String(uri || ''))) {
      return;
    }

    links.push({
      url: uri,
      title: String(chunk?.web?.title || uri).trim(),
    });
  });

  return uniqueObjectsByKey(links, 'url').slice(0, 6);
}

export function normalizeDetectedIngredients(values) {
  const list = Array.isArray(values)
    ? values
    : String(values || '')
      .split(/[;\n,]/)
      .map((value) => value.trim())
      .filter(Boolean);

  return [...new Set(list
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8))];
}

export function normalizeRecipeHints(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((entry) => ({
      title: titleCase(entry?.title || entry?.name || ''),
      summary: String(entry?.summary || '').trim(),
    }))
    .filter((entry) => entry.title)
    .slice(0, 3);
}

export function getInlineImageFromDataUrl(dataUrl, preferredMimeType = 'image/jpeg') {
  if (!String(dataUrl).startsWith('data:')) {
    return null;
  }

  const [meta, base64Data] = String(dataUrl).split(',');
  if (!meta || !base64Data) {
    return null;
  }

  const mimeMatch = meta.match(/^data:(.*?);base64$/i);
  return {
    mimeType: mimeMatch?.[1] || preferredMimeType,
    data: base64Data,
  };
}

export function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function uniqueObjectsByKey(values, key) {
  const seen = new Set();
  return values.filter((value) => {
    const marker = value?.[key];
    if (!marker || seen.has(marker)) {
      return false;
    }
    seen.add(marker);
    return true;
  });
}
