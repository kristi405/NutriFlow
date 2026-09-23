// Free tier: Google AI Studio (ai.google.dev) — set GEMINI_API_KEY in .env.
// Switching to the paid tier later is just changing GEMINI_MODEL/GEMINI_API_KEY
// (or the request URL, for Vertex AI) — nothing else in this file needs to change.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ANALYSIS_PROMPT = `You are a nutrition-focused lab report analyst.
Read the attached PDF lab report and respond with STRICT JSON only, no markdown, matching this shape:
{
  "summary": "2-3 sentence plain-language overview",
  "markers": [
    { "name": "string", "value": "string", "unit": "string", "referenceRange": "string", "status": "normal" | "low" | "high" }
  ],
  "recommendations": ["short actionable nutrition recommendation", "..."]
}
If a value can't be read, omit that marker rather than guessing. This is not medical advice — keep recommendations general and food/nutrition-focused, not diagnostic.`;

/** Sends a lab-report PDF to Gemini and returns the parsed { summary, markers, recommendations }. */
async function analyzeLabReportPdf(pdfBuffer) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: ANALYSIS_PROMPT }, { inlineData: { mimeType: 'application/pdf', data: pdfBuffer.toString('base64') } }]
      }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no content');

  return JSON.parse(text);
}

module.exports = { analyzeLabReportPdf };
