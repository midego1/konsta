import React, { useState } from 'react';
import {
  Block,
  BlockTitle,
  List,
  ListItem,
  Button,
  ListInput,
  Toggle,
  Icon,
  Dialog,
  DialogButton,
} from 'konsta/react';
import {
  PersonFill,
  EnvelopeFill,
} from 'framework7-icons/react';
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSettings,
  MdNotifications,
  MdLock,
  MdHelp,
  MdExitToApp,
} from 'react-icons/md';
import MainLayout from '../components/MainLayout';

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [signOutDialogOpened, setSignOutDialogOpened] = useState(false);

  // Mock user data
  const [userData, setUserData] = useState({
    name: 'John Traveler',
    email: 'john.traveler@citycrew.app',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Digital nomad exploring the world one city at a time. Love coffee, hiking, and meeting new people!',
    interests: ['Coffee', 'Hiking', 'Photography', 'Yoga', 'Surfing'],
    languages: ['English', 'Spanish', 'French'],
  });

  return (
    <MainLayout title="Profile">
      {/* Profile Header */}
      <Block className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
            {userData.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{userData.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{userData.location}</p>
        </div>
        <div className="flex justify-center gap-2">
          <Button onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Save Profile' : 'Edit Profile'}
          </Button>
          <Button clear>Share Profile</Button>
        </div>
      </Block>

      {/* Bio Section */}
      {editMode ? (
        <>
          <BlockTitle>About</BlockTitle>
          <List strong inset>
            <ListInput
              label="Bio"
              type="textarea"
              placeholder="Tell us about yourself..."
              value={userData.bio}
              onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
            />
          </List>
        </>
      ) : (
        <>
          <BlockTitle>About</BlockTitle>
          <Block strong inset>
            <p className="text-gray-700 dark:text-gray-300">{userData.bio}</p>
          </Block>
        </>
      )}

      {/* Contact Information */}
      <BlockTitle>Contact Information</BlockTitle>
      <List strong inset>
        {editMode ? (
          <>
            <ListInput
              label="Name"
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              media={
                <Icon
                  ios={<PersonFill className="w-6 h-6" />}
                  material={<MdPerson className="w-6 h-6" />}
                />
              }
            />
            <ListInput
              label="Email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              media={
                <Icon
                  ios={<EnvelopeFill className="w-6 h-6" />}
                  material={<MdEmail className="w-6 h-6" />}
                />
              }
            />
            <ListInput
              label="Phone"
              type="tel"
              value={userData.phone}
              onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              media={<MdPhone className="w-6 h-6" />}
            />
            <ListInput
              label="Location"
              type="text"
              value={userData.location}
              onChange={(e) => setUserData({ ...userData, location: e.target.value })}
              media={<MdLocationOn className="w-6 h-6" />}
            />
          </>
        ) : (
          <>
            <ListItem
              title="Email"
              after={userData.email}
              media={
                <Icon
                  ios={<EnvelopeFill className="w-6 h-6" />}
                  material={<MdEmail className="w-6 h-6" />}
                />
              }
            />
            <ListItem
              title="Phone"
              after={userData.phone}
              media={<MdPhone className="w-6 h-6" />}
            />
            <ListItem
              title="Location"
              after={userData.location}
              media={<MdLocationOn className="w-6 h-6" />}
            />
          </>
        )}
      </List>

      {/* Interests */}
      <BlockTitle>Interests</BlockTitle>
      <Block strong inset>
        <div className="flex flex-wrap gap-2">
          {userData.interests.map((interest, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {interest}
            </span>
          ))}
        </div>
      </Block>

      {/* Languages */}
      <BlockTitle>Languages</BlockTitle>
      <Block strong inset>
        <div className="flex flex-wrap gap-2">
          {userData.languages.map((language, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium"
            >
              {language}
            </span>
          ))}
        </div>
      </Block>

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
          media={<MdSettings className="w-6 h-6" />}
          after={
            <Toggle
              checked={darkMode}
              onChange={() => {
                setDarkMode(!darkMode);
                document.documentElement.classList.toggle('dark');
              }}
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

      {/* Sign Out */}
      <Block className="pb-20">
        <Button
          large
          className="w-full"
          onClick={() => setSignOutDialogOpened(true)}
        >
          <MdExitToApp className="w-6 h-6 mr-2 inline" />
          Sign Out
        </Button>
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
            <DialogButton
              strong
              onClick={() => {
                setSignOutDialogOpened(false);
                alert('Signed out!');
              }}
            >
              Sign Out
            </DialogButton>
          </>
        }
      />
    </MainLayout>
  );
}
ProfilePage.displayName = 'ProfilePage';
