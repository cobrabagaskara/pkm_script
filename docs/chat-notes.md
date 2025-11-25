## 2025-04-10 – Diskusi dengan AI tentang Loader & Manifest

### Masalah:
Popup ePuskesmas muncul ulang setelah ditutup.

### Solusi:
- Tambahkan polling + MutationObserver
- Gunakan TreeWalker untuk deteksi rekursif
- Versi modul: 3.3

### Link:
- [loader.user.js v1.2](../loader.user.js)
- [epus-close-billing.js](../modules/epus-close-billing.js)

Cara Menggunakan 

1. Pastikan struktur folder seperti ini: 
pkm_script/
├── manifest.json       ← akan di-generate otomatis
├── tools/
│   └── generate-manifest.mjs
└── modules/
    ├── example-hello.js
    └── auto-close-notification.js

2. Buka terminal di folder pkm_script, lalu jalankan:
   
   node tools/generate-manifest.mjs

       File manifest.json akan otomatis terisi dengan daftar file .js dari /modules. 
     

 
💡 Tips 

    Jalankan skrip ini setiap kali Anda menambah/menghapus modul.
    Anda bisa tambahkan ke script npm atau batch file jika sering menggunakannya.
    Jika belum punya folder tools, buat dulu:
    mkdir tools