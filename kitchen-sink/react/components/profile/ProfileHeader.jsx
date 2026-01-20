import React from 'react';
import { Block, Preloader } from 'konsta/react';
import {
  MdVerified,
  MdCameraAlt,
} from 'react-icons/md';
import {
  FaInstagram,
  FaTiktok,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { getCountryFlag } from '../../constants/flags';

export default function ProfileHeader({
  profile,
  uploadingAvatar,
  avatarError,
  onAvatarClick,
  onAvatarError,
  fileInputRef,
  onAvatarUpload,
  getInitials,
}) {
  if (!profile) return null;

  return (
    <Block strong inset className="mt-4">
      <div className="flex gap-5 items-center py-2">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          <div
            onClick={onAvatarClick}
            className="relative w-24 h-24 rounded-full cursor-pointer group"
          >
            {profile.avatar_url && !avatarError ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-2 ring-primary/20"
                loading="lazy"
                onError={onAvatarError}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-3xl font-bold ring-2 ring-primary/20">
                {getInitials()}
              </div>
            )}

            {/* Camera overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingAvatar ? (
                <Preloader className="w-6 h-6" />
              ) : (
                <MdCameraAlt className="w-7 h-7 text-white" />
              )}
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-lg font-bold truncate text-gray-900 dark:text-white">
              {profile.full_name || 'Set your name'}
            </h2>
            {profile.country && getCountryFlag(profile.country) && (
              <span className="text-lg flex-shrink-0">{getCountryFlag(profile.country)}</span>
            )}
            {profile.is_verified && (
              <MdVerified className="w-4 h-4 text-blue-500 flex-shrink-0" title="Verified" />
            )}
          </div>

          <div className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400 mb-2">
            {profile.age && (
              <span className="font-medium">{profile.age} years</span>
            )}
            {(profile.age && (profile.current_city || profile.country)) && (
              <span className="text-gray-400 dark:text-gray-600">•</span>
            )}
            {(profile.current_city || profile.country) && (
              <span className="truncate">{profile.current_city || profile.country}</span>
            )}
          </div>

          {profile.subscription_tier === 'plus' && (
            <span className="inline-block mb-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-semibold shadow-sm">
              ⭐ Plus Member
            </span>
          )}

          {/* Social Media Buttons */}
          {(profile.instagram_handle || profile.twitter_handle || profile.tiktok_handle) && (
            <div className="flex gap-2">
              {profile.instagram_handle && (
                <a
                  href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
              )}
              {profile.twitter_handle && (
                <a
                  href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black hover:scale-110 transition-transform shadow-md"
                >
                  <FaXTwitter className="w-5 h-5" />
                </a>
              )}
              {profile.tiktok_handle && (
                <a
                  href={`https://tiktok.com/@${profile.tiktok_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black hover:scale-110 transition-transform shadow-md"
                >
                  <FaTiktok className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Block>
  );
}
ProfileHeader.displayName = 'ProfileHeader';
