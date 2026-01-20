import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getUserThemePreference, updateUserThemePreference } from '../lib/supabase';

/**
 * Custom hook for managing theme (dark/light mode) with dual persistence
 * - localStorage: Immediate access, prevents flash on page load
 * - Supabase: Cross-device sync for authenticated users
 */
export function useTheme() {
  const { user } = useAuth();

  // Initialize theme from localStorage (synchronous, fast)
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  const [loading, setLoading] = useState(true);

  // Load theme from Supabase on mount (if authenticated)
  useEffect(() => {
    async function loadThemeFromSupabase() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const supabaseTheme = await getUserThemePreference(user.id);
        if (supabaseTheme && supabaseTheme !== theme) {
          // Supabase takes precedence over localStorage for authenticated users
          setTheme(supabaseTheme);
        }
      } catch (error) {
        console.error('Failed to load theme from Supabase:', error);
      } finally {
        setLoading(false);
      }
    }

    loadThemeFromSupabase();
  }, [user?.id]); // Only run when user changes

  // Debounced sync to Supabase (2 seconds after theme change)
  useEffect(() => {
    if (!user?.id || !theme) return;

    const timer = setTimeout(async () => {
      try {
        await updateUserThemePreference(user.id, theme);
      } catch (error) {
        // Silent failure - localStorage still works
        console.error('Failed to sync theme to Supabase:', error);
      }
    }, 2000);

    // Cleanup: cancel pending sync if component unmounts or theme changes again
    return () => clearTimeout(timer);
  }, [theme, user?.id]);

  // Set theme with immediate localStorage update and DOM manipulation
  const setTheme = useCallback((newTheme) => {
    // Update localStorage immediately (synchronous, fast)
    localStorage.setItem('theme', newTheme);

    // Update DOM class for Tailwind dark mode
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update state (triggers Supabase sync via useEffect)
    setThemeState(newTheme);
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    loading,
  };
}
