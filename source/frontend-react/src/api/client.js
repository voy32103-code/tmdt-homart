const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiCall(path, options = {}, token = '') {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
  }

  return body;
}
