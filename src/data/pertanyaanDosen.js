// Data Pertanyaan Evaluasi Dosen
// Dikelompokkan berdasarkan kategori penilaian

export const KATEGORI_EVALUASI_DOSEN = [
  {
    id: 1,
    nama: "Penguasaan Materi",
    pertanyaan: [
      {
        id: 1,
        text: "Dosen menguasai materi dengan baik",
      },
      {
        id: 2,
        text: "Dosen memberikan penjelasan yang mudah dipahami",
      },
      {
        id: 3,
        text: "Dosen mampu menjawab pertanyaan mahasiswa dengan jelas",
      },
      {
        id: 4,
        text: "Dosen menggunakan contoh-contoh yang relevan",
      },
    ],
  },
  {
    id: 2,
    nama: "Metode Pengajaran",
    pertanyaan: [
      {
        id: 5,
        text: "Metode pengajaran yang digunakan menarik",
      },
      {
        id: 6,
        text: "Dosen menggunakan media pembelajaran yang variatif",
      },
      {
        id: 7,
        text: "Dosen mendorong mahasiswa untuk aktif di kelas",
      },
      {
        id: 8,
        text: "Materi yang diajarkan sesuai dengan RPS",
      },
    ],
  },
  {
    id: 3,
    nama: "Komunikasi",
    pertanyaan: [
      {
        id: 9,
        text: "Dosen berkomunikasi dengan sopan dan ramah",
      },
      {
        id: 10,
        text: "Dosen mudah dihubungi di luar jam kuliah",
      },
      {
        id: 11,
        text: "Dosen responsif terhadap pertanyaan mahasiswa",
      },
    ],
  },
  {
    id: 4,
    nama: "Penilaian",
    pertanyaan: [
      {
        id: 12,
        text: "Sistem penilaian yang diterapkan jelas dan transparan",
      },
      {
        id: 13,
        text: "Dosen memberikan feedback terhadap tugas/ujian",
      },
      {
        id: 14,
        text: "Penilaian yang diberikan objektif dan adil",
      },
    ],
  },
  {
    id: 5,
    nama: "Kedisiplinan",
    pertanyaan: [
      {
        id: 15,
        text: "Dosen hadir tepat waktu",
      },
      {
        id: 16,
        text: "Dosen memanfaatkan waktu perkuliahan dengan efektif",
      },
    ],
  },
];

// Helper function untuk get total pertanyaan
export const getTotalPertanyaan = () => {
  return KATEGORI_EVALUASI_DOSEN.reduce(
    (total, kategori) => total + kategori.pertanyaan.length,
    0
  );
};

// Helper function untuk get all pertanyaan (flat array)
export const getAllPertanyaan = () => {
  const allPertanyaan = [];
  KATEGORI_EVALUASI_DOSEN.forEach((kategori) => {
    kategori.pertanyaan.forEach((pertanyaan) => {
      allPertanyaan.push({
        ...pertanyaan,
        kategori: kategori.nama,
      });
    });
  });
  return allPertanyaan;
};
