// ==UserScript==
// @name         [GANTI: Nama Modul]
// @namespace    PKM
// @version      1.0
// @description  [GANTI: Deskripsi singkat fungsi modul]
// ==/UserScript==

(function () {
  'use strict';

  // === 1. Filter Domain (wajib) ===
  const allowedHosts = [
    'google.com'
    // Contoh:
    // 'cirebon.epuskesmas.id',
    // 'pcarejkn.bpjs-kesehatan.go.id'
  ];

  const isHostAllowed = allowedHosts.length === 0 ||
    allowedHosts.some(host => window.location.hostname.endsWith(host));

  if (!isHostAllowed) return;

  // === 2. Filter Path (opsional) ===
  // Kosongkan [] jika modul aktif di seluruh domain
  const allowedPaths = [
    // Contoh:
    // '/pelayanan',
    // '/eclaim/iCare'
  ];

  const isPathAllowed = allowedPaths.length === 0 ||
    allowedPaths.some(path => window.location.pathname.startsWith(path));

  if (!isPathAllowed) return;

  // === 3. Logika utama modul ===

  // Jika butuh library dari loader (misal: XLSX), cek dulu:
  // const PKM_XLSX = window.PKM?.XLSX;
  // if (!PKM_XLSX) return;

  // Jalankan logika iframe jika diperlukan
  if (window.self !== window.top) {
    // Contoh: deteksi popup, kirim sinyal ke parent, dll
    return;
  }

  // === 4. UI Panel Draggable (hanya di top window) ===
  if (typeof $ === 'undefined') {
    const waitForjQuery = () => {
      if (typeof $ === 'function' && $.fn) {
        initTopWindow();
      } else {
        setTimeout(waitForjQuery, 100);
      }
    };
    waitForjQuery();
  } else {
    initTopWindow();
  }

  function initTopWindow() {
    const panelId = 'pkmModulPanel'; // ← GANTI jadi unik per modul, misal: 'epusDataPanel'
    if ($(panelId).length) return;

    const container = $(`
      <div id="${panelId}" style="
        position: fixed; top: 20px; right: 20px; z-index: 9999999;
        background: #fff; border: 1px solid #ccc; padding: 12px; width: 280px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: 0 3px 10px rgba(0,0,0,0.15); border-radius: 6px; cursor: move;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom:10px;">
          <h4 style="margin:0; font-size:15px; color:#333;">[GANTI: Judul Panel]</h4>
          <span class="pkm-close-btn" style="
            cursor: pointer; font-weight: bold; color: #666;
            width: 22px; height: 22px; display: flex; align-items: center;
            justify-content: center; border-radius: 50%; background: #f0f0f0;
            font-size:14px;
          ">✕</span>
        </div>
        <!-- GANTI ISI SESUAI KEBUTUHAN MODUL -->
        <p>Panel modul siap digunakan.</p>
        <button class="pkm-action-btn" style="
          width:100%; padding:8px; background:#007bff; color:white; border:none;
          border-radius:4px; cursor:pointer; margin-top:8px;
        ">▶ Jalankan</button>
      </div>
    `);

    // Draggable
    let isDragging = false, offsetX, offsetY;
    container.on('mousedown', (e) => {
      if (e.target.closest('.pkm-close-btn')) return;
      isDragging = true;
      offsetX = e.pageX - container.offset().left;
      offsetY = e.pageY - container.offset().top;
      container.css('cursor', 'grabbing');
    });
    $(document).on('mousemove', (e) => {
      if (!isDragging) return;
      container.css({ left: e.pageX - offsetX, top: e.pageY - offsetY, right: 'auto' });
    });
    $(document).on('mouseup', () => {
      isDragging = false;
      container.css('cursor', 'move');
    });

    // Aksi tombol
    container.find('.pkm-action-btn').on('click', () => {
      console.log('[Modul] Fitur dijalankan');
    });

    // Tutup panel → tampilkan tombol sembunyi
    container.find('.pkm-close-btn').on('click', () => {
      container.remove();
      createReopenButton();
    });

    $('body').append(container);
  }

  // === 5. Tombol sembunyi untuk buka ulang ===
  function createReopenButton() {
    const btnId = 'reopenPkmModul'; // ← GANTI jadi unik, misal: 'reopenEpusData'
    if ($(btnId).length) return;
    const btn = $(`
      <button id="${btnId}" style="
        position: fixed; bottom: 20px; right: 20px; z-index: 9999998;
        background: #007bff; color: white; border: none; border-radius: 20px;
        width: 40px; height: 40px; font-size: 18px; cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      ">⚙️</button>
    `);
    btn.on('click', () => {
      btn.remove();
      initTopWindow();
    });
    $('body').append(btn);
  }
})();
