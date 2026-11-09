import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong');
    err.status = res.status;
    throw err;
  }
  return data;
}