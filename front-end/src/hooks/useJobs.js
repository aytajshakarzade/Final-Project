import { useCallback, useEffect, useState } from 'react';
import { jobService } from '../services/jobService';

export function useJobs(params) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getAll(params);
      // Support both paginated and plain array responses
      setJobs(Array.isArray(data) ? data : (data?.items ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const createJob = useCallback(async (data) => {
    const created = await jobService.create(data);
    setJobs((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateJob = useCallback(async (id, data) => {
    const updated = await jobService.update(id, data);
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
    return updated;
  }, []);

  const removeJob = useCallback(async (id) => {
    await jobService.remove(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  return { jobs, loading, error, refetch: fetchJobs, createJob, updateJob, removeJob };
}
