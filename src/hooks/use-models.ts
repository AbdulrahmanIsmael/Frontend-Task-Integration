"use client";

import { I_modelResponse } from "@/lib/types/basic-settings";
import { getModels } from "@/lib/api/basic-settings";
import useData from "@/hooks/use-data";

const useModels = () => {
  const { data, error, loading } = useData<I_modelResponse>(getModels);

  return { models: data, modelsLoading: loading, modelsError: error };
};

export { useModels };
