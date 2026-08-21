import { useState } from 'react';
import { Layout } from '../components/Layout';

function getPaths(obj: any, prefix = ''): string[] {
  let paths: string[] = [];
  if (obj === null || typeof obj !== 'object') {
    paths.push(prefix);
    return paths;
  }
  
  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      paths.push(...getPaths(obj[0], `${prefix}[0]`));
    } else {
      paths.push(`${prefix}[]`);
    }
    return paths;
  }

  for (const key of Object.keys(obj)) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    paths.push(...getPaths(obj[key], newPrefix));
  }
  return paths;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractIdentifiers(obj: any, prefix = ''): { path: string; value: any; type: string }[] {
  let ids: { path: string; value: any; type: string }[] = [];
  
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      if (UUID_REGEX.test(obj)) {
        ids.push({ path: prefix, value: obj, type: 'UUID' });
      } else if (EMAIL_REGEX.test(obj)) {
        ids.push({ path: prefix, value: obj, type: 'Email' });
      }
    } else if (typeof obj === 'number') {
      if (prefix.toLowerCase().includes('id')) {
        ids.push({ path: prefix, value: obj, type: 'Numeric ID' });
      }
    }
    return ids;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      ids.push(...extractIdentifiers(item, `${prefix}[${index}]`));
    });
    return ids;
  }

  for (const key of Object.keys(obj)) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    ids.push(...extractIdentifiers(obj[key], newPrefix));
  }

  return ids;
}

function getTSType(value: any, depth = 1): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    return value.length > 0 ? `${getTSType(value[0], depth)}[]` : 'any[]';
  }
  if (typeof value === 'object') {
    const indent = '  '.repeat(depth);
    const endIndent = '  '.repeat(depth - 1);
    const props = Object.keys(value).map(k => `${indent}${k}: ${getTSType(value[k], depth + 1)};`);
    return `{\n${props.join('\n')}\n${endIndent}}`;
  }
  return typeof value;
}

export default function JsonParserApp() {
  const [jsonStr, setJsonStr] = useState('');
  const [parsedObj, setParsedObj] = useState<any>(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'paths' | 'ids' | 'ts'>('paths');

  const handleParse = () => {
    setError('');
    if (!jsonStr.trim()) {
      setParsedObj(null);
      return;
    }
    try {
      const obj = JSON.parse(jsonStr);
      setParsedObj(obj);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON');
      setParsedObj(null);
    }
  };

  let content = null;

  if (parsedObj) {
    if (mode === 'paths') {
      const paths = getPaths(parsedObj);
      content = (
        <ul className="nes-list is-disc" style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>
          {paths.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      );
    } else if (mode === 'ids') {
      const ids = extractIdentifiers(parsedObj);
      if (ids.length === 0) {
        content = <p>No specific identifiers found.</p>;
      } else {
        content = (
          <div className="nes-table-responsive">
            <table className="nes-table is-bordered is-dark" style={{ width: '100%', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Path</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {ids.map((id, i) => (
                  <tr key={i}>
                    <td>{id.type}</td>
                    <td>{id.path}</td>
                    <td>{id.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    } else if (mode === 'ts') {
      const tsString = `type RootObject = ${getTSType(parsedObj, 1)};`;
      content = (
        <textarea
          className="nes-textarea is-dark"
          readOnly
          value={tsString}
          style={{ height: '300px', fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'pre' }}
        ></textarea>
      );
    }
  }

  return (
    <Layout homeLink="/" title="JSON SMART PARSER">
      <div className="nes-container with-title is-dark">
        <p className="title">Paste JSON Payload</p>
        <textarea
          className="nes-textarea is-dark"
          style={{ height: '150px' }}
          value={jsonStr}
          onChange={(e) => setJsonStr(e.target.value)}
          placeholder='{"id": 1, "uuid": "123e4567-e89b-12d3-a456-426614174000", "user": {"email": "test@example.com"}}'
        ></textarea>
        {error && <p className="nes-text is-error" style={{ marginTop: '0.5rem' }}>{error}</p>}
        
        <button type="button" className="nes-btn is-primary" style={{ marginTop: '1rem' }} onClick={handleParse}>
          Parse JSON
        </button>
      </div>

      {parsedObj && (
        <div className="nes-container with-title is-dark" style={{ marginTop: '2rem' }}>
          <p className="title">Results</p>
          
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`nes-btn ${mode === 'paths' ? 'is-success' : ''}`}
              onClick={() => setMode('paths')}
            >
              All Paths
            </button>
            <button 
              className={`nes-btn ${mode === 'ids' ? 'is-warning' : ''}`}
              onClick={() => setMode('ids')}
            >
              Identifiers
            </button>
            <button 
              className={`nes-btn ${mode === 'ts' ? 'is-primary' : ''}`}
              onClick={() => setMode('ts')}
            >
              TS Interface
            </button>
          </div>

          <div style={{ backgroundColor: '#212529', color: 'white', padding: '1rem', border: '4px solid #fff' }}>
            {content}
          </div>
        </div>
      )}
    </Layout>
  );
}
