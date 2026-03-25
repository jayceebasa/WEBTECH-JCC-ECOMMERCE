/**
 * user-auth.js
 * Handles user authentication via Google OAuth.
 * Uses localStorage to store the JWT token to avoid cross-origin cookie issues in dev.
 * The httpOnly cookie is still set by the backend as a security layer in production.
 */

const USER_API = '/api/auth';
const TOKEN_KEY = 'userToken';
const USER_CACHE_KEY = 'userCache';

const userAuth = {
  _getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  _getCachedUser() {
    try {
      const raw = localStorage.getItem(USER_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  _setCachedUser(user) {
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  },

  /**
   * Send the Google ID token credential to the backend.
   * Stores the returned JWT and user in localStorage for subsequent requests.
   */
  googleLogin: async (credential) => {
    const res = await fetch(`${USER_API}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential })
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      userAuth._setCachedUser(data.user);
    }
    return data;
  },

  /**
   * Verify that the current session is still valid.
   */
  verifySession: async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return false;
      const res = await fetch(`${USER_API}/user/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data.valid === true;
    } catch {
      return false;
    }
  },

  /**
   * Returns cached user instantly, then fetches fresh data in background.
   * Pass onUpdate callback to re-render if the fresh result differs.
   */
  getMe: async (onUpdate) => {
    const cached = userAuth._getCachedUser();
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      userAuth._setCachedUser(null);
      return null;
    }

    // Fetch fresh data in background
    fetch(`${USER_API}/user/me`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(async res => {
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          userAuth._setCachedUser(null);
          if (onUpdate) onUpdate(null);
        }
        return;
      }
      const data = await res.json();
      const freshUser = data.success ? data.user : null;
      // Only trigger re-render if something changed
      if (JSON.stringify(freshUser) !== JSON.stringify(cached)) {
        userAuth._setCachedUser(freshUser);
        if (onUpdate) onUpdate(freshUser);
      }
    }).catch(() => {});

    return cached;
  },

  /**
   * Log out the current user.
   */
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
    try {
      await fetch(`${USER_API}/user/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // Ignore network errors on logout
    }
  }
};
