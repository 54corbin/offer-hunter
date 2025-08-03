import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconType } from 'react-icons';

export interface NavigationItem {
  name: string;
  href: string;
  icon: IconType;
}

interface SidebarProps {
  navigation: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navigation }) => {
  return (
    <div className="flex w-64 flex-col bg-gray-800">
      <div className="flex h-16 flex-shrink-0 items-center px-4 text-white">
        <h1 className="text-xl font-bold">Offer Hunter</h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } group flex items-center rounded-md px-2 py-2 text-sm font-medium`
              }
            >
              <item.icon className="mr-3 h-6 w-6 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
