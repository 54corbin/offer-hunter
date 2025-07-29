"use client";

import Link from 'next/link';

const Nav = () => {
  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
      <Link href="/" style={{ marginRight: '10px' }}>Home</Link>
      <Link href="/profile" style={{ marginRight: '10px' }}>Profile</Link>
      <Link href="/jobs" style={{ marginRight: '10px' }}>Jobs</Link>
      <Link href="/history" style={{ marginRight: '10px' }}>History</Link>
      <Link href="/settings" style={{ marginRight: '10px' }}>Settings</Link>
      <Link href="/privacy">Privacy</Link>
    </nav>
  );
};

export default Nav;
