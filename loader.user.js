// ==UserScript==
// @name         PKM Modular Loader (DEV)
// @namespace    PKM
// @version      1.0.0
// @description  Loader modular untuk script Tampermonkey berbasis GitHub — dikembangkan di branch terpisah.
// @author       Ang
// @match        https://cirebon.epuskesmas.id/*
// @match        https://*.epuskesmas.id/*
// @match        https://layanan.bpjs-kesehatan.go.id/*
// @match        https://satusehat.kemkes.go.id/*
// @match        https://pcarejkn.bpjs-kesehatan.go.id/eclaim/iCare
// @match        https://*.domain-aplikasi-4.go.id/*   // ← sesuaikan
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
// @run-at       document-idle
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
  'use strict';

  // ⚙️ === KONFIGURASI UTAMA ===
  const CONFIG = {
    GITHUB_USER: 'cobrabagaskara',       // ← GANTI dengan username GitHub kamu
    REPO_NAME: 'pkm_script',           // ← GANTI jika beda nama repo
    BRANCH: 'dev/modular-system',      // ← SESUAIKAN: branch pengembangan (bukan 'main'!)
    MANIFEST_PATH: 'manifest.json'     // lokasi relatif dari root repo
  };

  // ────────────────────────────────
  // JANGAN UBAH DI BAWAH INI
  // ────────────────────────────────

  const MANIFEST_URL = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${CONFIG.MANIFEST_PATH}`;

  // Log hanya untuk debugging — aman di non-production
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

      // Eksekusi modul dalam lingkungan terisolasi
      new Function('window', 'document', 'console', code)(window, document, console);
      log('✅ Modul aktif:', url);
    } catch (err) {
      console.error(`[PKM Loader] Gagal muat modul: ${url}`, err);
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