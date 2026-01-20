import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from '../components/ui/Map';
import { ActivityDrawer } from '../components/ActivityDrawer';
import { Fab, useTheme, Page, Sheet, List, ListItem, Button, Chip, Preloader, Block } from 'konsta/react';
import { Plus, Funnel } from 'framework7-icons/react';
import { MdAdd, MdFilterList } from 'react-icons/md';
import AppTabbar from '../components/AppTabbar';
import { useActivities } from '../hooks/useActivities';

// Southeast Asia (Bangkok) as default location
const SOUTHEAST_ASIA = { lat: 13.7563, lng: 100.5018 };

function getCategoryIcon(category) {
  switch (category) {
    case 'dinner':
      return '🍽️';
    case 'drinks':
      return '🍹';
    case 'explore':
      return '🏃';
    case 'cowork':
      return '💻';
    default:
      return '📍';
  }
}

const CATEGORIES = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'dinner', label: 'Dinner', icon: '🍽️' },
  { value: 'drinks', label: 'Drinks', icon: '🍹' },
  { value: 'explore', label: 'Explore', icon: '🏃' },
  { value: 'cowork', label: 'Cowork', icon: '💻' },
];

export default function ActivityMapPage() {
  const theme = useTheme();
  const mapRef = useRef(null);
  const { activities, loading, error } = useActivities();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [filterSheetOpened, setFilterSheetOpened] = useState(false);
  const [initialCenter, setInitialCenter] = useState([SOUTHEAST_ASIA.lng, SOUTHEAST_ASIA.lat]);

  const PlusIcon = theme === 'ios' ? (
    <Plus className="w-7 h-7" />
  ) : (
    <MdAdd className="w-7 h-7" />
  );

  const FilterIcon = theme === 'ios' ? (
    <Funnel className="w-6 h-6" />
  ) : (
    <MdFilterList className="w-6 h-6" />
  );

  // Try to get user's location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('User location found:', latitude, longitude);
          setInitialCenter([longitude, latitude]);
        },
        (error) => {
          console.log('Geolocation check failed:', error);
          // Keep default Bangkok location
        }
      );
    }
  }, []);

  // Debug: Log raw activity data on mount
  useEffect(() => {
    if (activities.length > 0) {
      console.log('=== FULL ACTIVITY OBJECT ===');
      console.log('First activity:', activities[0]);
      console.log('All column names:', Object.keys(activities[0]));
      console.log('===========================');
    }
  }, [activities]);

  const handleMapRef = useCallback((map) => {
    if (!map || mapRef.current === map) return;
    mapRef.current = map;
  }, []);

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    if (selectedCategory === 'all') return true;
    return activity.category === selectedCategory;
  });

  // Debug log
  console.log('Total activities:', activities.length);
  console.log('Filtered activities:', filteredActivities.length);
  console.log('Activities data:', activities);

  // Show loading state
  if (loading) {
    return (
      <Page>
        <div className="relative h-screen w-full bg-gray-200 dark:bg-gray-800">
          {/* Map skeleton with pulsing animation */}
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700">
            {/* Fake map grid lines */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-6 grid-rows-6 h-full">
                {[...Array(36)].map((_, i) => (
                  <div key={i} className="border border-gray-400 dark:border-gray-600" />
                ))}
              </div>
            </div>

            {/* Loading indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Block className="text-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <Preloader />
                <p className="mt-3 text-gray-600 dark:text-gray-300 font-medium">Loading activities...</p>
              </Block>
            </div>
          </div>
        </div>
        <AppTabbar />
      </Page>
    );
  }

  // Show error state
  if (error) {
    return (
      <Page>
        <div className="relative h-screen w-full bg-gray-100 flex items-center justify-center">
          <Block className="text-center">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </Block>
        </div>
        <AppTabbar />
      </Page>
    );
  }

  // Show empty state if no activities
  if (activities.length === 0) {
    return (
      <Page>
        <div className="relative h-screen w-full bg-gray-100 flex items-center justify-center">
          <Block className="text-center space-y-4">
            <div className="text-6xl">🗺️</div>
            <h2 className="text-2xl font-bold">No Activities Yet</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to create an activity!
            </p>
          </Block>
        </div>
        <AppTabbar />
      </Page>
    );
  }

  return (
    <Page>
      <div className="relative h-screen w-full bg-gray-100">
        <Map ref={handleMapRef} center={initialCenter} zoom={12}>
          <MapControls
            position="bottom-right"
            showZoom
            showLocate
            className="backdrop-blur-md"
            onLocate={(coords) => {
              console.log('Located at:', coords);
            }}
          />

          {/* Render markers when map is ready */}
          {filteredActivities.map((activity) => {
            // Support both lng/lat and longitude/latitude property names
            const lng = activity.lng ?? activity.longitude;
            const lat = activity.lat ?? activity.latitude;

            console.log(`Marker for activity ${activity.id}:`, {
              title: activity.title,
              lng,
              lat,
              rawActivity: activity
            });

            return (
              <MapMarker
                key={activity.id}
                longitude={lng}
                latitude={lat}
                onClick={() => setSelectedActivity(activity)}
              >
                <MarkerContent>
                  <div className="text-3xl cursor-pointer hover:scale-110 transition-transform drop-shadow-md">
                    {getCategoryIcon(activity.category)}
                  </div>
                </MarkerContent>
                <MarkerTooltip>{activity.title}</MarkerTooltip>
              </MapMarker>
            );
          })}
        </Map>

        {/* Floating Action Buttons - Left Side */}
        <div className="fixed left-safe-4 bottom-24 z-20 flex flex-col gap-3">
          {/* Create Activity Button */}
          <Fab
            icon={PlusIcon}
          />

          {/* Filter Button */}
          <Fab
            onClick={() => setFilterSheetOpened(true)}
            icon={FilterIcon}
          />
        </div>

        {/* Activity Drawer */}
        <ActivityDrawer
          activity={selectedActivity}
          opened={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />

        {/* Filter Sheet */}
        <Sheet
          className="pb-safe"
          opened={filterSheetOpened}
          onBackdropClick={() => setFilterSheetOpened(false)}
        >
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Filter Activities</h2>

            <div className="space-y-2 mb-6">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setFilterSheetOpened(false);
                  }}
                  className={`w-full justify-start ${
                    selectedCategory === cat.value
                      ? ''
                      : 'bg-transparent'
                  }`}
                  outline={selectedCategory !== cat.value}
                  large
                  rounded
                >
                  <span className="text-2xl mr-3">{cat.icon}</span>
                  <span className="font-medium">{cat.label}</span>
                </Button>
              ))}
            </div>

            <Button
              onClick={() => setFilterSheetOpened(false)}
              className="w-full"
              large
              rounded
            >
              Apply Filter
            </Button>
          </div>
        </Sheet>
      </div>
      <AppTabbar />
    </Page>
  );
}

ActivityMapPage.displayName = 'ActivityMapPage';
