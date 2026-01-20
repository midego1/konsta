import React, { useState } from 'react';
import {
  Block,
  List,
  ListInput,
  Button,
  Preloader,
} from 'konsta/react';
import { MdEmail, MdArrowBack } from 'react-icons/md';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isGmailUser = email.toLowerCase().endsWith('@gmail.com');

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/#/auth/callback`;

      console.log('Sending magic link with redirect URL:', redirectUrl);

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setMagicLinkSent(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/#/auth/callback`;

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setMagicLinkSent(false);
    setEmail('');
    setError(null);
  };

  const getGmailSearchUrl = () => {
    const searchQuery = encodeURIComponent(
      `subject:(sign in OR magic link OR verify) newer_than:1h`
    );
    return `https://mail.google.com/mail/u/0/#search/${searchQuery}`;
  };

  const handleOpenGmail = () => {
    window.open(getGmailSearchUrl(), '_blank', 'noopener,noreferrer');
  };

  // Success screen when magic link is sent
  if (magicLinkSent) {
    return (
      <MainLayout title="Check Your Email" showBackButton={false}>
        <Block className="text-center space-y-6 py-8">
          {/* Funny GIF */}
          <div className="flex justify-center">
            <img
              src="https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif"
              alt="You've got mail!"
              className="w-64 h-auto rounded-lg shadow-lg"
            />
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              Check your email for the magic link! ✨
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We sent a sign-in link to <span className="font-medium text-black dark:text-white">{email}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Click the link in the email to sign in. Don't forget to check your spam folder!
            </p>
          </div>

          {/* Open Gmail Button - Only shown for Gmail users */}
          {isGmailUser && (
            <Button
              large
              className="w-full max-w-md mx-auto"
              onClick={handleOpenGmail}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
                  fill="currentColor"
                />
              </svg>
              Open Gmail
            </Button>
          )}

          {/* Back Button */}
          <Button
            clear
            className="mt-4"
            onClick={handleBackToSignIn}
          >
            <MdArrowBack className="mr-2 h-4 w-4" />
            Use a different email
          </Button>
        </Block>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Sign In" showBackButton={false}>
      <Block className="max-w-md mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to CityCrew</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find friends while traveling solo
          </p>
        </div>

        {/* Google OAuth */}
        <Button
          large
          outline
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <Preloader className="mr-2" />
          ) : (
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-black px-2 text-gray-500">Or</span>
          </div>
        </div>

        {/* Magic Link Form */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <List strong inset>
            <ListInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              media={<MdEmail className="w-6 h-6" />}
            />
          </List>

          <Button
            type="submit"
            large
            className="w-full"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <Preloader className="mr-2" />
                Sending...
              </>
            ) : (
              <>
                <MdEmail className="mr-2 h-5 w-5" />
                Send Magic Link
              </>
            )}
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <Block className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg p-4 text-sm">
            {error}
          </Block>
        )}

        {/* Terms */}
        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="#" className="underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline">
            Privacy Policy
          </a>
        </p>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Never eat, explore, or adventure alone again!
        </p>
      </Block>
    </MainLayout>
  );
}
SignInPage.displayName = 'SignInPage';
