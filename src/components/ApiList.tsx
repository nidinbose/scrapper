import React from 'react';
import { ApiEndpoint } from '../types';

interface ApiListProps {
  endpoints: ApiEndpoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ApiList({ endpoints, selectedId, onSelect }: ApiListProps) {
  if (endpoints.length === 0) {
    return (
      <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
        No APIs loaded. Please provide a valid JSON file.
      </div>
    );
  }

  const getMethodClass = (method: string) => {
    const m = method.toLowerCase();
    return `badge badge-${m}`;
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Endpoints</h2>
      {endpoints.map((ep) => (
        <div
          key={ep.id}
          className="glass-card"
          style={{
            padding: '0.75rem',
            cursor: 'pointer',
            border: selectedId === ep.id ? '1px solid var(--accent-color)' : '',
            background: selectedId === ep.id ? 'rgba(88, 166, 255, 0.1)' : ''
          }}
          onClick={() => onSelect(ep.id)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className={getMethodClass(ep.method)}>{ep.method}</span>
            <span style={{ fontWeight: 500, fontSize: '0.9rem', color: '#fff' }}>{ep.name}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ep.url}
          </div>
        </div>
      ))}
    </div>
  );
}
