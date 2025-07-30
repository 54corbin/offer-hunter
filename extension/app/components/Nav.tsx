"use client";

import React from 'react';

const Nav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'profile', label: 'Profile' },
    { id: 'jobs', label: 'Recommended Jobs' },
    { id: 'history', label: 'Application History' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <nav>
      <ul>
        {navItems.map((item) => (
          <li key={item.id} className="mb-2">
            <a
              href="#"
              onClick={() => setActiveTab(item.id)}
              className={`block px-5 py-2 rounded-md ${
                activeTab === item.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;
