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
        No APIs loaded. Please provide a valid JSON file or fetch a URL.
      </div>
    );
  }

  const getMethodClass = (method: string) => {
    const m = method.toLowerCase();
    // In monochrome, badges just use border. But we can add faint backgrounds if needed.
    // For pure monochrome, they rely on globals.css .badge defaults.
    return `badge badge-${m}`;
  };

  // Group by tag
  const groupedEndpoints = endpoints.reduce((acc, ep) => {
    const tag = ep.tag || 'Uncategorized';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(ep);
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {Object.entries(groupedEndpoints).map(([tag, eps]) => (
        <div key={tag} style={{ marginBottom: '0.5rem' }}>
          <div className="category-header">
            {tag}
          </div>
          <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {eps.map((ep) => (
              <div
                key={ep.id}
                className="glass-card"
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  border: selectedId === ep.id ? '1px solid var(--accent-color)' : '',
                  background: selectedId === ep.id ? 'var(--bg-color)' : '',
                  boxShadow: selectedId === ep.id ? '0 2px 8px rgba(0,0,0,0.05)' : ''
                }}
                onClick={() => onSelect(ep.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className={getMethodClass(ep.method)}>{ep.method}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ep.name}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                  {ep.url.replace(/^.*\/\/[^\/]+/, '')} {/* Show only path for cleaner look */}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
