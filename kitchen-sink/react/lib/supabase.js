import { createClient } from '@supabase/supabase-js';

// Supabase credentials from .env.local (using import.meta.env for Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://umxgjcodoyfsfhschttc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteGdqY29kb3lmc2Zoc2NodHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODE4MjUsImV4cCI6MjA4NDM1NzgyNX0.XvodI61ntOwngwQrB_j38KKInA8YXbPFci4n0KetNk0';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

// Helper function to get user profile
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

// Helper function to update user profile
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
}

// Helper function to sign in with magic link
export async function signInWithMagicLink(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error('Error sending magic link:', error);
    throw error;
  }

  return data;
}

// Helper function to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Helper function to get user theme preference
export async function getUserThemePreference(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('theme_preference')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching theme preference:', error);
    return null;
  }

  return data?.theme_preference || 'light';
}

// Helper function to update user theme preference
export async function updateUserThemePreference(userId, theme) {
  const { error } = await supabase
    .from('profiles')
    .update({ theme_preference: theme })
    .eq('id', userId);

  if (error) {
    console.error('Error updating theme preference:', error);
    throw error;
  }
}

// Helper function to upload avatar
export async function uploadAvatar(userId, file) {
  // Generate unique filename: userId/timestamp_filename
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const filePath = `${userId}/${timestamp}.${fileExt}`;

  // Upload file to Supabase storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }

  // Get public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update user profile with new avatar URL
  await updateUserProfile(userId, { avatar_url: publicUrl });

  return publicUrl;
}

// Helper function to delete avatar
export async function deleteAvatar(userId, avatarUrl) {
  if (!avatarUrl) return;

  try {
    // Extract file path from URL
    const urlParts = avatarUrl.split('/avatars/');
    if (urlParts.length !== 2) {
      console.error('Invalid avatar URL format');
      return;
    }
    const filePath = urlParts[1];

    // Delete from storage
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }

    // Update profile to remove avatar URL
    await updateUserProfile(userId, { avatar_url: null });
  } catch (error) {
    console.error('Error in deleteAvatar:', error);
    throw error;
  }
}
