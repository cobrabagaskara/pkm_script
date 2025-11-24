# PKM Centralized Userscript Manager

Repository ini digunakan sebagai pusat distribusi script Tampermonkey
untuk seluruh komputer kantor.

## Cara Kerja
Semua komputer hanya perlu menginstall 1 script:

- `loader.user.js`

Loader tersebut akan:

- Mengambil `manifest.json`
- Membaca daftar module
- Mengambil semua script dari folder `/modules`
- Menjalankannya otomatis

Setiap perubahan file di repo ini langsung diterapkan ke semua komputer
**tanpa perlu install ulang**.

## Struktur

```
pkm_script/
│
├── manifest.json
├── loader.user.js
└── modules/
      ├── example-hello.js
      └── auto-close-notification.js
```

## Menambah Script Baru

1. Upload script ke folder `/modules`
2. Tambahkan nama file tersebut ke `manifest.json`
3. Commit & push
4. Semua komputer otomatis ikut update

## Catatan
- Pastikan repo ini diset public
- Semua script dalam module akan berjalan di seluruh komputer client

## Modul
- epus-close-billing.js: Otomatis menutup notifikasi tagihan di ePuskesmas.
