# 🧮 Kalkulator Web — UTS Pemograman Web 1

Aplikasi kalkulator berbasis web yang dibuat menggunakan **HTML**, **CSS**, dan **JavaScript** murni (tanpa framework).

---

## 👤 Identitas Mahasiswa

| Atribut         | Keterangan                          |
| --------------- | ----------------------------------- |
| **Nama**        | Wisfie Syahbani                     |
| **NIM**         | 231011450603                        |
| **Kelas**       | 05TPLE 006                          |
| **Mata Kuliah** | Pemograman Web 1                    |
| **Dosen**       | Fajar Agung Nugroho, S.Kom., M.Kom. |
| **Universitas** | Universitas Pamulang                |

---

## ✨ Fitur

- **Operasi matematika** — Tambah, Kurang, Kali, Bagi
- **Real-time preview** — Hasil perhitungan tampil langsung saat mengetik, final saat tombol `=` diklik
- **Validasi input** — Hanya angka yang dapat dimasukkan, mencegah input kosong dan operator ganda
- **Light & Dark Mode** — Toggle tema dengan satu klik (ikon matahari/bulan)
- **Riwayat perhitungan** — Menyimpan 3 riwayat terakhir, dapat diklik untuk digunakan kembali
- **Backspace** — Hapus karakter terakhir satu per satu
- **Tombol tambahan** — `+/−` ganti tanda, `%` persen, `()` kurung otomatis
- **Dukungan keyboard** — Angka, operator, Enter, Escape, Backspace
- **Responsif** — Tampilan menyesuaikan ukuran layar

---

## 🗂️ Struktur File

```
UTS_Calculator/
├── index.html   # Struktur halaman
├── style.css    # Tampilan & tema (light/dark)
├── script.js    # Logika kalkulator
└── README.md    # Dokumentasi proyek
```

---

## 🚀 Cara Menjalankan

1. Clone atau download repository ini
2. Buka file `index.html` di browser (tidak perlu server)

```bash
# Atau jalankan dengan live server
npx serve .
```

---

## 🖼️ Tampilan

| Light Mode                            | Dark Mode                |
| ------------------------------------- | ------------------------ |
| Background gradient oranye–merah muda | Background gelap abu-abu |
| Tombol putih dengan shadow lembut     | Tombol abu-abu gelap     |
| Tombol `=` gradient oranye            | Tombol `=` abu-abu solid |

---

## 🛠️ Teknologi

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox, Media Query)
- JavaScript ES6+ (tanpa library eksternal)
