import React from 'react';

const Header: React.FC<{ title: string }> = ({ title }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold leading-6 text-gray-900">{title}</h1>
      </div>
    </header>
  );
};

export default Header;
