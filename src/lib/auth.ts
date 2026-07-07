import { supabase } from './supabase';

const AUTH_FUNCTION_URL = 'https://<your-project>.supabase.co/functions/v1/auth-telegram'; // 🔁 REPLACE with your actual Edge Function URL

export async function authenticateTelegram(initData: string) {
  const response = await fetch(AUTH_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData }),
  });

  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  const { token, user } = await response.json();
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user', JSON.stringify(user));

  return { user, token };
}

export function getStoredAuth() {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');
  if (token && user) {
    return { token, user: JSON.parse(user) };
  }
  return null;
}

export function clearAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}
