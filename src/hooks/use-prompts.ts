"use client";

import { I_promptResponse } from "@/lib/types/basic-settings";
import { getPrompts } from "@/lib/api/basic-settings";
import useData from "@/hooks/use-data";

const usePrompts = () => {
  const { data, error, loading } = useData<I_promptResponse>(getPrompts);

  return { prompts: data, promptsLoading: loading, promptsError: error };
};

export { usePrompts };
