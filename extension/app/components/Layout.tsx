"use client";

import React, { useState } from 'react';
import Nav from './Nav'; // Assuming Nav.tsx is in the same directory

const Layout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md">
        <div className="p-5">
          <h1 className="text-2xl font-bold text-gray-800">Offer Hunter</h1>
        </div>
        <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="flex-1 p-10 overflow-auto">
        {children(activeTab)}
      </div>
    </div>
  );
};

export default Layout;
