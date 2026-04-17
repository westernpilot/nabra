/**
 * Azure Speech — set EXPO_PUBLIC_AZURE_SPEECH_KEY and EXPO_PUBLIC_AZURE_SPEECH_REGION
 * in `.env` and in EAS environment variables for production builds.
 */
export const AZURE_SPEECH_KEY = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY ?? "";
export const AZURE_SPEECH_REGION =
  process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION ?? "eastus";
