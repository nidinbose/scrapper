'use client';

import React, { useState } from 'react';
import { ApiEndpoint } from '../types';
import ApiList from '../components/ApiList';
import ApiDocumentation from '../components/ApiDocumentation';
import ApiTester from '../components/ApiTester';

export default function Home() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'docs' | 'test'>('docs');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Handle different possible JSON structures from "scrapper ui"
        // Let's assume it's an array of endpoints, or an object with a property containing endpoints
        let parsedEndpoints: ApiEndpoint[] = [];
        if (Array.isArray(data)) {
          parsedEndpoints = data;
        } else if (data.endpoints && Array.isArray(data.endpoints)) {
          parsedEndpoints = data.endpoints;
        } else if (data.apis && Array.isArray(data.apis)) {
          parsedEndpoints = data.apis;
        } else {
          // Wrap in array if it's a single object
          parsedEndpoints = [data];
        }

        // Add IDs if missing
        parsedEndpoints = parsedEndpoints.map((ep, idx) => ({
          ...ep,
          id: ep.id || `api-${idx}`,
          name: ep.name || ep.url || `Endpoint ${idx + 1}`,
          method: (ep.method || 'GET').toUpperCase()
        }));

        setEndpoints(parsedEndpoints);
        if (parsedEndpoints.length > 0) {
          setSelectedId(parsedEndpoints[0].id);
        }
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const selectedEndpoint = endpoints.find(e => e.id === selectedId);

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>API Center</h1>
          <label className="btn btn-outline" style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
            <span>Upload JSON File</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ApiList 
            endpoints={endpoints} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {selectedEndpoint ? (
          <>
            <div style={{ 
              padding: '1rem 2rem', 
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              gap: '1rem',
              background: 'rgba(22, 27, 34, 0.6)',
              backdropFilter: 'blur(8px)'
            }}>
              <button 
                className={`btn ${viewMode === 'docs' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('docs')}
              >
                Documentation
              </button>
              <button 
                className={`btn ${viewMode === 'test' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('test')}
              >
                Test Endpoint
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {viewMode === 'docs' ? (
                <ApiDocumentation endpoint={selectedEndpoint} />
              ) : (
                <ApiTester endpoint={selectedEndpoint} />
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.2 }}>🚀</div>
              <h2>Welcome to API Center</h2>
              <p>Upload a "scrapper ui" JSON file to get started.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
