import React, { useState } from 'react';
import { ApiEndpoint } from '../types';

interface ApiListProps {
  endpoints: ApiEndpoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ApiList({ endpoints, selectedId, onSelect }: ApiListProps) {
  const [filterTag, setFilterTag] = useState<string>('All');

  if (endpoints.length === 0) {
    return (
      <div style={{ padding: '2rem 1.5rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        No APIs loaded. Please provide a valid JSON file or fetch a URL.
      </div>
    );
  }

  const getMethodClass = (method: string) => {
    const m = method.toLowerCase();
    return `badge badge-${m}`;
  };

  // Group by tag
  const groupedEndpoints = endpoints.reduce((acc, ep) => {
    const tag = ep.tag || 'Uncategorized';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(ep);
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  const tags = Object.keys(groupedEndpoints).sort();
  const filteredTags = filterTag === 'All' ? tags : [filterTag];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Category Filter */}
      {tags.length > 1 && (
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <select 
            value={filterTag} 
            onChange={(e) => setFilterTag(e.target.value)}
            className="input"
            style={{ padding: '0.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }}
          >
            <option value="All">All Categories</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      )}

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
        {filteredTags.map((tag) => (
          <div key={tag} style={{ marginBottom: '1rem' }}>
            <div className="category-header">
              {tag}
            </div>
            <div style={{ padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {groupedEndpoints[tag].map((ep) => {
                const isSelected = selectedId === ep.id;
                return (
                  <div
                    key={ep.id}
                    className="glass-card"
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--accent-color)' : '',
                      background: isSelected ? 'var(--bg-alt)' : 'var(--bg-card)',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      transform: isSelected ? 'translateX(2px)' : 'none'
                    }}
                    onClick={() => onSelect(ep.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <span className={getMethodClass(ep.method)}>{ep.method}</span>
                      <span style={{ fontWeight: isSelected ? 600 : 500, fontSize: '0.85rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {ep.name}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--text-secondary)', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap', 
                      fontFamily: 'var(--font-mono)' 
                    }}>
                      {ep.url.replace(/^.*\/\/[^\/]+/, '')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
