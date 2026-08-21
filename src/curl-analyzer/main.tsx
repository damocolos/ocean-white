import { useState } from 'react';
import { Layout } from '../components/Layout';

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}

function parseCurlCommand(command: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: {},
    body: ''
  };

  if (!command.trim().toLowerCase().startsWith('curl ')) return result;

  const tokens: string[] = [];
  let currentToken = '';
  let inQuotes = false;
  let quoteChar = '';
  
  // Basic tokenizer to handle quotes and spaces
  for (let i = 4; i < command.length; i++) {
    const char = command[i];
    
    // Ignore escaped newlines or spaces inside backslashes
    if (char === '\\' && command[i+1] && (command[i+1] === '"' || command[i+1] === "'" || command[i+1] === 'n' || command[i+1] === '\n')) {
      if (command[i+1] === 'n' || command[i+1] === '\n') {
          // ignore
      } else {
        currentToken += command[i+1];
      }
      i++;
      continue;
    }

    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
      continue;
    }

    if (inQuotes && char === quoteChar) {
      inQuotes = false;
      continue;
    }

    if (!inQuotes && /\s/.test(char)) {
      if (currentToken.trim() !== '') {
        tokens.push(currentToken.trim());
        currentToken = '';
      }
      continue;
    }

    currentToken += char;
  }
  
  if (currentToken.trim() !== '') {
    tokens.push(currentToken.trim());
  }

  // Handle URL that might not be prefixed with anything, usually the first non-flag token
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token === '-X' || token === '--request') {
      result.method = tokens[i+1]?.toUpperCase() || 'GET';
      i++;
    } else if (token === '-H' || token === '--header') {
      const headerStr = tokens[i+1];
      if (headerStr) {
        const splitIndex = headerStr.indexOf(':');
        if (splitIndex > 0) {
          const key = headerStr.slice(0, splitIndex).trim();
          const value = headerStr.slice(splitIndex + 1).trim();
          result.headers[key] = value;
        }
      }
      i++;
    } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
      result.body = tokens[i+1] || '';
      if (result.method === 'GET') result.method = 'POST';
      i++;
    } else if (token.startsWith('http://') || token.startsWith('https://')) {
      result.url = token;
    }
  }

  // If no URL found by http prefix, look for the first token without a dash that isn't a value
  if (!result.url) {
      for (let i = 0; i < tokens.length; i++) {
          if (!tokens[i].startsWith('-') && !tokens[i-1]?.startsWith('-')) {
              // rough heuristic for url
              if (tokens[i].includes('.') || tokens[i].includes('localhost')) {
                  result.url = tokens[i];
                  break;
              }
          }
      }
  }

  return result;
}

export default function CurlAnalyzerApp() {
  const [curlStr, setCurlStr] = useState('');
  const [parsed, setParsed] = useState<ParsedCurl | null>(null);

  const handleParse = () => {
    if (!curlStr) {
      setParsed(null);
      return;
    }
    const res = parseCurlCommand(curlStr);
    setParsed(res);
  };

  return (
    <Layout homeLink="/" title="CURL ANALYZER">
      <div className="nes-container with-title is-dark">
        <p className="title">Paste cURL Command</p>
        <textarea
          className="nes-textarea is-dark"
          style={{ height: '150px' }}
          value={curlStr}
          onChange={(e) => setCurlStr(e.target.value)}
          placeholder="curl -X POST https://api.example.com..."
        ></textarea>
        <button type="button" className="nes-btn is-primary" style={{ marginTop: '1rem' }} onClick={handleParse}>
          Analyze
        </button>
      </div>

      {parsed && (
        <div className="nes-container with-title is-dark" style={{ marginTop: '2rem' }}>
          <p className="title">Parsed Result</p>
          
          <div style={{ marginBottom: '1rem' }}>
            <span className="nes-text is-primary">Method: </span>
            <span className="nes-text">{parsed.method}</span>
          </div>

          <div style={{ marginBottom: '1rem', wordBreak: 'break-all' }}>
            <span className="nes-text is-success">URL: </span>
            <span className="nes-text">{parsed.url || '(none detected)'}</span>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <span className="nes-text is-warning">Headers: </span>
            {Object.keys(parsed.headers).length === 0 && <span className="nes-text">None</span>}
            {Object.keys(parsed.headers).length > 0 && (
              <div className="nes-table-responsive" style={{ marginTop: '0.5rem' }}>
                <table className="nes-table is-bordered is-dark" style={{ width: '100%', fontSize: '0.8rem' }}>
                  <tbody>
                    {Object.entries(parsed.headers).map(([key, val]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td style={{ wordBreak: 'break-all' }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <span className="nes-text is-error">Body: </span>
            {!parsed.body && <span className="nes-text">None</span>}
            {parsed.body && (
              <textarea
                className="nes-textarea is-dark"
                readOnly
                value={parsed.body}
                style={{ marginTop: '0.5rem', height: '100px', fontSize: '0.8rem' }}
              ></textarea>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
