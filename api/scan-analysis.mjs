import {
  callGeminiImage,
  extractGeminiText,
  getInlineImageFromDataUrl,
  getServerGeminiKey,
  jsonResponse,
  normalizeDetectedIngredients,
  normalizeRecipeHints,
  parseJsonBody,
  parseJsonFromGeminiText,
} from './_lib/gemini.mjs';

export async function POST(request) {
  const apiKey = getServerGeminiKey();
  if (!apiKey) {
    return jsonResponse(503, { error: 'Server is missing GEMINI_API_KEY. Add it in Vercel Project Settings > Environment Variables, then redeploy.' });
  }

  const body = await parseJsonBody(request);
  const imageDataUrl = String(body?.imageDataUrl || '').trim();
  if (!imageDataUrl) {
    return jsonResponse(400, { error: 'imageDataUrl is required.' });
  }

  const inlineData = getInlineImageFromDataUrl(imageDataUrl, String(body?.mimeType || 'image/jpeg'));
  if (!inlineData) {
    return jsonResponse(400, { error: 'Invalid image data.' });
  }

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: [
              'Analyze this single image of ingredients, groceries, or leftovers.',
              'Return JSON only with this exact shape:',
              '{"ingredients":["ingredient"],"recipes":[{"title":"recipe title","summary":"short summary"}]}',
              'Rules:',
              '- Detect at most 8 clear ingredients or packaged foods.',
              '- Use short generic English names.',
              '- Omit anything uncertain.',
              '- Suggest up to 3 recipes that fit the visible ingredients.',
              '- No markdown and no extra explanation.',
            ].join('\n'),
          },
          {
            inlineData,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.15,
      topP: 0.8,
      maxOutputTokens: 420,
    },
  };

  try {
    const payload = await callGeminiImage(apiKey, requestBody);
    const text = extractGeminiText(payload);
    const parsed = parseJsonFromGeminiText(text);
    if (!parsed) {
      return jsonResponse(502, { error: 'Gemini returned an unreadable scan payload.' });
    }

    return jsonResponse(200, {
      ingredients: normalizeDetectedIngredients(parsed.ingredients),
      recipeHints: normalizeRecipeHints(parsed.recipes),
      source: 'gemini',
    });
  } catch (error) {
    return jsonResponse(error?.status || 502, {
      error: error?.message || 'Gemini scan analysis failed.',
    });
  }
}
