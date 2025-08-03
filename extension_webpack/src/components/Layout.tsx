import React from 'react';
import Sidebar, { NavigationItem } from './ui/Sidebar';
import Header from './ui/Header';
import { FiHome, FiUser, FiBriefcase, FiSettings } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'Profile', href: '/profile', icon: FiUser },
    { name: 'Jobs', href: '/jobs', icon: FiBriefcase },
    { name: 'Settings', href: '/settings', icon: FiSettings },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentNavItem = navigation.find(item => item.href === location.pathname);
  const pageTitle = currentNavItem ? currentNavItem.name : 'Offer Hunter';

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navigation={navigation} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;