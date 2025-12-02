// ==UserScript==
// @name         BPJS: User Info Parser
// @namespace    PKM
// @version      1.0
// @description  Ambil data user login dari halaman iCare BPJS (nama, role, faskes, dll)
// ==/UserScript==

(function () {
  'use strict';

  // === 1. Filter: hanya aktif di halaman BPJS iCare ===
  const allowedHosts = ['pcarejkn.bpjs-kesehatan.go.id'];
  if (!allowedHosts.includes(window.location.hostname)) return;

  const allowedPaths = ['/eclaim/iCare'];
  const currentPath = window.location.pathname;
  const isPathAllowed = allowedPaths.some(path => currentPath.startsWith(path));
  if (!isPathAllowed) return;

  // === 2. Fungsi parsing user info ===
  function parseUserInfo() {
    try {
      // Ambil teks lengkap dari menu user
      const mainSpan = document.querySelector('.dropdown.user span.hidden-xs');
      const detailSpan = mainSpan?.nextElementSibling?.nextElementSibling; // <br> lalu <span>

      const mainText = mainSpan?.textContent.trim() || '';
      const detailText = detailSpan?.textContent.trim() || '';

      // Nama lengkap (lebih akurat dari bagian header)
      const fullName = document.querySelector('.user-header p')?.textContent.trim() || null;

      // Role: ambil bagian setelah " - " terakhir di mainText
      let role = null;
      if (mainText.includes(' - ')) {
        const parts = mainText.split(' - ').map(p => p.trim());
        role = parts[parts.length - 1] || null;
      }

      // Detail faskes: "KEDAWUNG (10182001), CIREBON"
      let faskesName = null, faskesCode = null, kabupaten = null;

      if (detailText) {
        // Nama faskes: ambil sebelum tanda kurung
        const nameMatch = detailText.match(/^([^(]+)/);
        faskesName = nameMatch ? nameMatch[1].trim() : null;

        // Kode faskes: ambil angka dalam kurung
        const codeMatch = detailText.match(/\((\d+)\)/);
        faskesCode = codeMatch ? codeMatch[1] : null;

        // Kabupaten: ambil setelah koma
        const kabMatch = detailText.match(/,\s*([^(]+)/);
        kabupaten = kabMatch ? kabMatch[1].trim() : null;
      }

      return {
        fullName,
        role,
        faskesName,
        faskesCode,
        kabupaten,
        parsedAt: new Date().toISOString()
      };
    } catch (err) {
      console.warn('[BPJS User Info] Gagal parsing user data:', err);
      return null;
    }
  }

  // === 3. Tunggu DOM siap, lalu parse & simpan ===
  function init() {
    const userInfo = parseUserInfo();
    if (userInfo) {
      window.PKM = window.PKM || {};
      window.PKM.currentUser = userInfo;
      console.log('[BPJS User Info] User terdeteksi:', userInfo);
    } else {
      console.warn('[BPJS User Info] Tidak ditemukan data user.');
    }
  }

  // Jalankan saat DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
