import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import './style.css';

import UuidApp from './uuid/main.tsx';
import PasswordApp from './password/main.tsx';
import SimilarityApp from './similarity/main.tsx';

import BcryptApp from './bcrypt/main.tsx';
import LinkAnalyzerApp from './link-analyzer/main.tsx';

function Home() {
  return (
    <Layout homeLink="/" title="SUPER UTILS BROS">
      <div className="util-grid">
        <Link to="/uuid" className="nes-btn is-primary">UUID<br/>Gen</Link>
        <Link to="/password" className="nes-btn is-warning">Password<br/>Gen</Link>
        <Link to="/similarity" className="nes-btn is-success">Score<br/>Sim</Link>
        <Link to="/bcrypt" className="nes-btn" style={{ backgroundColor: '#9b59b6', color: 'white' }}>Bcrypt<br/>Utils</Link>
        <Link to="/link-analyzer" className="nes-btn" style={{ backgroundColor: '#e67e22', color: 'white' }}>Link<br/>Analyze</Link>
      </div>
    </Layout>
  );
}

const rootElement = document.getElementById('root');

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  // Trigger on any button or anything styled as a button (.nes-btn)
  const button = target.closest('button') || target.closest('.nes-btn');
  
  if (button) {
    const rect = button.getBoundingClientRect();
    // Use click coordinates if available, otherwise fallback to button center
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;

    const coin = document.createElement('img');
    coin.src = '/coin.png';
    coin.className = 'coin-toast';
    coin.style.left = `${x}px`;
    coin.style.top = `${y}px`;
    document.body.appendChild(coin);
    
    // Remove the coin element after the animation completes (0.8s)
    setTimeout(() => {
      coin.remove();
    }, 800);
  }
});

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/uuid" element={<UuidApp />} />
          <Route path="/password" element={<PasswordApp />} />
          <Route path="/similarity" element={<SimilarityApp />} />
          <Route path="/bcrypt" element={<BcryptApp />} />
          <Route path="/link-analyzer" element={<LinkAnalyzerApp />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
}
