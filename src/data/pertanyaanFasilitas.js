// Data Pertanyaan untuk Evaluasi Fasilitas Kampus
// Kategori: Kebersihan, Kelengkapan, Kenyamanan, Aksesibilitas

export const KATEGORI_EVALUASI_FASILITAS = [
  {
    id: 1,
    nama: 'Kebersihan',
    pertanyaan: [
      {
        id: 1,
        text: 'Fasilitas ini selalu dalam kondisi bersih dan terawat',
      },
      {
        id: 2,
        text: 'Toilet/kamar mandi (jika ada) dalam kondisi bersih',
      },
      {
        id: 3,
        text: 'Area sekitar fasilitas bebas dari sampah dan kotoran',
      },
    ],
  },
  {
    id: 2,
    nama: 'Kelengkapan',
    pertanyaan: [
      {
        id: 4,
        text: 'Peralatan/perlengkapan yang tersedia berfungsi dengan baik',
      },
      {
        id: 5,
        text: 'Jumlah peralatan/perlengkapan memadai untuk jumlah pengguna',
      },
      {
        id: 6,
        text: 'Fasilitas pendukung (AC, proyektor, dll) tersedia dan berfungsi',
      },
    ],
  },
  {
    id: 3,
    nama: 'Kenyamanan',
    pertanyaan: [
      {
        id: 7,
        text: 'Pencahayaan di fasilitas ini sudah memadai',
      },
      {
        id: 8,
        text: 'Sirkulasi udara/ventilasi nyaman',
      },
      {
        id: 9,
        text: 'Tingkat kebisingan di area ini tidak mengganggu',
      },
      {
        id: 10,
        text: 'Suhu ruangan nyaman untuk aktivitas',
      },
    ],
  },
  {
    id: 4,
    nama: 'Aksesibilitas',
    pertanyaan: [
      {
        id: 11,
        text: 'Lokasi fasilitas mudah dijangkau',
      },
      {
        id: 12,
        text: 'Fasilitas dapat digunakan sesuai jadwal yang ditentukan',
      },
    ],
  },
];

/**
 * Get total jumlah pertanyaan evaluasi fasilitas
 * @returns {number} Total pertanyaan
 */
export const getTotalPertanyaan = () => {
  return KATEGORI_EVALUASI_FASILITAS.reduce(
    (total, kategori) => total + kategori.pertanyaan.length,
    0
  );
};

/**
 * Get all pertanyaan dalam flat array format
 * @returns {Array} Array of pertanyaan with kategori
 */
export const getAllPertanyaan = () => {
  const allPertanyaan = [];
  
  KATEGORI_EVALUASI_FASILITAS.forEach((kategori) => {
    kategori.pertanyaan.forEach((pertanyaan) => {
      allPertanyaan.push({
        ...pertanyaan,
        kategori: kategori.nama,
        kategori_id: kategori.id,
      });
    });
  });
  
  return allPertanyaan;
};

/**
 * Get pertanyaan by kategori ID
 * @param {number} kategoriId - Kategori ID
 * @returns {Array} Array of pertanyaan
 */
export const getPertanyaanByKategori = (kategoriId) => {
  const kategori = KATEGORI_EVALUASI_FASILITAS.find((k) => k.id === kategoriId);
  return kategori ? kategori.pertanyaan : [];
};
