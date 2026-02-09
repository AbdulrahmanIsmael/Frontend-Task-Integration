"use client";

import { I_languageResponse } from "@/lib/types/basic-settings";
import { getLanguages } from "@/lib/api/basic-settings";
import useData from "@/hooks/use-data";

const useLanguages = () => {
  const { data, error, loading } = useData<I_languageResponse>(getLanguages);

  return { languages: data, langLoading: loading, langError: error };
};

export { useLanguages };
