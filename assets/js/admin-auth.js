/**
 * Admin Authentication Utility
 * Handles authentication using httpOnly cookies (most secure)
 */

class AdminAuth {
  constructor() {
    this.API_BASE = 'http://127.0.0.1:5000/api';
    this.userEmail = null; // Store in memory only, not localStorage
    this.PREVIEW_MODE = localStorage.getItem('adminPreviewMode') === 'true';
  }

  /**
   * Store email in memory only
   */
  setEmail(email) {
    this.userEmail = email;
  }

  /**
   * Get email from memory
   */
  getEmail() {
    return this.userEmail;
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.userEmail = null;
  }

  /**
   * Verify token with backend (now checks if authenticated via cookies)
   */
  async verifyToken() {
    try {
      const response = await fetch(`${this.API_BASE}/auth/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies
      });
      
      let data;
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return { valid: false, message: 'Invalid response from server' };
      }

      if (!response.ok) {
        return { valid: false, message: data.message || 'Token verification failed' };
      }

      return { valid: true, user: data.user };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false, message: 'Backend connection failed' };
    }
  }

  /**
   * Check if user is authenticated - redirects to login if not
   * Returns user object with email from backend if authenticated
   */
  async requireAuth(redirectToLogin = true) {
    // Prevent redirect loops - don't redirect if already on login page
    const currentPage = window.location.pathname;
    if (currentPage.includes('admin_login.html')) {
      return false;
    }

    // In preview mode, allow access without authentication
    if (this.PREVIEW_MODE) {
      console.warn('⚠️ Admin Preview Mode: Showing admin pages without authentication');
      return true;
    }

    const result = await this.verifyToken();

    if (!result.valid) {
      if (redirectToLogin) {
        // Clear auth and redirect once
        this.clearAuth();
        window.location.replace('admin_login.html');
      }
      return false;
    }
    
    // Extract and store email from backend response (source of truth)
    if (result.user && result.user.email) {
      this.setEmail(result.user.email);
    }

    return true;
  }

  /**
   * Start periodic token validation (check every 5 minutes)
   */
  startTokenValidation() {
    // Check token immediately
    this.verifyToken().then(result => {
      if (!result.valid) {
        this.clearAuth();
        window.location.href = 'admin_login.html';
      }
    });

    // Re-check authentication when user returns to page via back button
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        // Page was restored from bfcache (back button)
        console.log('🔄 Page restored from cache, re-checking authentication...');
        this.verifyToken().then(result => {
          if (!result.valid) {
            this.clearAuth();
            window.location.replace('admin_login.html');
          }
        });
      }
    });

    // Then check every 5 minutes
    const tokenCheckInterval = setInterval(async () => {
      const result = await this.verifyToken();
      if (!result.valid) {
        this.clearAuth();
        window.location.href = 'admin_login.html';
      }
    }, 5 * 60 * 1000);

    return tokenCheckInterval;
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      console.log('🚪 Logging out...');
      // Backend will clear the httpOnly cookie
      const response = await fetch(`${this.API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies
      });

      console.log('📊 Logout response status:', response.status);
      const data = await response.json();
      console.log('✅ Logout response:', data);
      console.log('🍪 Cookie should be deleted now');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }

    console.log('🔄 Clearing auth...');
    this.clearAuth();
    
    // Wait a moment to ensure cookie deletion takes effect before redirecting
    console.log('⏳ Waiting 500ms before redirect...');
    setTimeout(() => {
      console.log('🚀 Redirecting to login...');
      window.location.replace('/pages/admin_login.html');
    }, 500);
  }

  /**
   * Perform login
   */
  async login(email, password) {
    try {
      console.log('🔐 Logging in with email:', email);
      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Include cookies
      });

      console.log(`📊 Login response status: ${response.status}`);

      const data = await response.json();
      console.log('📨 Login response:', data);

      if (!response.ok) {
        console.log(`❌ Login failed: ${data.message}`);
        return { success: false, message: data.message || 'Login failed' };
      }

      // Store email for display
      this.setEmail(email);
      console.log('✅ Email stored. Cookie should be set by backend');
      console.log('🍪 Checking cookies in document...');
      console.log('Cookies:', document.cookie);
      
      // Cookie is automatically set by backend

      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, message: 'Connection error. Please try again.' };
    }
  }
}

// Create global instance
const adminAuth = new AdminAuth();
