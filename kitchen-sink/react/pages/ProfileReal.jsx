import React, { useState, useEffect, useRef } from 'react';
import {
  Block,
  BlockTitle,
  List,
  ListItem,
  Button,
  ListInput,
  Toggle,
  Dialog,
  DialogButton,
  Preloader,
  Toast,
} from 'konsta/react';
import {
  MdPerson,
  MdEmail,
  MdLocationOn,
  MdSettings,
  MdNotifications,
  MdLock,
  MdHelp,
  MdFavoriteBorder,
  MdLanguage,
  MdDarkMode,
  MdApps,
} from 'react-icons/md';
import {
  FaInstagram,
  FaTiktok,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import MainLayout from '../components/MainLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../hooks/useTheme';
import { signOut, uploadAvatar, deleteAvatar } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { getLanguageFlag, getCountryFlag } from '../constants/flags';

export default function ProfileRealPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, saving, saveProfile } = useProfile(user?.id);
  const { theme, toggleTheme } = useTheme();

  const [editMode, setEditMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [signOutDialogOpened, setSignOutDialogOpened] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpened, setToastOpened] = useState(false);
  const fileInputRef = useRef(null);

  // Toast notification helper
  const showToast = (message) => {
    setToastMessage(message);
    setToastOpened(true);
    setTimeout(() => setToastOpened(false), 3000);
  };

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    country: '',
    current_city: '',
    bio: '',
    languages: [],
    interests: [],
    instagram_handle: '',
    twitter_handle: '',
    tiktok_handle: '',
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age || '',
        country: profile.country || '',
        current_city: profile.current_city || '',
        bio: profile.bio || '',
        languages: profile.languages || [],
        interests: profile.interests || [],
        instagram_handle: profile.instagram_handle || '',
        twitter_handle: profile.twitter_handle || '',
        tiktok_handle: profile.tiktok_handle || '',
      });
    }
  }, [profile]);

  const handleAvatarClick = () => {
    if (!uploadingAvatar) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setAvatarError(false);
      await uploadAvatar(user.id, file);
      showToast('Avatar updated successfully!');
      // Profile will be automatically refreshed by useProfile hook
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showToast('Error uploading avatar: ' + error.message);
      setAvatarError(true);
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    try {
      await saveProfile({
        full_name: formData.full_name,
        age: formData.age ? parseInt(formData.age) : null,
        country: formData.country,
        current_city: formData.current_city,
        bio: formData.bio,
        languages: formData.languages,
        interests: formData.interests,
        instagram_handle: formData.instagram_handle,
        twitter_handle: formData.twitter_handle,
        tiktok_handle: formData.tiktok_handle,
      });
      setEditMode(false);
      showToast('Profile saved successfully!');
    } catch (error) {
      showToast('Error saving profile: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setSignOutDialogOpened(false);
      window.location.reload();
    } catch (error) {
      showToast('Error signing out: ' + error.message);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const array = prev[field];
      if (array.includes(item)) {
        return { ...prev, [field]: array.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...array, item] };
      }
    });
  };

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin');
    }
  }, [authLoading, user, navigate]);

  if (authLoading || profileLoading) {
    return (
      <MainLayout title="Profile">
        {/* Skeleton Loading */}
        <Block strong inset className="mt-4">
          <div className="flex gap-5 items-center py-2 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        </Block>

        <BlockTitle>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 animate-pulse" />
        </BlockTitle>
        <Block strong inset>
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </Block>

        <BlockTitle>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse" />
        </BlockTitle>
        <List strong inset>
          {[1, 2, 3].map((i) => (
            <ListItem key={i}>
              <div className="flex items-center gap-4 w-full animate-pulse">
                <div className="w-6 h-6 rounded bg-gray-300 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24" />
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      </MainLayout>
    );
  }

  if (!user || !profile) {
    return (
      <MainLayout title="Profile">
        <Block className="text-center py-20">
          <p className="text-gray-500">Profile not found</p>
        </Block>
      </MainLayout>
    );
  }

  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return profile.email?.[0]?.toUpperCase() || '?';
  };

  return (
    <MainLayout
      title="Profile"
      rightAction={
        !editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="text-primary font-medium px-2"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(false)}
              className="text-gray-600 dark:text-gray-400 font-medium px-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-primary font-semibold px-2"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )
      }
    >
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        uploadingAvatar={uploadingAvatar}
        avatarError={avatarError}
        onAvatarClick={handleAvatarClick}
        onAvatarError={() => setAvatarError(true)}
        fileInputRef={fileInputRef}
        onAvatarUpload={handleAvatarUpload}
        getInitials={getInitials}
      />

      {/* Bio Section */}
      <BlockTitle>Bio</BlockTitle>
      {editMode ? (
        <List strong inset>
          <ListInput
            type="textarea"
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            inputClassName="min-h-[80px] !text-sm"
          />
        </List>
      ) : (
        <Block strong inset>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {profile.bio || 'No bio yet. Click Edit to add one!'}
          </p>
        </Block>
      )}

      {/* Contact Information */}
      <BlockTitle>Contact Information</BlockTitle>
      <List strong inset>
        {editMode ? (
          <>
            <ListInput
              label="Full Name"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              media={<MdPerson className="w-6 h-6" />}
            />
            <ListInput
              label="Age"
              type="number"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              media={<MdPerson className="w-6 h-6" />}
            />
            <ListInput
              label="Country"
              type="text"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              media={<MdLocationOn className="w-6 h-6" />}
            />
            <ListInput
              label="Current City"
              type="text"
              value={formData.current_city}
              onChange={(e) => handleChange('current_city', e.target.value)}
              media={<MdLocationOn className="w-6 h-6" />}
            />
          </>
        ) : (
          <>
            <ListItem
              title="Email"
              after={profile.email}
              media={<MdEmail className="w-6 h-6" />}
            />
            {profile.age && (
              <ListItem
                title="Age"
                after={profile.age.toString()}
                media={<MdPerson className="w-6 h-6" />}
              />
            )}
            {profile.country && (
              <ListItem
                title="Country"
                after={profile.country}
                media={<MdLocationOn className="w-6 h-6" />}
              />
            )}
            {profile.current_city && (
              <ListItem
                title="Current City"
                after={profile.current_city}
                media={<MdLocationOn className="w-6 h-6" />}
              />
            )}
          </>
        )}
      </List>

      {/* Interests */}
      <BlockTitle>
        <div className="flex items-center gap-2">
          <MdFavoriteBorder className="w-5 h-5 text-primary" />
          <span>Interests</span>
        </div>
      </BlockTitle>
      <Block strong inset>
        {profile.interests && profile.interests.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {profile.interests.map((interest, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center">No interests added yet</p>
        )}
      </Block>

      {/* Languages */}
      <BlockTitle>
        <div className="flex items-center gap-2">
          <MdLanguage className="w-5 h-5 text-secondary" />
          <span>Languages</span>
        </div>
      </BlockTitle>
      <Block strong inset>
        {profile.languages && profile.languages.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {profile.languages.map((language, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium flex items-center gap-1.5"
              >
                <span className="text-base">{getLanguageFlag(language)}</span>
                {language}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center">No languages added yet</p>
        )}
      </Block>

      {/* Social Media - Only show in edit mode */}
      {editMode && (
        <>
          <BlockTitle>Social Media</BlockTitle>
          <List strong inset>
            <ListInput
              label="Instagram"
              type="text"
              value={formData.instagram_handle}
              onChange={(e) => handleChange('instagram_handle', e.target.value)}
              placeholder="@username"
              media={
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                  <FaInstagram className="w-4 h-4 text-white" />
                </div>
              }
            />
            <ListInput
              label="Twitter/X"
              type="text"
              value={formData.twitter_handle}
              onChange={(e) => handleChange('twitter_handle', e.target.value)}
              placeholder="@username"
              media={
                <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
                  <FaXTwitter className="w-4 h-4 text-white dark:text-black" />
                </div>
              }
            />
            <ListInput
              label="TikTok"
              type="text"
              value={formData.tiktok_handle}
              onChange={(e) => handleChange('tiktok_handle', e.target.value)}
              placeholder="@username"
              media={
                <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
                  <FaTiktok className="w-4 h-4 text-white dark:text-black" />
                </div>
              }
            />
          </List>
        </>
      )}

      {/* Settings */}
      <BlockTitle>Settings</BlockTitle>
      <List strong inset>
        <ListItem
          link
          title="Account Settings"
          media={<MdSettings className="w-6 h-6" />}
          chevron
        />
        <ListItem
          title="Push Notifications"
          media={<MdNotifications className="w-6 h-6" />}
          after={
            <Toggle
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
          }
        />
        <ListItem
          title="Dark Mode"
          media={<MdDarkMode className="w-6 h-6" />}
          after={
            <Toggle
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
          }
        />
        <ListItem
          link
          title="Privacy & Security"
          media={<MdLock className="w-6 h-6" />}
          chevron
        />
        <ListItem
          link
          title="Help & Support"
          media={<MdHelp className="w-6 h-6" />}
          chevron
        />
      </List>

      {/* Developer Tools */}
      <BlockTitle>Developer</BlockTitle>
      <List strong inset>
        <Link to="/components" className="no-underline">
          <ListItem
            link
            title="UI Components"
            after="Test all components"
            media={<MdApps className="w-6 h-6 text-primary" />}
            chevron
          />
        </Link>
      </List>

      {/* Sign Out */}
      <Block className="pb-20 text-center">
        <button
          onClick={() => setSignOutDialogOpened(true)}
          className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors"
        >
          Sign Out
        </button>
      </Block>

      {/* Sign Out Dialog */}
      <Dialog
        opened={signOutDialogOpened}
        onBackdropClick={() => setSignOutDialogOpened(false)}
        title="Sign Out"
        content="Are you sure you want to sign out?"
        buttons={
          <>
            <DialogButton onClick={() => setSignOutDialogOpened(false)}>
              Cancel
            </DialogButton>
            <DialogButton strong onClick={handleSignOut}>
              Sign Out
            </DialogButton>
          </>
        }
      />

      {/* Toast Notification */}
      <Toast
        opened={toastOpened}
        onClose={() => setToastOpened(false)}
        position="center"
      >
        {toastMessage}
      </Toast>
    </MainLayout>
  );
}
ProfileRealPage.displayName = 'ProfileRealPage';
