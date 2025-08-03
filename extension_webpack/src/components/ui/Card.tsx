import React from 'react';

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  return (
    <div className={`rounded-lg bg-white shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;
