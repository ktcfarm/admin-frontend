export const env = Object.freeze({
  VITE_API_BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:4000/api/v1/admin',
  NODE_ENV: (typeof import.meta !== 'undefined' && import.meta.env?.MODE) || 'development'
});

export default env;
