import React, { useEffect, useLayoutEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { App as CityCrewApp } from 'konsta/react';

import routes from '../routes.js';
import HomePage from '../pages/Home.jsx';
import MessagesAppPage from '../pages/MessagesApp.jsx';
import ConversationDetailPage from '../pages/ConversationDetail.jsx';
import ProfileRealPage from '../pages/ProfileReal.jsx';
import SignInPage from '../pages/SignIn.jsx';
import AuthCallbackPage from '../pages/AuthCallback.jsx';
import ActivityMapPage from '../pages/ActivityMap.jsx';
import { useTheme } from '../hooks/useTheme';

function App() {
  const [theme, setTheme] = useState(
    window.location.search.includes('theme=material') ? 'material' : 'ios'
  );
  const [currentColorTheme, setCurrentColorTheme] = useState('');
  const [currentVibrant, setCurrentVibrant] = useState(false);
  const [currentMonochrome, setCurrentMonochrome] = useState(false);

  // Initialize dark/light mode theme management
  useTheme();
  const setVibrant = (value) => {
    const htmlEl = document.documentElement;
    if (value) {
      htmlEl.classList.add('cc-md-vibrant');
    } else {
      htmlEl.classList.remove('cc-md-vibrant');
    }
    setCurrentVibrant(value);
  };
  const setMonochrome = (value) => {
    const htmlEl = document.documentElement;
    if (value) {
      htmlEl.classList.add('cc-md-monochrome');
    } else {
      htmlEl.classList.remove('cc-md-monochrome');
    }
    setCurrentMonochrome(value);
  };
  const setColorTheme = (color) => {
    const htmlEl = document.documentElement;
    htmlEl.classList.forEach((c) => {
      if (c.includes('cc-color')) htmlEl.classList.remove(c);
    });
    if (color) htmlEl.classList.add(color);
    setCurrentColorTheme(color);
  };
  useEffect(() => {
    window.setTheme = (t) => setTheme(t);
    window.setMode = (mode) => {
      if (mode === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
  }, []);
  const inIFrame = window.parent !== window;
  useLayoutEffect(() => {
    if (window.location.href.includes('safe-areas')) {
      const html = document.documentElement;
      if (html) {
        html.style.setProperty(
          '--cc-safe-area-top',
          theme === 'ios' ? '44px' : '24px'
        );
        html.style.setProperty('--cc-safe-area-bottom', '34px');
      }
    }
  }, [theme]);
  return (
    <CityCrewApp theme={theme} safeAreas={!inIFrame}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/activities" element={<ActivityMapPage />} />
          <Route path="/messages" element={<MessagesAppPage />} />
          <Route path="/messages/:id" element={<ConversationDetailPage />} />
          <Route path="/profile" element={<ProfileRealPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          {routes.map((route) => {
            // Pass theme props to Components page
            if (route.path === '/components') {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <route.component
                      theme={theme}
                      setTheme={setTheme}
                      colorTheme={currentColorTheme}
                      setColorTheme={setColorTheme}
                      vibrant={currentVibrant}
                      setVibrant={setVibrant}
                      monochrome={currentMonochrome}
                      setMonochrome={setMonochrome}
                    />
                  }
                />
              );
            }
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            );
          })}
        </Routes>
      </Router>
    </CityCrewApp>
  );
}

export default App;
