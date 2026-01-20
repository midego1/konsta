import React from 'react';
import { Page, Navbar, NavbarBackLink } from 'konsta/react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppTabbar from './AppTabbar';

export default function MainLayout({ title, children, showBackButton = true, rightAction }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show back button on home page
  const isHomePage = location.pathname === '/';
  const shouldShowBack = showBackButton && !isHomePage;

  return (
    <Page>
      <Navbar
        title={title}
        left={shouldShowBack && (
          <NavbarBackLink onClick={() => navigate(-1)} />
        )}
        right={rightAction}
      />

      {children}

      <AppTabbar />
    </Page>
  );
}
