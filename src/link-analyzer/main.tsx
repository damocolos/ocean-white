import { useState } from 'react';
import { Layout } from '../components/Layout';
import '../style.css';

function LinkAnalyzerApp() {
  const [urlInput, setUrlInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = () => {
    try {
      setError('');
      setResult(null);
      
      let parsedUrl = urlInput.trim();
      if (parsedUrl && !parsedUrl.startsWith('http://') && !parsedUrl.startsWith('https://')) {
        parsedUrl = 'https://' + parsedUrl;
      }

      const urlObj = new URL(parsedUrl);
      
      const searchParams: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        searchParams[key] = value;
      });

      setResult({
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port || '(default)',
        pathname: urlObj.pathname,
        searchParams: searchParams,
        hash: urlObj.hash,
      });
    } catch (err: any) {
      setError('Invalid URL');
    }
  };

  return (
    <Layout homeLink="../" title="SUPER UTILS BROS">
      <h2 className="title">Link Analyzer</h2>
      
      <div className="nes-field">
        <label htmlFor="url-input">Enter URL</label>
        <input 
          type="text" 
          id="url-input" 
          className="nes-input" 
          placeholder="example.com/path?a=1"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
      </div>

      <button 
        className="nes-btn is-primary" 
        style={{ width: '100%', marginBottom: '1rem' }}
        onClick={handleAnalyze}
      >
        ANALYZE
      </button>
      
      {error && (
        <div className="nes-field">
          <div className="result-box" style={{ backgroundColor: 'var(--mario-red)', color: 'white' }}>
            {error}
          </div>
        </div>
      )}

      {result && (
        <div className="nes-field">
          <label>Analysis Result</label>
          <div className="result-box" style={{ textAlign: 'left', fontSize: '0.9rem', wordBreak: 'break-word', backgroundColor: '#fff', color: '#000' }}>
            <p><strong>Protocol:</strong> {result.protocol}</p>
            <p><strong>Hostname:</strong> {result.hostname}</p>
            {result.port !== '(default)' && <p><strong>Port:</strong> {result.port}</p>}
            <p><strong>Pathname:</strong> {result.pathname}</p>
            
            {Object.keys(result.searchParams).length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p><strong>Query Params:</strong></p>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                  {Object.entries(result.searchParams).map(([key, value]) => (
                    <li key={key}><strong>{key}</strong>: {value as string}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.hash && (
              <p style={{ marginTop: '1rem' }}><strong>Hash:</strong> {result.hash}</p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default LinkAnalyzerApp;
