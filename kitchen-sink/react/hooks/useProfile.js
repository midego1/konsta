import { useState, useEffect } from 'react';
import { supabase, getUserProfile, updateUserProfile } from '../lib/supabase';

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadProfile();
  }, [userId]);

  async function loadProfile() {
    try {
      setLoading(true);
      const data = await getUserProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(updates) {
    try {
      setSaving(true);
      setError(null);
      const updated = await updateUserProfile(userId, updates);
      setProfile(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return { profile, loading, saving, error, saveProfile, reload: loadProfile };
}
