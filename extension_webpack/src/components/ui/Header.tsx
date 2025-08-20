import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconType } from 'react-icons';
import { getUserProfile } from '../../services/storageService';

export interface NavigationItem {
  name: string;
  href: string;
  icon: IconType;
}

interface HeaderProps {
  title: string;
  navigation: NavigationItem[];
  onRedirectToSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, navigation, onRedirectToSettings }) => {
  const handleNavClick = async (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href !== '/settings') {
      const userProfile = await getUserProfile();
      const isConfigured = !!userProfile?.settings?.activeAiProviderId && (user_profile?.settings?.apiProviders?.length ?? 0) > 0;

      if (!isConfigured) {
        e.preventDefault();
        alert('Please configure an AI provider in Settings before proceeding.');
        onRedirectToSettings();
      }
    }
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Offer Hunter</h1>
            <span className="ml-4 pl-4 border-l border-gray-600 text-lg font-semibold">{title}</span>
          </div>
          <nav className="flex space-x-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center rounded-md px-3 py-2 text-sm font-medium`
                }
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
