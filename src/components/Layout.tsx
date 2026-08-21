import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  homeLink?: string;
  title?: string;
}

export function Layout({ children, homeLink = '/', title = 'SUPER UTILS BROS' }: LayoutProps) {
  return (
    <>
      <header>
        <Link to={homeLink} className="header-link">
          <img src="/favicon.ico" alt="Icon" className="header-icon" />
          <h1 className="title" style={{ margin: 0 }}>{title}</h1>
        </Link>
      </header>
      
      <main className="nes-container">
        {children}
      </main>
    </>
  );
}
