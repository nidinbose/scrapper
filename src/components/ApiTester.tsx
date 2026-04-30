'use client';

import React, { useState, useEffect } from 'react';
import { ApiEndpoint } from '../types';

interface ApiTesterProps {
  endpoint: ApiEndpoint;
}

export default function ApiTester({ endpoint }: ApiTesterProps) {
  const [url, setUrl] = useState(endpoint.url);
  const [method, setMethod] = useState(endpoint.method);
  const [headers, setHeaders] = useState(JSON.stringify(endpoint.headers || {}, null, 2));
  const [body, setBody] = useState(JSON.stringify(endpoint.body || {}, null, 2));
  
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  // Reset states when endpoint changes
  useEffect(() => {
    setUrl(endpoint.url);
    setMethod(endpoint.method);
    setHeaders(JSON.stringify(endpoint.headers || {}, null, 2));
    setBody(endpoint.body ? JSON.stringify(endpoint.body, null, 2) : '');
    setResponse(null);
    setError(null);
    setStatus(null);
  }, [endpoint]);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setStatus(null);
    
    try {
      let parsedHeaders = {};
      try {
        if (headers.trim()) {
          parsedHeaders = JSON.parse(headers);
        }
      } catch (e) {
        throw new Error("Invalid Headers JSON");
      }

      let parsedBody = undefined;
      try {
        if (body.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
          parsedBody = JSON.stringify(JSON.parse(body));
        }
      } catch (e) {
        throw new Error("Invalid Body JSON");
      }

      // Use proxy for production API
      const targetUrl = url.replace('https://api.support4funtalk.com', '/api-proxy');

      const res = await fetch(targetUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders
        },
        body: parsedBody
      });

      setStatus(res.status);
      const data = await res.json().catch(() => null) || await res.text();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Test Endpoint</h2>
      
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={method} 
            onChange={e => setMethod(e.target.value)}
            className="input" 
            style={{ width: '120px' }}
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
            <option>PATCH</option>
          </select>
          <input 
            type="text" 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            className="input" 
            placeholder="https://api.example.com/v1/resource"
          />
          <button 
            className="btn btn-primary" 
            onClick={handleTest} 
            disabled={loading}
            style={{ minWidth: '100px' }}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Headers (JSON)</label>
            <textarea 
              value={headers}
              onChange={e => setHeaders(e.target.value)}
              className="input textarea"
              style={{ minHeight: '150px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Body (JSON)</label>
            <textarea 
              value={body}
              onChange={e => setBody(e.target.value)}
              className="input textarea"
              style={{ minHeight: '150px' }}
              disabled={!['POST', 'PUT', 'PATCH'].includes(method)}
            />
          </div>
        </div>
      </div>

      {(response || error) && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <h3>Response</h3>
            {status && (
              <span className={`badge ${status >= 200 && status < 300 ? 'badge-get' : 'badge-delete'}`}>
                {status}
              </span>
            )}
          </div>
          
          <div className="glass-card" style={{ padding: '1rem' }}>
            {error ? (
              <div style={{ color: 'var(--danger-color)', fontFamily: 'var(--font-mono)' }}>
                Error: {error}
              </div>
            ) : (
              <pre className="code-block" style={{ margin: 0, maxHeight: '400px', overflowY: 'auto' }}>
                {typeof response === 'object' ? JSON.stringify(response, null, 2) : response}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
