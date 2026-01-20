import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActivities();

    // Subscribe to real-time updates
    const activitiesChannel = supabase
      .channel('activities-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activitiesChannel);
    };
  }, []);

  async function loadActivities() {
    try {
      setLoading(true);
      setError(null);

      // Fetch all active activities
      const { data, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('status', 'active')
        .order('activity_time', { ascending: true });

      if (activitiesError) throw activitiesError;

      // Extract lng/lat from PostGIS geometry using a separate query
      const { data: coordsData, error: coordsError } = await supabase.rpc('get_activity_coordinates');

      if (coordsError) {
        console.warn('Could not fetch coordinates:', coordsError);
      }

      // Merge coordinates with activities
      const activitiesWithCoords = data?.map(activity => {
        const coords = coordsData?.find(c => c.id === activity.id);
        return {
          ...activity,
          longitude: coords?.longitude,
          latitude: coords?.latitude,
        };
      }) || [];

      console.log('Loaded activities from database:', activitiesWithCoords);
      setActivities(activitiesWithCoords);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { activities, loading, error, reload: loadActivities };
}
