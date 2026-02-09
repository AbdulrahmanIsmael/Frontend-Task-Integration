"use client";

import { I_voiceResponse } from "@/lib/types/basic-settings";
import { getVoices } from "@/lib/api/basic-settings";
import useData from "@/hooks/use-data";

const useVoices = () => {
  const { data, error, loading } = useData<I_voiceResponse>(getVoices);

  return { voices: data, voicesLoading: loading, voicesError: error };
};

export { useVoices };
