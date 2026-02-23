import { refreshTokenApi } from '../services/authApi';

const STORAGE_ACCESS = 'auth_access_token';
const STORAGE_REFRESH = 'auth_refresh_token';

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

function notifyPending(newToken: string) {
  pendingRequests.forEach(cb => cb(newToken));
  pendingRequests = [];
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem(STORAGE_REFRESH);
  if (!refreshToken) return null;

  if (isRefreshing) {
    return new Promise(resolve => {
      pendingRequests.push(resolve);
    });
  }

  isRefreshing = true;
  try {
    const newAccess = await refreshTokenApi(refreshToken);
    localStorage.setItem(STORAGE_ACCESS, newAccess);
    notifyPending(newAccess);
    return newAccess;
  } catch {
    localStorage.removeItem(STORAGE_ACCESS);
    localStorage.removeItem(STORAGE_REFRESH);
    localStorage.removeItem('auth_user');
    window.dispatchEvent(new Event('auth:logout'));
    return null;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Authenticated fetch wrapper.
 * Attaches Bearer token, auto-refreshes on 401, redirects to login on failure.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem(STORAGE_ACCESS);

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const newToken = await tryRefresh();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    } else {
      window.location.href = '/auth/login';
    }
  }

  return response;
}
