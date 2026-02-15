// Helper functions

/**
 * Format date to Indonesian format
 * @param {string|Date} date 
 * @param {string} format 
 * @returns {string}
 */
export const formatDate = (date, format = 'DD MMM YYYY') => {
  if (!date) return '';
  
  const d = new Date(date);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  const monthsFull = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const monthFull = monthsFull[d.getMonth()];
  const year = d.getFullYear();
  
  if (format === 'DD MMM YYYY') {
    return `${day} ${month} ${year}`;
  } else if (format === 'MMMM YYYY') {
    return `${monthFull} ${year}`;
  } else if (format === 'DD MMMM YYYY') {
    return `${day} ${monthFull} ${year}`;
  }
  
  return d.toLocaleDateString('id-ID');
};

/**
 * Format relative time (e.g., "2 menit yang lalu")
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  if (diffHour < 24) return `${diffHour} jam yang lalu`;
  if (diffDay < 7) return `${diffDay} hari yang lalu`;
  
  return formatDate(date);
};

/**
 * Calculate average from array of numbers
 * @param {number[]} numbers 
 * @returns {number}
 */
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / numbers.length) * 10) / 10; // Round to 1 decimal
};

/**
 * Convert score (1-5) to percentage
 * @param {number} score 
 * @returns {number}
 */
export const scoreToPercentage = (score) => {
  return Math.round((score / 5) * 100);
};

/**
 * Validate NIM format
 * @param {string} nim 
 * @returns {boolean}
 */
export const validateNIM = (nim) => {
  // Allow "admin" for testing (remove after backend ready)
  if (nim === 'admin') return true;
  
  return nim && nim.length >= 6 && /^\d+$/.test(nim);
};

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Group array by key
 * @param {Array} array 
 * @param {string} key 
 * @returns {Object}
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Debounce function
 * @param {Function} func 
 * @param {number} delay 
 * @returns {Function}
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Format IPK with 2 decimal places
 * @param {number} ipk 
 * @returns {string}
 */
export const formatIPK = (ipk) => {
  return ipk ? ipk.toFixed(2) : '0.00';
};
