import React from 'react';
import { ApiEndpoint } from '../types';

interface ApiDocumentationProps {
  endpoint: ApiEndpoint;
}

const renderSchema = (schema: any, level = 0): React.ReactNode => {
  if (!schema) return <span style={{ color: 'var(--text-secondary)' }}>No schema defined</span>;

  if (schema.$ref) {
    return <span style={{ color: 'var(--accent-color)' }}>{schema.$ref.split('/').pop()}</span>;
  }

  if (schema.type === 'object' && schema.properties) {
    return (
      <div style={{ marginLeft: level > 0 ? '1rem' : '0', marginTop: level > 0 ? '0.5rem' : '0' }}>
        {level === 0 && <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Object Properties:</div>}
        <table style={{ width: '100%', borderLeft: level > 0 ? '2px solid var(--border-color)' : 'none' }}>
          <tbody>
            {Object.entries(schema.properties).map(([key, prop]: [string, any]) => (
              <tr key={key}>
                <td style={{ width: '30%', verticalAlign: 'top', color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                  {key}
                  {schema.required?.includes(key) && <span style={{ color: 'var(--danger-color)', marginLeft: '4px' }}>*</span>}
                </td>
                <td style={{ verticalAlign: 'top' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    {prop.type || (prop.$ref ? 'reference' : 'any')} {prop.format ? `(${prop.format})` : ''}
                  </div>
                  {prop.description && <div style={{ marginBottom: '0.5rem' }}>{prop.description}</div>}
                  {prop.example !== undefined && (
                    <div style={{ fontSize: '0.8rem', background: 'var(--bg-alt)', padding: '0.2rem 0.4rem', display: 'inline-block', border: '1px solid var(--border-color)' }}>
                      Example: {JSON.stringify(prop.example)}
                    </div>
                  )}
                  {prop.enum && (
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Enum: {prop.enum.join(' | ')}
                    </div>
                  )}
                  {(prop.type === 'object' || prop.properties) && renderSchema(prop, level + 1)}
                  {prop.type === 'array' && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <strong>Array of:</strong>
                      {renderSchema(prop.items, level + 1)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (schema.type === 'array') {
    return (
      <div>
        <strong>Array of:</strong>
        {renderSchema(schema.items, level + 1)}
      </div>
    );
  }

  return <span>{schema.type}</span>;
};

export default function ApiDocumentation({ endpoint }: ApiDocumentationProps) {
  return (
    <div className="animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <span className={`badge badge-${endpoint.method.toLowerCase()}`} style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
            {endpoint.method}
          </span>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>{endpoint.name}</h1>
        </div>
        <div className="code-block" style={{ fontSize: '1.1rem', padding: '1rem', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
          {endpoint.url}
        </div>
        {endpoint.description && (
          <p style={{ marginTop: '1rem', fontSize: '1.1rem' }}>{endpoint.description}</p>
        )}
      </div>

      {/* Request Body */}
      {endpoint.body && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Request Body</h3>
          <pre className="code-block" style={{ margin: 0 }}>
            {JSON.stringify(endpoint.body, null, 2)}
          </pre>
        </div>
      )}

      {/* Response Schema */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Response Schema (200 / 201)</h3>
        <div style={{ overflowX: 'auto' }}>
          {renderSchema(endpoint.responseSchema)}
        </div>
      </div>

    </div>
  );
}
