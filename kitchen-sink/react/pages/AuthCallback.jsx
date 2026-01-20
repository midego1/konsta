import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, Block, Preloader } from 'konsta/react';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // With HashRouter, we need to parse the URL differently
        // The URL might be: http://localhost:3000/#access_token=...&refresh_token=...
        // Or: http://localhost:3000/?access_token=...&refresh_token=...#/auth/callback

        let accessToken = null;
        let refreshToken = null;
        let type = null;

        // Try to get tokens from the hash fragment first
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
          // Extract the part after the first '#'
          const hashString = hash.substring(1);
          // Check if it contains another route path
          const parts = hashString.split('?');
          if (parts.length > 1) {
            // Tokens are in query string after route
            const params = new URLSearchParams(parts[1]);
            accessToken = params.get('access_token');
            refreshToken = params.get('refresh_token');
            type = params.get('type');
          } else {
            // Tokens might be directly in hash or after route
            const tokenString = hashString.includes('/auth/callback')
              ? hashString.split('/auth/callback')[1].substring(1) // Remove leading '#' or '?'
              : hashString;
            const params = new URLSearchParams(tokenString);
            accessToken = params.get('access_token');
            refreshToken = params.get('refresh_token');
            type = params.get('type');
          }
        }

        // If not in hash, try query parameters
        if (!accessToken) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get('access_token');
          refreshToken = searchParams.get('refresh_token');
          type = searchParams.get('type');
        }

        console.log('Auth callback - URL:', window.location.href);
        console.log('Auth callback - Hash:', window.location.hash);
        console.log('Auth callback - Search:', window.location.search);
        console.log('Auth callback - Tokens found:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

        if (type === 'recovery') {
          // Handle password recovery
          navigate('/reset-password');
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          if (data.session) {
            // Successfully authenticated, redirect to profile
            navigate('/profile');
          } else {
            throw new Error('No session created');
          }
        } else {
          // No tokens in URL, check if we have an active session
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            navigate('/profile');
          } else {
            throw new Error('No authentication tokens found');
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message);
        // Redirect to sign-in after 3 seconds
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <Page>
        <Block className="text-center space-y-4 py-20">
          <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to sign-in...</p>
        </Block>
      </Page>
    );
  }

  return (
    <Page>
      <Block className="text-center space-y-4 py-20">
        <Preloader />
        <h2 className="text-2xl font-bold">Signing you in...</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we complete your authentication
        </p>
      </Block>
    </Page>
  );
}

AuthCallbackPage.displayName = 'AuthCallbackPage';
