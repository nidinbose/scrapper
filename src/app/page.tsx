'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { ApiEndpoint } from '../types';
import ApiList from '../components/ApiList';
import ApiDocumentation from '../components/ApiDocumentation';
import ApiTester from '../components/ApiTester';

export default function Home() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'docs' | 'test'>('docs');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchApiData = async () => {
    if (!apiUrl) return;
    setLoading(true);
    try {
      // Use the proxy if the URL is the production API
      const targetUrl = apiUrl.replace('https://api.support4funtalk.com', '/api-proxy');
      
      const response = await axios.get(targetUrl);
      const data = response.data;
      
      let parsedEndpoints: ApiEndpoint[] = [];
      if (Array.isArray(data)) {
        parsedEndpoints = data;
      } else if (data.endpoints && Array.isArray(data.endpoints)) {
        parsedEndpoints = data.endpoints;
      } else if (data.apis && Array.isArray(data.apis)) {
        parsedEndpoints = data.apis;
      } else {
        parsedEndpoints = [data];
      }

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
      alert("Failed to fetch API data. Please check the URL or CORS settings.");
    } finally {
      setLoading(false);
    }
  };

  const selectedEndpoint = endpoints.find(e => e.id === selectedId);

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>API Center</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="input" 
              placeholder="Enter API URL..." 
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <button 
              className="btn btn-primary" 
              onClick={fetchApiData}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Fetching...' : 'Fetch JSON'}
            </button>
          </div>
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
              <p>Enter an API URL to fetch your "scrapper ui" JSON data to get started.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
