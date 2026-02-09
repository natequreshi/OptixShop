import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export function useApi<T>(url: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!url) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    api.get<T>(url)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [url, ...deps]);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, reload, setData };
}
