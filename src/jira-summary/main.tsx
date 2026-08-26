import React, { useState } from 'react';
import Papa from 'papaparse';
import { Layout } from '../components/Layout';

// Define our categories
type Category = 'TODO' | 'IN PROGRESS' | 'DONE DEVELOPMENT' | 'BLOCKED';

const CATEGORY_COLORS: Record<Category, string> = {
  'TODO': '#95a5a6',
  'IN PROGRESS': '#f39c12',
  'DONE DEVELOPMENT': '#2ecc71',
  'BLOCKED': '#e74c3c'
};

const CATEGORIES: Category[] = ['TODO', 'IN PROGRESS', 'DONE DEVELOPMENT', 'BLOCKED'];

interface EpicData {
  name: string;
  total: number;
  statuses: Record<Category, number>;
  assignees: Set<string>;
}

export default function JiraSummaryApp() {
  const [epics, setEpics] = useState<EpicData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          processCsvData(results.data as any[]);
        } catch (err: any) {
          setError(err.message || 'Error processing CSV');
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      }
    });
  };

  const processCsvData = (data: any[]) => {
    const epicMap: Record<string, EpicData> = {};

    data.forEach(row => {
      // Find the Epic column
      const epicName = row['Parent summary'] || row['Custom field (Epic Name)'] || row['Parent'] || 'No Epic (Unassigned)';
      const assignee = row['Assignee'] || 'Unassigned';
      
      let rawStatus = (row['Status'] || '').toUpperCase().trim();
      if (rawStatus === 'TO DO') rawStatus = 'TODO';
      
      let category: Category = 'TODO'; // default

      if (['TODO'].includes(rawStatus)) {
        category = 'TODO';
      } else if (['IN PROGRESS', 'IN REVIEW'].includes(rawStatus)) {
        category = 'IN PROGRESS';
      } else if (['READY FOR TESTING', 'DONE', 'TESTING', 'PENDING PRE-PROD'].includes(rawStatus)) {
        category = 'DONE DEVELOPMENT';
      } else if (['REJECT', 'DEPRIORITIZED', 'BLOCKED'].includes(rawStatus)) {
        category = 'BLOCKED';
      }

      if (!epicMap[epicName]) {
        epicMap[epicName] = {
          name: epicName,
          total: 0,
          statuses: {
            'TODO': 0,
            'IN PROGRESS': 0,
            'DONE DEVELOPMENT': 0,
            'BLOCKED': 0
          },
          assignees: new Set()
        };
      }

      epicMap[epicName].total += 1;
      epicMap[epicName].statuses[category] += 1;
      if (assignee !== 'Unassigned' && assignee.trim() !== '') {
        epicMap[epicName].assignees.add(assignee);
      }
    });

    const epicsList = Object.values(epicMap).sort((a, b) => b.total - a.total);
    setEpics(epicsList);
  };

  return (
    <Layout homeLink="/" title="Jira Sprint Summary">
      <div className="nes-container with-title is-centered" style={{ marginBottom: '20px', padding: '10px' }}>
        <p className="title" style={{ fontSize: '16px' }}>Upload CSV</p>
        <p style={{ fontSize: '12px' }}>Upload your Jira CSV export to see sprint progress by Epic.</p>
        
        <label className="nes-btn is-primary" style={{ fontSize: '12px', padding: '4px 8px' }}>
          <span>Select CSV File</span>
          <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {loading && <p>Processing...</p>}
      {error && <p className="nes-text is-error">{error}</p>}

      {epics.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
          gap: '15px' 
        }}>
          {epics.map(epic => (
            <div key={epic.name} className="nes-container" style={{ padding: '10px', fontSize: '10px', marginBottom: '0px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px', lineHeight: '1.4' }}>
                  {epic.name} <span style={{ color: '#2c3e50' }}>({epic.total} tasks)</span>
                </strong>
                <div style={{ color: '#777', lineHeight: '1.4', fontSize: '10px' }}>
                  Assignees: {epic.assignees.size > 0 ? Array.from(epic.assignees).join(', ') : 'None'}
                </div>
              </div>
              
              {/* Stacked Progress Bar */}
              <div style={{ 
                width: '100%', 
                height: '16px', 
                backgroundColor: '#e7e7e7', 
                display: 'flex', 
                border: '2px solid black',
                marginBottom: '8px'
              }}>
                {CATEGORIES.map(cat => {
                  const count = epic.statuses[cat];
                  if (count === 0) return null;
                  const percentage = (count / epic.total) * 100;
                  return (
                    <div 
                      key={cat}
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: CATEGORY_COLORS[cat],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '9px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        borderRight: percentage === 100 ? 'none' : '2px solid black'
                      }}
                      title={`${cat}: ${count} (${percentage.toFixed(1)}%)`}
                    >
                      {percentage > 15 ? `${percentage.toFixed(0)}%` : ''}
                    </div>
                  );
                })}
              </div>

              {/* Legend / Stats */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '10px' }}>
                {CATEGORIES.map(cat => {
                  const count = epic.statuses[cat];
                  const percentage = (count / epic.total) * 100;
                  return (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '8px', height: '8px', backgroundColor: CATEGORY_COLORS[cat], border: '1px solid black' }}></div>
                      <span>{cat}: {count} ({percentage.toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
