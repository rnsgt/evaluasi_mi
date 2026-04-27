import Constants from 'expo-constants';

// API Configuration
// PENTING: Untuk testing di HP, ganti 'localhost' dengan IP laptop Anda
// Cara cek IP: Buka CMD/PowerShell, ketik 'ipconfig', cari IPv4 Address
// Contoh: 'http://192.168.1.100:3002/api'
const hostUri =
  Constants?.expoConfig?.hostUri ||
  Constants?.expoGoConfig?.debuggerHost ||
  Constants?.manifest?.debuggerHost ||
  '';

const rawHost = hostUri ? hostUri.split(':')[0] : '';
const lanHost = rawHost && rawHost !== '127.0.0.1' && rawHost !== 'localhost'
  ? rawHost
  : '';
const DEV_API_HOST = `http://${lanHost}:3002`;

const ENV_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';

export const API_BASE_URL_CANDIDATES = [
  ENV_API_BASE_URL,
  lanHost ? `${DEV_API_HOST}/api` : '',
  'http://10.0.2.2:3002/api',
  'http://127.0.0.1:3002/api',
  'http://localhost:3002/api',
  'http://DESKTOP-SDR4RKK:3002/api',
  ,
].filter(Boolean);

export const API_BASE_URL = __DEV__
  ? API_BASE_URL_CANDIDATES[0] // Development
  : 'https://api-evaluasi-mi.vercel.app/api'; // Production (Ditambahkan /api agar rute ditemukan)

// AsyncStorage Keys
export const STORAGE_KEYS = {
  TOKEN: '@evaluasi_token',
  USER: '@evaluasi_user',
  REMEMBER_ME: '@evaluasi_remember',
};

// User Roles
export const USER_ROLES = {
  MAHASISWA: 'mahasiswa',
  ADMIN: 'admin',
};

// Evaluation Types
export const EVALUATION_TYPES = {
  DOSEN: 'dosen',
  FASILITAS: 'fasilitas',
};

// Evaluation Status
export const EVALUATION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  SELESAI: 'SELESAI',
};

// Likert Scale
export const LIKERT_SCALE = [
  { value: 1, label: 'Sangat Tidak Setuju', short: '1' },
  { value: 2, label: 'Tidak Setuju', short: '2' },
  { value: 3, label: 'Netral', short: '3' },
  { value: 4, label: 'Setuju', short: '4' },
  { value: 5, label: 'Sangat Setuju', short: '5' },
]; 

// Status Akademik
export const STATUS_AKADEMIK = {
  AKTIF: 'Aktif',
  CUTI: 'Cuti',
  LULUS: 'Lulus',
  NON_AKTIF: 'Non-Aktif',
};

// Validation Rules
export const VALIDATION = {
  NIM_MIN_LENGTH: 6,
  PASSWORD_MIN_LENGTH: 6,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

// Date Format
export const DATE_FORMAT = {
  DISPLAY: 'DD MMM YYYY',
  DISPLAY_LONG: 'DD MMMM YYYY',
  DISPLAY_WITH_TIME: 'DD MMM YYYY HH:mm',
  API: 'YYYY-MM-DD',
  MONTH_YEAR: 'MMMM YYYY',
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};
