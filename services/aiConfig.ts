/**
 * OpenAI API key — set locally in `.env` and in EAS (Project → Environment variables).
 * Never commit real keys; use `.env` (gitignored) or EAS secrets.
 */
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "";
