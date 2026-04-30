'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { ApiEndpoint } from '../types';
import ApiList from '../components/ApiList';
import ApiDocumentation from '../components/ApiDocumentation';
import ApiTester from '../components/ApiTester';

const resolveSchema = (schema: any, components: any, seen = new Set<string>()): any => {
  if (!schema) return schema;
  if (schema.$ref && components?.schemas) {
    const refName = schema.$ref.split('/').pop();
    if (refName && components.schemas[refName] && !seen.has(refName)) {
      seen.add(refName);
      return resolveSchema(components.schemas[refName], components, seen);
    }
    return { type: 'object', description: `Recursive reference: ${refName}` };
  }

  if (schema.type === 'object' && schema.properties) {
    const newProps: any = {};
    for (const [k, v] of Object.entries(schema.properties)) {
      newProps[k] = resolveSchema(v, components, new Set(seen));
    }
    return { ...schema, properties: newProps };
  }

  if (schema.type === 'array' && schema.items) {
    return { ...schema, items: resolveSchema(schema.items, components, new Set(seen)) };
  }

  return schema;
};

export default function Home() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'docs' | 'test'>('docs');
  const [apiUrl, setApiUrl] = useState<string>('https://api.support4funtalk.com');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchApiData = async () => {
    if (!apiUrl) return;
    setLoading(true);
    try {
      // Use the proxy if the URL is the production API
      const targetUrl = apiUrl.includes('api.support4funtalk.com')
        ? apiUrl.replace('https://api.support4funtalk.com', '/api-proxy')
        : apiUrl;

      const response = await axios.get(targetUrl);
      const data = response.data;

      let parsedEndpoints: ApiEndpoint[] = [];
      if (data.openapi && data.paths) {
        const baseUrl = 'https://api.support4funtalk.com';
        let idx = 0;
        for (const [pathUrl, methods] of Object.entries(data.paths)) {
          for (const [method, details] of Object.entries(methods as Record<string, any>)) {
            let bodyData: Record<string, any> | undefined = undefined;
            const schema = details.requestBody?.content?.['application/json']?.schema;
            if (schema && schema.properties) {
              bodyData = {};
              for (const [key, prop] of Object.entries(schema.properties as Record<string, any>)) {
                bodyData[key] = prop.example !== undefined ? prop.example : (prop.type === 'string' ? '' : null);
              }
            }
            const fullUrl = `${baseUrl}${pathUrl}`;
            parsedEndpoints.push({
              id: `api-${idx++}`,
              name: details.summary || `${method.toUpperCase()} ${pathUrl}`,
              method: method.toUpperCase(),
              url: fullUrl,
              description: details.description,
              tag: details.tags?.[0] || 'Default',
              body: bodyData,
              responseSchema: (() => {
                let rawSchema = details.responses?.['200']?.content?.['application/json']?.schema || details.responses?.['201']?.content?.['application/json']?.schema;
                if (rawSchema) {
                  return resolveSchema(rawSchema, data.components);
                }
                // Fallback to examples if no schema
                const content = details.responses?.['200']?.content?.['application/json'] || details.responses?.['201']?.content?.['application/json'];
                if (content?.examples) {
                  return { type: 'object', examples: content.examples };
                } else if (content?.example) {
                  return { type: 'object', example: content.example };
                }
                return null;
              })(),
            });
          }
        }
      } else if (Array.isArray(data)) {
        parsedEndpoints = data;
      } else if (data && typeof data === 'object') {
        if (data.endpoints && Array.isArray(data.endpoints)) {
          parsedEndpoints = data.endpoints;
        } else if (data.apis && Array.isArray(data.apis)) {
          parsedEndpoints = data.apis;
        } else if (data.openapi || data.swagger) {
           // It's an OpenAPI document but missing paths or we couldn't parse it
           alert("OpenAPI JSON was fetched, but it contains no 'paths' definitions.");
           parsedEndpoints = [];
        } else {
          // It's just a single JSON object endpoint definition
          parsedEndpoints = [data];
        }
      } else {
        alert("The URL did not return a valid API JSON. It might have returned HTML.");
        setEndpoints([]);
        setLoading(false);
        return;
      }

      parsedEndpoints = parsedEndpoints.map((ep, idx) => ({
        ...ep,
        id: ep.id || `api-${idx}`,
        name: ep.name || ep.url || `Endpoint ${idx + 1}`,
        method: (ep.method || 'GET').toUpperCase()
      }));

      if (parsedEndpoints.length === 0 && data?.openapi) {
         alert("The OpenAPI JSON was fetched successfully, but it contains an empty 'paths' object. The backend swagger configuration might be missing route annotations.");
      }

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
