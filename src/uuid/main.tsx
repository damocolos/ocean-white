import { useState } from 'react';
import { Layout } from '../components/Layout';
import '../style.css';
import { v4 as uuidv4, v1 as uuidv1 } from 'uuid';

function UuidApp() {
  const [version, setVersion] = useState('v4');
  const [result, setResult] = useState('Press Generate');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setResult(version === 'v4' ? uuidv4() : uuidv1());
    setCopied(false);
  };

  const handleCopy = async () => {
    if (result !== 'Press Generate') {
      try {
        await navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  return (
    <Layout homeLink="../" title="SUPER UTILS BROS">
      <h2 className="title">UUID Generator</h2>
      
      <div className="nes-field">
        <label htmlFor="uuid-version">Version</label>
        <div className="nes-select">
          <select 
            id="uuid-version" 
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          >
            <option value="v4">UUID v4 (Random)</option>
            <option value="v1">UUID v1 (Time-based)</option>
          </select>
        </div>
      </div>

      <button 
        className="nes-btn is-primary" 
        style={{ width: '100%', marginBottom: '1rem' }}
        onClick={handleGenerate}
      >
        GENERATE
      </button>
      
      <div className="nes-field">
        <label>Generated UUID</label>
        <div className="result-box">{result}</div>
      </div>

      <button 
        className="nes-btn is-warning" 
        style={{ width: '100%' }}
        onClick={handleCopy}
      >
        {copied ? 'COPIED!' : 'COPY'}
      </button>
    </Layout>
  );
}

export default UuidApp;
