// ==UserScript==
// @name         PKM Modular Loader
// @namespace    PKM
// @version      1.1.1
// @description  Loader modular untuk script Tampermonkey berbasis GitHub — dikembangkan di branch terpisah.
// @author       Aang
// @match        https://cirebon.epuskesmas.id/*
// @match        https://*.epuskesmas.id/*
// @match        https://pcarejkn.bpjs-kesehatan.go.id/*
// @match        https://mobile-faskes.bpjs-kesehatan.go.id/*
// @match        https://satusehat.kemkes.go.id/*
// @match        https://*.domain-aplikasi-4.go.id/*   // ← sesuaikan jika perlu
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
// @run-at       document-idle
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
  'use strict';

  // ⚙️ Simpan XLSX dari loader SEBELUM halaman menimpa-nya
  window.PKM = window.PKM || {};
  window.PKM.XLSX = XLSX; // ← Ini adalah xlsx.full.min.js

  // ⚙️ === KONFIGURASI UTAMA ===
  const CONFIG = {
    GITHUB_USER: 'cobrabagaskara',
    REPO_NAME: 'pkm_script',
    BRANCH: 'dev/modular-system',      // ← ganti ke 'main' saat produksi
    MANIFEST_PATH: 'manifest.json'
  };

  const MANIFEST_URL = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${CONFIG.MANIFEST_PATH}`;

  // Log hanya di branch dev
  function log(...args) {
    if (CONFIG.BRANCH !== 'main') {
      console.log(`[PKM Loader @${CONFIG.BRANCH}]`, ...args);
    }
  }

  async function loadModule(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const code = await res.text();
      // Eksekusi modul dalam konteks terisolasi
      new Function('window', 'document', 'console', code)(window, document, console);
      log('✅ Modul aktif:', url);
    } catch (err) {
      console.error('[PKM Loader] Gagal muat modul:', url, err);
    }
  }

  async function init() {
    try {
      log('Loader dijalankan di:', window.location.href);

      const manifestRes = await fetch(MANIFEST_URL);
      if (!manifestRes.ok) {
        throw new Error(`Gagal ambil manifest dari: ${MANIFEST_URL}`);
      }
      const manifest = await manifestRes.json();

      if (!Array.isArray(manifest.modules)) {
        throw new Error('manifest.json harus berisi array "modules"');
      }

      log(`Memuat ${manifest.modules.length} modul...`);
      for (const modulePath of manifest.modules) {
        const moduleUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${modulePath}`;
        await loadModule(moduleUrl);
      }

      log('✅ Semua modul selesai dimuat.');
    } catch (err) {
      console.error('[PKM Loader] Inisialisasi gagal:', err);
    }
  }

  // Jalankan!
  init();
})();