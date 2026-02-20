import api from './api';

// Mock users untuk testing (hapus nanti setelah backend ready)
const MOCK_USERS = {
  // Mahasiswa
  '2301010001': {
    password: '123456',
    user: {
      id: 1,
      nim: '2301010001',
      nama: 'Ahmad Rizki',
      email: 'rizki@student.ac.id',
      prodi: 'Manajemen Informatika',
      angkatan: '2023',
      semester: 3,
      status_akademik: 'Aktif',
      ipk: 3.75,
      role: 'mahasiswa',
    },
  },
  // Admin
  'admin': {
    password: 'admin123',
    user: {
      id: 2,
      nim: 'admin',
      nama: 'Administrator',
      email: 'admin@kampus.ac.id',
      prodi: '-',
      role: 'admin',
    },
  },
};

const authService = {
  /**
   * Login with NIM and password
   * @param {string} nim 
   * @param {string} password 
   * @returns {Promise<{token: string, user: Object}>}
   */
  login: async (nim, password) => {
    // MOCK LOGIN - Hapus setelah backend ready
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUser = MOCK_USERS[nim];
        
        if (!mockUser) {
          reject(new Error('NIM tidak ditemukan'));
          return;
        }
        
        if (mockUser.password !== password) {
          reject(new Error('Password salah'));
          return;
        }
        
        resolve({
          token: `mock-token-${nim}-${Date.now()}`,
          user: mockUser.user,
        });
      }, 1000); // Simulate network delay
    });

    // REAL API CALL - Uncomment setelah backend ready
    // const response = await api.post('/auth/login', { nim, password });
    // return response.data;
  },

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  logout: async () => {
    // MOCK LOGOUT - Hapus setelah backend ready
    return Promise.resolve();
    
    // REAL API CALL - Uncomment setelah backend ready
    // return await api.post('/auth/logout');
  },

  /**
   * Register new user
   * @param {Object} userData 
   * @returns {Promise<{token: string, user: Object}>}
   */
  register: async (userData) => {
    // MOCK REGISTER - Hapus setelah backend ready
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Cek apakah NIM sudah terdaftar
        if (MOCK_USERS[userData.nim]) {
          reject(new Error('NIM sudah terdaftar'));
          return;
        }
        
        // Simpan user baru ke MOCK_USERS
        const newUser = {
          id: Object.keys(MOCK_USERS).length + 1,
          nim: userData.nim,
          nama: userData.nama,
          email: userData.email,
          prodi: userData.prodi,
          angkatan: userData.angkatan,
          semester: 1,
          status_akademik: 'Aktif',
          ipk: 0.0,
          role: 'mahasiswa',
        };
        
        MOCK_USERS[userData.nim] = {
          password: userData.password,
          user: newUser,
        };
        
        resolve({
          token: `mock-token-${userData.nim}-${Date.now()}`,
          user: newUser,
        });
      }, 1000);
    });

    // REAL API CALL - Uncomment setelah backend ready
    // const response = await api.post('/auth/register', userData);
    // return response.data;
  },

  /**
   * Change password
   * @param {string} oldPassword 
   * @param {string} newPassword 
   * @param {string} newPasswordConfirmation 
   * @returns {Promise<Object>}
   */
  changePassword: async (oldPassword, newPassword, newPasswordConfirmation) => {
    return await api.put('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>}
   */
  getProfile: async () => {
    return await api.get('/auth/profile');
  },
};

export default authService;
