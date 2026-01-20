import React from 'react';
import ExploreDashboard from '../components/ui/ExploreDashboard';
import MainLayout from '../components/MainLayout';

export default function HomePage() {
  return (
    <MainLayout title="Discover" showBackButton={false}>
      <ExploreDashboard />
    </MainLayout>
  );
}
HomePage.displayName = 'HomePage';
