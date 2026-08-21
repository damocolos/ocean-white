import { useState } from 'react';
import { Layout } from '../components/Layout';
import '../style.css';
import bcrypt from 'bcryptjs';

function BcryptApp() {
  const [mode, setMode] = useState<'generate' | 'verify'>('generate');
  
  // Generate State
  const [plainText, setPlainText] = useState('');
  const [saltRounds, setSaltRounds] = useState(10);
  const [hashResult, setHashResult] = useState('Press Generate');
  const [copied, setCopied] = useState(false);

  // Verify State
  const [verifyPlain, setVerifyPlain] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!plainText) {
      setHashResult('Enter text first!');
      return;
    }
    try {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(plainText, salt);
      setHashResult(hash);
      setCopied(false);
    } catch (e) {
      setHashResult('Error generating hash');
    }
  };

  const handleCopy = async () => {
    if (hashResult !== 'Press Generate' && hashResult !== 'Enter text first!' && hashResult !== 'Error generating hash') {
      try {
        await navigator.clipboard.writeText(hashResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const handleVerify = () => {
    if (!verifyPlain || !verifyHash) {
      setVerifyResult('Enter both fields');
      return;
    }
    try {
      const match = bcrypt.compareSync(verifyPlain, verifyHash);
      setVerifyResult(match ? 'MATCH!' : 'NO MATCH');
    } catch (e) {
      setVerifyResult('Invalid Hash Format');
    }
  };

  return (
    <Layout homeLink="../" title="SUPER UTILS BROS">
      <h2 className="title">Bcrypt Utils</h2>
      
      <div className="nes-field" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <label className="nes-checkbox">
          <input type="radio" className="nes-radio" name="mode" checked={mode === 'generate'} onChange={() => setMode('generate')} />
          <span>Generate</span>
        </label>
        <label className="nes-checkbox">
          <input type="radio" className="nes-radio" name="mode" checked={mode === 'verify'} onChange={() => setMode('verify')} />
          <span>Verify</span>
        </label>
      </div>

      {mode === 'generate' ? (
        <>
          <div className="nes-field">
            <label htmlFor="bcrypt-text">Plain Text</label>
            <input 
              type="text" 
              id="bcrypt-text" 
              className="nes-input" 
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
            />
          </div>

          <div className="nes-field">
            <label htmlFor="salt-rounds">Salt Rounds: <span>{saltRounds}</span></label>
            <input 
              type="range" 
              id="salt-rounds" 
              className="nes-range" 
              min="4" max="15" 
              value={saltRounds}
              onChange={(e) => setSaltRounds(parseInt(e.target.value, 10))}
            />
          </div>

          <button 
            className="nes-btn is-primary" 
            style={{ width: '100%', marginBottom: '1rem' }}
            onClick={handleGenerate}
          >
            GENERATE
          </button>
          
          <div className="nes-field">
            <label>Generated Hash</label>
            <div className="result-box" style={{ fontSize: '0.8rem' }}>{hashResult}</div>
          </div>

          <button 
            className="nes-btn is-warning" 
            style={{ width: '100%' }}
            onClick={handleCopy}
          >
            {copied ? 'COPIED!' : 'COPY'}
          </button>
        </>
      ) : (
        <>
          <div className="nes-field">
            <label htmlFor="verify-plain">Plain Text</label>
            <input 
              type="text" 
              id="verify-plain" 
              className="nes-input" 
              value={verifyPlain}
              onChange={(e) => setVerifyPlain(e.target.value)}
            />
          </div>

          <div className="nes-field">
            <label htmlFor="verify-hash">Bcrypt Hash</label>
            <input 
              type="text" 
              id="verify-hash" 
              className="nes-input" 
              value={verifyHash}
              onChange={(e) => setVerifyHash(e.target.value)}
            />
          </div>

          <button 
            className="nes-btn is-success" 
            style={{ width: '100%', marginBottom: '1rem' }}
            onClick={handleVerify}
          >
            VERIFY
          </button>
          
          {verifyResult && (
            <div className="nes-field">
              <label>Result</label>
              <div 
                className="result-box" 
                style={{ 
                  backgroundColor: verifyResult === 'MATCH!' ? 'var(--mario-green)' : 'var(--mario-red)', 
                  color: 'white' 
                }}
              >
                {verifyResult}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export default BcryptApp;
