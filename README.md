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

🖥️ Instalasi untuk Pengguna Baru 

Buka di browser:
👉 https://cobrabagaskara.github.io/pkm_script/install.html  