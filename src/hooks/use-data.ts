"use client";

import { useEffect, useState } from "react";

const useData = <T>(getData: () => Promise<T[]>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);

      try {
        const response = await getData();
        setData(response);
      } catch {
        setError(true);
        console.error("Something went wrong, request failed!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getData]);

  return { data, loading, error };
};

export default useData;
