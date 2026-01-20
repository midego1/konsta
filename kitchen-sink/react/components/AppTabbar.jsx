import React from 'react';
import { Tabbar, TabbarLink, Icon, ToolbarPane } from 'konsta/react';
import { Link, useLocation } from 'react-router-dom';
import { HouseFill, EnvelopeFill, PersonFill, MapFill } from 'framework7-icons/react';
import { MdHome, MdEmail, MdPerson, MdMap } from 'react-icons/md';

export default function AppTabbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => {
    if (path === '/') {
      return currentPath === '/' || currentPath === '';
    }
    return currentPath.startsWith(path);
  };

  return (
    <Tabbar labels icons className="left-0 bottom-0 fixed">
      <ToolbarPane>
        <TabbarLink
          active={isActive('/')}
          component={Link}
          to="/"
          icon={
            <Icon
              ios={<HouseFill className="w-7 h-7" />}
              material={<MdHome className="w-6 h-6" />}
            />
          }
          label="Home"
        />
        <TabbarLink
          active={isActive('/activities')}
          component={Link}
          to="/activities"
          icon={
            <Icon
              ios={<MapFill className="w-7 h-7" />}
              material={<MdMap className="w-6 h-6" />}
            />
          }
          label="Activities"
        />
        <TabbarLink
          active={isActive('/messages')}
          component={Link}
          to="/messages"
          icon={
            <Icon
              ios={<EnvelopeFill className="w-7 h-7" />}
              material={<MdEmail className="w-6 h-6" />}
            />
          }
          label="Messages"
        />
        <TabbarLink
          active={isActive('/profile')}
          component={Link}
          to="/profile"
          icon={
            <Icon
              ios={<PersonFill className="w-7 h-7" />}
              material={<MdPerson className="w-6 h-6" />}
            />
          }
          label="Profile"
        />
      </ToolbarPane>
    </Tabbar>
  );
}
