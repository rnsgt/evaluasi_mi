import api from './api';

const authService = {
  /**
   * Login with NIM/Email and password
   * @param {string} nim - NIM or Email
   * @param {string} password 
   * @returns {Promise<{token: string, user: Object}>}
   */
  login: async (nim, password) => {
    const response = await api.post('/auth/login', { 
      identifier: nim, 
      password 
    });
    return response.data || response;
  },

  /**
   * Logout current user (just clear local storage for stateless JWT)
   * @returns {Promise<void>}
   */
  logout: async () => {
    // For stateless JWT, just clear local storage
    // Backend doesn't need to be notified
    return Promise.resolve();
  },

  /**
   * Register new user
   * @param {Object} userData 
   * @returns {Promise<{token: string, user: Object}>}
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data || response;
  },

  /**
   * Change password
   * @param {string} oldPassword 
   * @param {string} newPassword 
   * @param {string} newPasswordConfirmation 
   * @returns {Promise<Object>}
   */
  changePassword: async (oldPassword, newPassword, newPasswordConfirmation) => {
    const response = await api.put('/auth/change-password', {
      oldPassword,
      newPassword,
      newPasswordConfirmation,
    });
    return response;
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>}
   */
  getProfile: async () => {
    return await api.get('/auth/profile');
  },

  /**
   * Forgot password - Check user
   * @param {string} identifier - NIM or Email
   */
  forgotPassword: async (identifier) => {
    const response = await api.post('/auth/forgot-password', { identifier });
    return response;
  },

  /**
   * Reset password
   * @param {string} identifier - NIM or Email
   * @param {string} newPassword
   */
  resetPassword: async (identifier, newPassword) => {
    const response = await api.post('/auth/reset-password', { 
      identifier, 
      newPassword 
    });
    return response;
  },
};

export default authService;
