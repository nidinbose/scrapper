export interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string;
  url: string;
  description?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  responseSchema?: any;
}
