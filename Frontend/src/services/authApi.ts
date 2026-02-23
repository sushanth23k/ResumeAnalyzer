export const AUTH_BASE_URL = 'http://127.0.0.1:8000/auth';

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// ─── Signup ───────────────────────────────────────────────────────────────────

export async function signupApi(
  email: string,
  password1: string,
  password2: string,
): Promise<{ email: string }> {
  const res = await fetch(`${AUTH_BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password1, password2 }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Signup failed');
  return data.data;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Login failed');
  return data.data;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutApi(refreshToken: string, accessToken: string): Promise<void> {
  await fetch(`${AUTH_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });
}

// ─── Token Refresh ────────────────────────────────────────────────────────────

export async function refreshTokenApi(refreshToken: string): Promise<string> {
  const res = await fetch(`${AUTH_BASE_URL}/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  const data = await res.json();
  if (!data.success) throw new Error('Token refresh failed');
  return data.data.access;
}

// ─── Resend Verification ──────────────────────────────────────────────────────

export async function resendVerificationApi(email: string): Promise<void> {
  const res = await fetch(`${AUTH_BASE_URL}/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to resend');
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export async function verifyEmailApi(key: string): Promise<void> {
  const res = await fetch(`${AUTH_BASE_URL}/verify-email/${key}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Verification failed');
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function passwordResetApi(email: string): Promise<void> {
  await fetch(`${AUTH_BASE_URL}/password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function passwordResetConfirmApi(
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string,
): Promise<void> {
  const res = await fetch(`${AUTH_BASE_URL}/password/reset/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, token, new_password1: newPassword1, new_password2: newPassword2 }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Password reset failed');
}
