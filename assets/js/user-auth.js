/**
 * user-auth.js
 * Handles user authentication via Google OAuth.
 * Uses localStorage to store the JWT token to avoid cross-origin cookie issues in dev.
 * The httpOnly cookie is still set by the backend as a security layer in production.
 */

const AUTH_API_BASE = (typeof API_BASE !== 'undefined')
  ? API_BASE
  : ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000/api'
      : '/api');

const USER_API = `${AUTH_API_BASE}/auth`;
const TOKEN_KEY = 'userToken';
const USER_CACHE_KEY = 'userCache';
const GUEST_CART_KEY = 'guestCart';

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
   * Merge guest cart items into authenticated user cart.
   * Keeps failed items in guest storage for retry.
   */
  mergeGuestCart: async (token) => {
    let guestItems = [];

    try {
      guestItems = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    } catch {
      guestItems = [];
    }

    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return { merged: 0, failed: 0 };
    }

    const failedItems = [];
    let mergedCount = 0;

    for (const item of guestItems) {
      const productId = item && item.productId;
      const quantity = Math.max(1, Number(item && item.quantity) || 1);

      if (!productId) {
        continue;
      }

      try {
        const res = await fetch(`${AUTH_API_BASE}/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({ productId, quantity })
        });

        if (!res.ok) {
          failedItems.push({ productId, quantity });
          continue;
        }

        mergedCount += 1;
      } catch {
        failedItems.push({ productId, quantity });
      }
    }

    if (failedItems.length > 0) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(failedItems));
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }

    return { merged: mergedCount, failed: failedItems.length };
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

      try {
        await userAuth.mergeGuestCart(data.token);
      } catch (err) {
        console.warn('Guest cart merge failed after login:', err);
      }
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

// Ensure availability from inline callbacks and other scripts.
window.userAuth = userAuth;
