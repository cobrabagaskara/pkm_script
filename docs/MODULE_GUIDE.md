# 🧪 Panduan Membuat Modul Baru

## Struktur Modul Dasar

Modul harus berupa file JavaScript mandiri (self-contained) dengan format:

```js
// ==UserScript==
// @name         Nama Modul Anda
// @namespace    PKM
// @version      1.0
// @description  Deskripsi singkat
// ==/UserScript==

(function () {
    'use strict';

    // Tambahkan pengecekan domain jika diperlukan
    if (!window.location.hostname.includes('target-domain.com')) return;

    // Logika modul Anda di sini
    console.log('[NamaModul] Berjalan!');
})();


profile
Qwen3-Max 3:07 pm

Terima kasih kembali, Saudara Afifah! 😊
Berikut adalah template awal lengkap yang siap Anda salin ke repositori Anda. Semua disusun agar rapi, profesional, dan mudah dikembangkan seiring bertambahnya fitur. 
 
📄 1. README.md — Halaman Utama Repositori 
md
 
 
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
# 🧩 PKM Script System

Sistem distribusi terpusat untuk script Tampermonkey di lingkungan kantor.  
Cukup install **satu script**, semua fitur otomatis ter-update dari repositori ini.

> ✨ **"Ubah sekali di GitHub, berlaku di semua komputer."**

---

## 🚀 Cara Kerja

1. Setiap komputer kantor menginstal [`loader.user.js`](loader.user.js).
2. Loader mengambil [`manifest.json`](manifest.json) dari repositori ini.
3. Loader membaca daftar modul, lalu mengunduh dan menjalankan semua file di folder [`/modules`](modules/).
4. Setiap kali Anda **menambah/mengubah file** dan **push ke GitHub**, semua komputer otomatis mendapat update **tanpa instalasi ulang**.

---

## 🔧 Cara Menambah Modul Baru

1. Buat file JavaScript di folder [`modules/`](modules/), contoh: `auto-fill-form.js`.
2. Tambahkan nama filenya ke [`manifest.json`](manifest.json):
   ```json
   {
     "modules": [
       "example-hello.js",
       "auto-close-notification.js",
       "auto-fill-form.js"
     ]
   }
 
 

    Commit & push ke GitHub.
    Selesai! Semua klien akan menjalankan modul baru saat halaman dimuat ulang.
     

    💡 Tips: Gunakan skrip tools/generate-manifest.mjs  untuk otomatis isi manifest.json berdasarkan file di /modules. 
     

 
🖥️ Instalasi untuk Pengguna Baru 

Buka di browser:
👉 https://cobrabagaskara.github.io/pkm_script/install.html  

Klik tombol "Install PKM Loader" → Tampermonkey akan otomatis menginstal script. 
 
📚 Dokumentasi Lebih Lanjut 

    Panduan Instalasi 
    Cara Membuat Modul 
    Arsitektur Sistem 
    Roadmap Pengembangan 
     

 

    🔒 Catatan Keamanan: Repositori ini harus tetap publik agar loader bisa mengakses file via raw.githubusercontent.com. 
     

 
 
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41

---

## 🗺️ 2. `ROADMAP.md` — Rencana & Ide Pengembangan

```md
# 🗺️ Roadmap: PKM Script System

Dokumen ini mencatat ide, fitur yang sedang dikerjakan, dan rencana masa depan.

---

## ✅ Sudah Selesai

- [x] Sistem loader dasar via Tampermonkey
- [x] Distribusi modul otomatis dari `/modules`
- [x] Halaman instalasi: `install.html`
- [x] QR code untuk instalasi cepat
- [x] Skrip otomatis `generate-manifest.mjs`

## 🚧 Sedang Dikembangkan

- [ ] Repositori privat + obfuscation untuk melindungi source code
- [ ] Konfigurasi modul per pengguna (via `localStorage` + file konfig khusus)

## 💡 Rencana Masa Depan

- [ ] Dashboard admin internal (hanya untuk tim IT)
- [ ] Modul hanya aktif di jam kerja (08.00–16.00)
- [ ] Logging error lokal (opsional: kirim ke server internal)
- [ ] Auto-reload modul tanpa refresh halaman
- [ ] Dukungan untuk modul berbasis konfigurasi (misal: daftar URL khusus)

## 🧪 Eksperimen (Belum Stabil)

- [ ] Enkripsi sederhana + dekripsi di loader (evaluasi keamanan)
- [ ] Integrasi dengan GitHub API untuk update real-time

---

> ✏️ Diperbarui: 25 November 2025
 
 
 
📁 3. Struktur Folder docs/ + Isi Template 

Buat folder docs/ di root repo, lalu isi dengan file berikut: 
🔹 docs/INSTALL.md 
md
 
 
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
# 📥 Panduan Instalasi untuk Pengguna Baru

## Prasyarat
- Ekstensi **Tampermonkey** terpasang di browser (Chrome, Edge, Firefox, dll).
- Akses internet (untuk mengambil script dari GitHub).

## Langkah Instalasi

### Opsi 1: Via Halaman Web (Direkomendasikan)
1. Buka: [https://cobrabagaskara.github.io/pkm_script/install.html](https://cobrabagaskara.github.io/pkm_script/install.html)
2. Klik tombol **"Install PKM Loader"**.
3. Popup Tampermonkey akan muncul → klik **Install**.
4. Selesai!

### Opsi 2: Manual
1. Buka: [loader.user.js](https://raw.githubusercontent.com/cobrabagaskara/pkm_script/main/loader.user.js)
2. Tampermonkey akan otomatis menawarkan instalasi.
3. Klik **Install**.

> 💡 Tidak perlu lakukan apa-apa lagi. Semua update otomatis!
 
 
 
🔹 docs/MODULE_GUIDE.md 
md
 
 
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
# 🧪 Panduan Membuat Modul Baru

## Struktur Modul Dasar

Modul harus berupa file JavaScript mandiri (self-contained) dengan format:

```js
// ==UserScript==
// @name         Nama Modul Anda
// @namespace    PKM
// @version      1.0
// @description  Deskripsi singkat
// ==/UserScript==

(function () {
    'use strict';

    // Tambahkan pengecekan domain jika diperlukan
    if (!window.location.hostname.includes('target-domain.com')) return;

    // Logika modul Anda di sini
    console.log('[NamaModul] Berjalan!');
})();
 
 
Aturan Penting 

    Jangan gunakan @match atau @grant (kecuali benar-benar perlu) — loader menangani eksekusi.
    Gunakan console.log('[NamaModul] ...') untuk debugging.
    Untuk modul yang hanya berjalan di situs tertentu, tambahkan pengecekan window.location di awal.
    Simpan file di folder /modules dengan ekstensi .js.
     

## Alur Eksekusi
1. Pengguna buka situs apa pun.
2. Tampermonkey jalankan `loader.user.js`.
3. Loader ambil `manifest.json` dari GitHub (raw).
4. Loader unduh tiap file di `modules/`.
5. Setiap modul dieksekusi sebagai `<script>` di `<head>`.

## Keamanan
- Tidak ada data dikirim keluar.
- Semua eksekusi lokal di browser pengguna.
- Repositori harus publik agar `raw.githubusercontent.com` bisa diakses.

## Skalabilitas
- Mendukung puluhan modul.
- Tidak membebani performa (modul hanya jalan di domain yang relevan).