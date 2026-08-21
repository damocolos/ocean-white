import { useState } from 'react';
import { mongeElkan, mongeElkanSymmetric } from '@nlptools/distance';
import { Layout } from '../components/Layout';
import '../style.css';

// Basic distance algorithms implementations for fallback/standalone use.
function normalizeName(name: string): string {
  return (name ?? "")
    .normalize("NFD").replace(/\p{Diacritic}/gu, "") // remove diacritic characters
    .replace(/[^\p{L}\p{N}\s]/gu, "") // remove punctuation
    .replace(/\s+/g, " ").trim() // remove extra spaces
    .toLowerCase(); // convert to lowercase
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  return 1.0 - matrix[b.length][a.length] / maxLen;
}

function jaccard(a: string, b: string): number {
  const setA = new Set(a.split(/\s+/));
  const setB = new Set(b.split(/\s+/));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 1.0;
  return intersection.size / union.size;
}

function getTokens(str: string): string[] {
  return str.toLowerCase().split(/\s+/).filter(Boolean);
}

function getTermFrequency(tokens: string[]) {
  const tf: Record<string, number> = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  return tf;
}

function cosine(a: string, b: string): number {
  const tfA = getTermFrequency(getTokens(a));
  const tfB = getTermFrequency(getTokens(b));
  
  const allTerms = new Set([...Object.keys(tfA), ...Object.keys(tfB)]);
  
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  
  for (const term of allTerms) {
    const valA = tfA[term] || 0;
    const valB = tfB[term] || 0;
    dotProduct += valA * valB;
    magA += valA * valA;
    magB += valB * valB;
  }
  
  if (magA === 0 || magB === 0) return 0.0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;

  const len1 = s1.length, len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0.0;

  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0.0;

  let k = 0, transpositions = 0;
  for (let i = 0; i < len1; i++) {
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
  }

  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0;
  
  // Winkler modification
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  
  return jaro + prefix * 0.1 * (1.0 - jaro);
}


function SimilarityApp() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [method, setMethod] = useState('monge-elkan');
  const [result, setResult] = useState('--');
  const [normalizeFlag, setNormalizeFlag] = useState(false);
  const [norm1, setNorm1] = useState('');
  const [norm2, setNorm2] = useState('');

  const handleCalculate = () => {
    let a = text1.trim();
    let b = text2.trim();
    
    if (normalizeFlag) {
      a = normalizeName(a);
      b = normalizeName(b);
    }
    setNorm1(a);
    setNorm2(b);
    
    if (!a && !b) {
      setResult('Both empty');
      return;
    }
    
    let score = 0;
    try {
      switch (method) {
        case 'monge-elkan':
          score = mongeElkan(a, b);
          break;
        case 'monge-elkan-symmetric':
          score = mongeElkanSymmetric(a, b);
          break;
        case 'levenshtein':
          score = levenshtein(a, b);
          break;
        case 'jaro-winkler':
          score = jaroWinkler(a, b);
          break;
        case 'jaccard':
          score = jaccard(a, b);
          break;
        case 'cosine':
          score = cosine(a, b);
          break;
      }
      setResult((score * 100).toFixed(2) + '%');
    } catch (e) {
      console.error(e);
      setResult('Error');
    }
  };

  return (
    <Layout homeLink="../" title="SUPER UTILS BROS">
      <h2 className="title">Score Sim</h2>
      
      <div className="nes-field">
        <label htmlFor="text1">Text 1</label>
        <textarea 
          id="text1" 
          className="nes-input" 
          rows={3}
          value={text1}
          onChange={(e) => setText1(e.target.value)}
        ></textarea>
        {normalizeFlag && norm1 && (
          <p className="nes-text is-disabled" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Normalized: {norm1}
          </p>
        )}
      </div>
      
      <div className="nes-field">
        <label htmlFor="text2">Text 2</label>
        <textarea 
          id="text2" 
          className="nes-input" 
          rows={3}
          value={text2}
          onChange={(e) => setText2(e.target.value)}
        ></textarea>
        {normalizeFlag && norm2 && (
          <p className="nes-text is-disabled" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Normalized: {norm2}
          </p>
        )}
      </div>

      <div className="nes-field">
        <label className="nes-checkbox">
          <input 
            type="checkbox" 
            checked={normalizeFlag} 
            onChange={(e) => setNormalizeFlag(e.target.checked)} 
          />
          <span>Normalize Inputs</span>
        </label>
      </div>

      <div className="nes-field">
        <label htmlFor="sim-method">Method</label>
        <div className="nes-select">
          <select 
            id="sim-method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="monge-elkan">Monge-Elkan</option>
            <option value="monge-elkan-symmetric">Monge-Elkan Symmetric</option>
            <option value="levenshtein">Levenshtein</option>
            <option value="jaro-winkler">Jaro-Winkler</option>
            <option value="jaccard">Jaccard</option>
            <option value="cosine">Cosine</option>
          </select>
        </div>
      </div>

      <button 
        className="nes-btn is-success" 
        style={{ width: '100%', marginBottom: '1rem' }}
        onClick={handleCalculate}
      >
        CALCULATE
      </button>
      
      <div className="nes-field">
        <label>Similarity Score</label>
        <div className="result-box" style={{ backgroundColor: 'var(--mario-blue)', color: 'white' }}>
          {result}
        </div>
      </div>
    </Layout>
  );
}

export default SimilarityApp;
