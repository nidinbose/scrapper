import React from 'react';
import { ApiEndpoint } from '../types';

interface ApiDocumentationProps {
  endpoint: ApiEndpoint;
}

export default function ApiDocumentation({ endpoint }: ApiDocumentationProps) {
  return (
    <div className="animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className={`badge badge-${endpoint.method.toLowerCase()}`} style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
            {endpoint.method}
          </span>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>{endpoint.name}</h1>
        </div>
        <div className="code-block" style={{ fontSize: '1.1rem', padding: '1rem', display: 'flex', alignItems: 'center' }}>
          {endpoint.url}
        </div>
      </div>

      {endpoint.description && (
        <div>
          <h3>Description</h3>
          <p>{endpoint.description}</p>
        </div>
      )}

      {endpoint.headers && Object.keys(endpoint.headers).length > 0 && (
        <div>
          <h3>Headers</h3>
          <div className="glass-card" style={{ padding: '1rem' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Key</th>
                  <th style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(endpoint.headers).map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '0.5rem 0', color: 'var(--accent-color)' }}>{k}</td>
                    <td style={{ padding: '0.5rem 0' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {endpoint.params && Object.keys(endpoint.params).length > 0 && (
        <div>
          <h3>Query Parameters</h3>
          <div className="glass-card" style={{ padding: '1rem' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Parameter</th>
                  <th style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Description/Type</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(endpoint.params).map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: '0.5rem 0', color: 'var(--accent-color)' }}>{k}</td>
                    <td style={{ padding: '0.5rem 0' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {endpoint.body && (
        <div>
          <h3>Request Body</h3>
          <pre className="code-block">
            {JSON.stringify(endpoint.body, null, 2)}
          </pre>
        </div>
      )}

      {endpoint.responseSchema && (
        <div>
          <h3>Response Schema</h3>
          <pre className="code-block">
            {JSON.stringify(endpoint.responseSchema, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
