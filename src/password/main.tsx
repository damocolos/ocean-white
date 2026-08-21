import { useState } from 'react';
import { Layout } from '../components/Layout';
import '../style.css';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

function PasswordApp() {
  const [length, setLength] = useState(12);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  
  const [result, setResult] = useState('Press Generate');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    let charset = '';
    if (upper) charset += UPPER;
    if (lower) charset += LOWER;
    if (numbers) charset += NUMBERS;
    if (symbols) charset += SYMBOLS;

    if (!charset) {
      setResult('Select at least one option!');
      return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setResult(password);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (result !== 'Press Generate' && result !== 'Select at least one option!') {
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
      <h2 className="title">Password Gen</h2>
      
      <div className="nes-field">
        <label htmlFor="pwd-length">Length: <span>{length}</span></label>
        <input 
          type="range" 
          id="pwd-length" 
          className="nes-range" 
          min="8" max="64" 
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value, 10))}
        />
      </div>

      <div className="nes-field">
        <label className="nes-checkbox">
          <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
          <span>Uppercase (A-Z)</span>
        </label>
        <label className="nes-checkbox">
          <input type="checkbox" checked={lower} onChange={(e) => setLower(e.target.checked)} />
          <span>Lowercase (a-z)</span>
        </label>
        <label className="nes-checkbox">
          <input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} />
          <span>Numbers (0-9)</span>
        </label>
        <label className="nes-checkbox">
          <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} />
          <span>Symbols (!@#$)</span>
        </label>
      </div>

      <button 
        className="nes-btn is-warning" 
        style={{ width: '100%', marginBottom: '1rem' }}
        onClick={handleGenerate}
      >
        GENERATE
      </button>
      
      <div className="nes-field">
        <label>Generated Password</label>
        <div className="result-box" style={{ backgroundColor: 'var(--mario-green)', color: 'white' }}>
          {result}
        </div>
      </div>

      <button 
        className="nes-btn is-primary" 
        style={{ width: '100%' }}
        onClick={handleCopy}
      >
        {copied ? 'COPIED!' : 'COPY'}
      </button>
    </Layout>
  );
}

export default PasswordApp;
