// Dosen Service dengan AsyncStorage untuk CRUD operations
// Data dapat dikelola oleh admin (Create, Read, Update, Delete)

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@dosen_data';

// Daftar Mata Kuliah yang tersedia
export const MATA_KULIAH_LIST = [
  { id: 1, kode: 'MK001', nama: 'Pemrograman Web' },
  { id: 2, kode: 'MK002', nama: 'Basis Data' },
  { id: 3, kode: 'MK003', nama: 'Jaringan Komputer' },
  { id: 4, kode: 'MK004', nama: 'Sistem Operasi' },
  { id: 5, kode: 'MK005', nama: 'Algoritma & Struktur Data' },
  { id: 6, kode: 'MK006', nama: 'Kecerdasan Buatan' },
  { id: 7, kode: 'MK007', nama: 'Machine Learning' },
  { id: 8, kode: 'MK008', nama: 'Pemrograman Mobile' },
  { id: 9, kode: 'MK009', nama: 'Framework Web' },
  { id: 10, kode: 'MK010', nama: 'Matematika Diskrit' },
  { id: 11, kode: 'MK011', nama: 'Logika Informatika' },
  { id: 12, kode: 'MK012', nama: 'Keamanan Informasi' },
  { id: 13, kode: 'MK013', nama: 'Kriptografi' },
  { id: 14, kode: 'MK014', nama: 'Statistika' },
  { id: 15, kode: 'MK015', nama: 'Analisis Data' },
  { id: 16, kode: 'MK016', nama: 'Interaksi Manusia Komputer' },
  { id: 17, kode: 'MK017', nama: 'Desain UI/UX' },
  { id: 18, kode: 'MK018', nama: 'Cloud Computing' },
  { id: 19, kode: 'MK019', nama: 'Sistem Terdistribusi' },
  { id: 20, kode: 'MK020', nama: 'Data Mining' },
];

const INITIAL_DOSEN = [
  {
    id: 1,
    nip: '197805152005011001',
    nama: 'Dr. Ahmad Fauzi, M.Kom',
    mata_kuliah: ['Pemrograman Web', 'Basis Data'],
    email: 'ahmad.fauzi@kampus.ac.id',
    bio: 'Dosen berpengalaman dalam bidang Web Development',
    status: 'aktif',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 2,
    nip: '198203102008012002',
    nama: 'Ir. Siti Nurhaliza, M.T',
    mata_kuliah: ['Jaringan Komputer', 'Sistem Operasi'],
    email: 'siti.nurhaliza@kampus.ac.id',
    bio: 'Spesialis dalam jaringan dan infrastruktur TI',
    status: 'aktif',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 3,
    nip: '199001152012011003',
    nama: 'Budi Santoso, S.Kom, M.Sc',
    mata_kuliah: ['Algoritma & Struktur Data'],
    email: 'budi.santoso@kampus.ac.id',
    bio: 'Expert dalam algoritma dan pemrograman kompetitif',
    status: 'aktif',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 4,
    nip: '198506202010012004',
    nama: 'Prof. Dr. Rina Kusuma, M.T',
    mata_kuliah: ['Kecerdasan Buatan', 'Machine Learning'],
    email: 'rina.kusuma@kampus.ac.id',
    bio: 'Profesor dalam bidang AI dan Machine Learning',
    status: 'aktif',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 5,
    nip: '199205102015011005',
    nama: 'Drs. Hadi Wijaya, M.Kom',
    mata_kuliah: ['Pemrograman Mobile', 'Framework Web'],
    email: 'hadi.wijaya@kampus.ac.id',
    bio: 'Praktisi dan dosen mobile development',
    status: 'aktif',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 6,
    nip: '198809152011012006',
    nama: 'Dr. Mega Sari, S.Si, M.Kom',
    mata_kuliah: ['Matematika Diskrit', 'Logika Informatika'],
    email: 'mega.sari@kampus.ac.id',
    bio: 'Ahli matematika komputasi dan logika',
    status: 'aktif',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 7,
    nip: '199510202018011007',
    nama: 'Andri Pratama, S.Kom, M.CS',
    mata_kuliah: ['Keamanan Informasi', 'Kriptografi'],
    email: 'andri.pratama@kampus.ac.id',
    bio: 'Cybersecurity specialist dan ethical hacker',
    status: 'aktif',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 8,
    nip: '198712152009012008',
    nama: 'Dra. Lestari Indah, M.SI',
    mata_kuliah: ['Statistika', 'Analisis Data'],
    email: 'lestari.indah@kampus.ac.id',
    bio: 'Data scientist dan statistician',
    status: 'aktif',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 9,
    nip: '199308202016011009',
    nama: 'Rizky Firmansyah, S.T, M.Eng',
    mata_kuliah: ['Interaksi Manusia Komputer', 'Desain UI/UX'],
    email: 'rizky.firmansyah@kampus.ac.id',
    bio: 'UI/UX designer dan HCI researcher',
    status: 'aktif',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 10,
    nip: '198604102010012010',
    nama: 'Dr. Eng. Wahyu Setiawan, S.Kom, M.Kom',
    mata_kuliah: ['Cloud Computing', 'Sistem Terdistribusi'],
    email: 'wahyu.setiawan@kampus.ac.id',
    bio: 'Cloud architect dan distributed systems expert',
    status: 'aktif',
    foto_url: null,
    created_at: '2024-01-15T08:00:00.000Z',
    updated_at: '2024-01-15T08:00:00.000Z',
  },
];

/**
 * Initialize dosen data in AsyncStorage (First time only)
 */
const initializeDosen = async () => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (!existing) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOSEN));
    }
  } catch (error) {
    console.error('Initialize dosen error:', error);
  }
};

// Initialize on module load
initializeDosen();

/**
 * Get semua dosen
 * @param {boolean} includeInactive - Include inactive dosen (for admin)
 * @returns {Promise<Array>} Array of dosen
 */
export const getAllDosen = async (includeInactive = false) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const dosen = data ? JSON.parse(data) : [];
    
    if (includeInactive) {
      return dosen.sort((a, b) => b.id - a.id);
    }
    
    return dosen.filter((d) => d.status === 'aktif').sort((a, b) => b.id - a.id);
  } catch (error) {
    console.error('Get all dosen error:', error);
    return [];
  }
};

/**
 * Get dosen by ID
 * @param {number} id - Dosen ID
 * @returns {Promise<Object>} Dosen object
 */
export const getDosenById = async (id) => {
  try {
    const allDosen = await getAllDosen(true);
    const dosen = allDosen.find((d) => d.id === id);
    if (!dosen) {
      throw new Error('Dosen tidak ditemukan');
    }
    return dosen;
  } catch (error) {
    console.error('Get dosen by ID error:', error);
    throw error;
  }
};

/**
 * Create new dosen
 * @param {Object} data - Dosen data
 * @returns {Promise<Object>} Created dosen
 */
export const createDosen = async (data) => {
  try {
    const allDosen = await getAllDosen(true);
    
    // Check if NIP already exists
    const exists = allDosen.find((d) => d.nip === data.nip);
    if (exists) {
      throw new Error('NIP sudah terdaftar');
    }
    
    const newId = allDosen.length > 0 
      ? Math.max(...allDosen.map((d) => d.id)) + 1 
      : 1;
    
    const newDosen = {
      id: newId,
      ...data,
      status: data.status || 'aktif',
      foto_url: data.foto_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    allDosen.push(newDosen);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allDosen));
    
    return newDosen;
  } catch (error) {
    console.error('Create dosen error:', error);
    throw error;
  }
};

/**
 * Update existing dosen
 * @param {number} id - Dosen ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} Updated dosen
 */
export const updateDosen = async (id, data) => {
  try {
    const allDosen = await getAllDosen(true);
    const index = allDosen.findIndex((d) => d.id === id);
    
    if (index === -1) {
      throw new Error('Dosen tidak ditemukan');
    }
    
    // Check if new NIP conflicts with other dosen
    if (data.nip) {
      const nipExists = allDosen.find(
        (d) => d.id !== id && d.nip === data.nip
      );
      if (nipExists) {
        throw new Error('NIP sudah terdaftar');
      }
    }
    
    allDosen[index] = {
      ...allDosen[index],
      ...data,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allDosen));
    return allDosen[index];
  } catch (error) {
    console.error('Update dosen error:', error);
    throw error;
  }
};

/**
 * Delete dosen
 * @param {number} id - Dosen ID
 * @returns {Promise<Object>} Result object
 */
export const deleteDosen = async (id) => {
  try {
    const allDosen = await getAllDosen(true);
    const filtered = allDosen.filter((d) => d.id !== id);
    
    if (filtered.length === allDosen.length) {
      return {
        success: false,
        message: 'Dosen tidak ditemukan'
      };
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    return {
      success: true,
      message: 'Dosen berhasil dihapus'
    };
  } catch (error) {
    console.error('Delete dosen error:', error);
    return {
      success: false,
      message: error.message || 'Gagal menghapus dosen'
    };
  }
};

/**
 * Toggle dosen status (aktif/tidak_aktif)
 * @param {number} id - Dosen ID
 * @returns {Promise<Object>} Updated dosen
 */
export const toggleStatus = async (id) => {
  try {
    const dosen = await getDosenById(id);
    const newStatus = dosen.status === 'aktif' ? 'tidak_aktif' : 'aktif';
    return await updateDosen(id, { status: newStatus });
  } catch (error) {
    console.error('Toggle status error:', error);
    throw error;
  }
};

/**
 * Search dosen by nama or NIP
 * @param {string} query - Search query
 * @param {boolean} includeInactive - Include inactive dosen
 * @returns {Promise<Array>} Filtered dosen
 */
export const searchDosen = async (query, includeInactive = false) => {
  try {
    const allDosen = await getAllDosen(includeInactive);
    
    if (!query || query.trim() === '') {
      return allDosen;
    }
    
    const lowerQuery = query.toLowerCase();
    return allDosen.filter(
      (d) =>
        d.nama.toLowerCase().includes(lowerQuery) ||
        d.nip.includes(lowerQuery) ||
        (d.email && d.email.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error('Search dosen error:', error);
    return [];
  }
};

/**
 * Get dosen by mata kuliah
 * @param {string} mataKuliah - Mata kuliah name
 * @returns {Promise<Array>} Filtered dosen
 */
export const getDosenByMataKuliah = async (mataKuliah) => {
  try {
    const allDosen = await getAllDosen(false);
    return allDosen.filter((d) => d.mata_kuliah.includes(mataKuliah));
  } catch (error) {
    console.error('Get dosen by mata kuliah error:', error);
    return [];
  }
};

/**
 * Get dosen stats
 * @returns {Promise<Object>} Stats object
 */
export const getDosenStats = async () => {
  try {
    const allDosen = await getAllDosen(true);
    
    return {
      total: allDosen.length,
      aktif: allDosen.filter((d) => d.status === 'aktif').length,
      tidak_aktif: allDosen.filter((d) => d.status === 'tidak_aktif').length,
    };
  } catch (error) {
    console.error('Get dosen stats error:', error);
    return {
      total: 0,
      aktif: 0,
      tidak_aktif: 0,
    };
  }
};

/**
 * Validate NIP format (18 digits)
 * @param {string} nip - NIP to validate
 * @returns {boolean} Valid or not
 */
export const validateNIP = (nip) => {
  return /^\d{18}$/.test(nip);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Valid or not
 */
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Get all mata kuliah list
 * @returns {Array} List of mata kuliah names
 */
export const getAllMataKuliah = () => {
  return MATA_KULIAH_LIST.map(mk => mk.nama);
};

export default {
  getAllDosen,
  getDosenById,
  createDosen,
  updateDosen,
  deleteDosen,
  toggleStatus,
  searchDosen,
  getDosenByMataKuliah,
  getDosenStats,
  validateNIP,
  validateEmail,
  getAllMataKuliah,
  MATA_KULIAH_LIST,
};
