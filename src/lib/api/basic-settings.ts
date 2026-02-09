import {
  I_languageResponse,
  I_modelResponse,
  I_promptResponse,
  I_voiceResponse,
} from "../types/basic-settings";

import { getData } from "@/lib/api/client";

export async function getLanguages(): Promise<I_languageResponse[]> {
  const languagesResponse = await getData<I_languageResponse[]>("languages");

  return languagesResponse;
}

export async function getVoices(): Promise<I_voiceResponse[]> {
  const voicesResponse = await getData<I_voiceResponse[]>("voices");

  return voicesResponse;
}

export async function getPrompts(): Promise<I_promptResponse[]> {
  const promptsResponse = await getData<I_promptResponse[]>("prompts");

  return promptsResponse;
}

export async function getModels(): Promise<I_modelResponse[]> {
  const modelsResponse = await getData<I_modelResponse[]>("models");

  return modelsResponse;
}
