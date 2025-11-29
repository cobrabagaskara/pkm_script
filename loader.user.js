// ==UserScript==
// @name         PKM Modular Loader
// @namespace    PKM
// @version      1.1.3
// @description  Loader modular untuk script PKM — dengan notifikasi update otomatis.
// @author       Aang
// @match        https://cirebon.epuskesmas.id/*
// @match        https://*.epuskesmas.id/*
// @match        https://pcarejkn.bpjs-kesehatan.go.id/*
// @match        https://mobile-faskes.bpjs-kesehatan.go.id/*
// @match        https://satusehat.kemkes.go.id/*
// @match        https://*.domain-aplikasi-4.go.id/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
// @run-at       document-idle
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
  'use strict';

  // ⚙️ Simpan XLSX dari loader sebelum ditimpa
  window.PKM = window.PKM || {};
  window.PKM.XLSX = XLSX;

  // === Konfigurasi ===
  const CONFIG = {
    GITHUB_USER: 'cobrabagaskara',
    REPO_NAME: 'pkm_script',
    BRANCH: 'dev/modular-system',
    MANIFEST_PATH: 'manifest.json',
    CURRENT_VERSION: '1.1.2' // ← SELALU SESUAIKAN DENGAN @version DI ATAS
  };

  const MANIFEST_URL = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${CONFIG.MANIFEST_PATH}`;
  const LOADER_RAW_URL = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/loader.user.js`;

  // Log hanya di dev
  function log(...args) {
    if (CONFIG.BRANCH !== 'main') {
      console.log(`[PKM Loader @${CONFIG.BRANCH}]`, ...args);
    }
  }

  // === Cek Update Otomatis (sekali per hari) ===
  function shouldCheckForUpdate() {
    const lastCheck = localStorage.getItem('PKM_LAST_UPDATE_CHECK');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return !lastCheck || (now - parseInt(lastCheck)) > oneDay;
  }

  async function checkForLoaderUpdate() {
    if (!shouldCheckForUpdate()) return;

    try {
      const res = await fetch(LOADER_RAW_URL + '?_=' + Date.now());
      if (!res.ok) throw new Error('Gagal ambil kode loader terbaru');
      
      const code = await res.text();
      const match = code.match(/@version\s+([^\s]+)/);
      const latestVersion = match ? match[1] : null;

      if (latestVersion && latestVersion !== CONFIG.CURRENT_VERSION) {
        showUpdateNotification(latestVersion);
      }

      // Simpan timestamp terakhir cek
      localStorage.setItem('PKM_LAST_UPDATE_CHECK', Date.now().toString());
    } catch (err) {
      console.warn('[PKM Loader] Gagal cek update:', err);
    }
  }

  function showUpdateNotification(newVersion) {
    // Jangan tampilkan di iframe
    if (window.self !== window.top) return;

    // Jangan tampilkan lebih dari satu notifikasi
    if (document.getElementById('pkm-update-notify')) return;

    const notify = document.createElement('div');
    notify.id = 'pkm-update-notify';
    notify.style = `
      position: fixed; top: 60px; right: 10px; z-index: 9999999;
      background: #fff; border: 1px solid #ffcc00; padding: 12px; width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 6px;
      font-size: 14px; line-height: 1.4;
    `;
    notify.innerHTML = `
      <div style="display:flex; gap:10px;">
        <div>✨</div>
        <div>
          <strong>PKM Loader Update Tersedia!</strong><br>
          Versi Anda: <code>${CONFIG.CURRENT_VERSION}</code><br>
          Versi Terbaru: <code>${newVersion}</code>
        </div>
      </div>
      <div style="margin-top:10px; display:flex; gap:8px;">
        <button id="pkm-update-btn" style="
          background:#28a745; color:white; border:none; padding:5px 12px;
          border-radius:4px; font-size:13px; cursor:pointer;
        ">Install Update</button>
        <button id="pkm-dismiss-btn" style="
          background:#eee; color:#333; border:1px solid #ccc; padding:5px 12px;
          border-radius:4px; font-size:13px; cursor:pointer;
        ">Nanti</button>
      </div>
    `;

    document.body.appendChild(notify);

    document.getElementById('pkm-update-btn').onclick = () => {
      window.open(LOADER_RAW_URL, '_blank');
      notify.remove();
    };

    document.getElementById('pkm-dismiss-btn').onclick = () => {
      notify.remove();
    };
  }

  // === Muat Modul dari Manifest ===
  async function loadModule(url) {
    try {
      const res = await fetch(url + '?_=' + Date.now());
      if (!res.ok) throw new Error(`${res.status}`);
      const code = await res.text();
      new Function('window', 'document', 'console', code)(window, document, console);
      log('✅ Modul aktif:', url);
    } catch (err) {
      console.error('[PKM Loader] Gagal muat modul:', url, err);
    }
  }

  async function init() {
    log('Loader dijalankan di:', window.location.href);

    // Jalankan cek update (sekali per hari)
    checkForLoaderUpdate();

    try {
      const manifestRes = await fetch(MANIFEST_URL + '?_=' + Date.now());
      if (!manifestRes.ok) throw new Error('Gagal ambil manifest');

      const manifest = await manifestRes.json();
      if (!Array.isArray(manifest.modules)) throw new Error('manifest.json invalid');

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