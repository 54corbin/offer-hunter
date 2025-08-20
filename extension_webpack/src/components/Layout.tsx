import React from 'react';
import Header from './ui/Header';
import { FiUser, FiBriefcase, FiSettings } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  onRedirectToSettings: () => void;
}

const navigation = [
  { name: 'Profile', href: '/profile', icon: FiUser },
  { name: 'Jobs', href: '/jobs', icon: FiBriefcase },
  { name: 'Settings', href: '/settings', icon: FiSettings },
];

const Layout: React.FC<LayoutProps> = ({ children, onRedirectToSettings }) => {
  const location = useLocation();
  const currentNavItem = navigation.find(item => item.href === location.pathname);
  const pageTitle = currentNavItem ? currentNavItem.name : 'Offer Hunter';

  return (
    <div className="h-screen bg-gray-100">
      <Header title={pageTitle} navigation={navigation} onRedirectToSettings={onRedirectToSettings} />
      <main className="p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;