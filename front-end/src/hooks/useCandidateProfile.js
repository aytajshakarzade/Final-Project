import { useCallback, useEffect, useState } from 'react';
import { candidateService } from '../services/candidateService';
import { useAuth } from './useAuth';

/**
 * Returns the CandidateDto linked to the current authenticated user.
 * If no profile exists yet, `profile` is null and `ensureProfile` can
 * be called with optional profile data to create one.
 */
export function useCandidateProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await candidateService.getAll();
      const items = Array.isArray(data) ? data : (data?.items ?? []);
      const mine = items.find((c) => c.userId === user.id) || null;
      setProfile(mine);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /**
   * Create a candidate profile if one doesn't already exist.
   * Returns the existing or newly created profile.
   */
  const ensureProfile = useCallback(async (extra = {}) => {
    if (profile) return profile;
    if (!user?.id) throw new Error('Not authenticated');
    const created = await candidateService.create({
      userId: user.id,
      resumeUrl: '',
      skills: '',
      education: '',
      experience: '',
      ...extra,
    });
    setProfile(created);
    return created;
  }, [profile, user?.id]);

  const updateProfile = useCallback(async (data) => {
    if (!profile?.id) throw new Error('No candidate profile');
    await candidateService.update(profile.id, data);
    setProfile((p) => ({ ...p, ...data }));
  }, [profile]);

  return { profile, loading, error, refetch: fetchProfile, ensureProfile, updateProfile };
}
