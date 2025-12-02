// ==UserScript==
// @name         BPJS NIK Auto
// @namespace    PKM
// @version      1.5
// @description  Otomatisasi NIK dengan auto-klik "Setuju" via Swal API + deteksi #pstname
// ==/UserScript==

(function () {
  'use strict';

  const allowedHosts = [
    'pcarejkn.bpjs-kesehatan.go.id',
    'mobile-faskes.bpjs-kesehatan.go.id'
  ];

  if (!allowedHosts.includes(window.location.hostname)) {
    return;
  }

  // === BATAS: Panel UI hanya di halaman iCare ===
  if (window.self === window.top) {
    const allowedPaths = ['/eclaim/iCare'];
    const currentPath = window.location.pathname;
    const isPathAllowed = allowedPaths.some(path => currentPath.startsWith(path));
    if (!isPathAllowed) {
      return; // Jangan tampilkan panel di halaman lain
    }
  }

  const isInIframe = window.self !== window.top;

  if (isInIframe) {
    let handled = false;

    const tryClickAgree = () => {
      if (handled) return;

      // Strategi 1: Gunakan Swal API (jika tersedia)
      const SwalRef = window.Swal;
      if (SwalRef && typeof SwalRef.isVisible === 'function' && SwalRef.isVisible()) {
        const title = SwalRef.getTitle();
        if (title && title.innerHTML.includes('KERAHASIAAN INFORMASI')) {
          SwalRef.clickConfirm();
          handled = true;
          console.log('[BPJS NIK Auto] ✅ Swal "Setuju" diklik otomatis.');
          setTimeout(() => handled = false, 3000);
          return;
        }
      }

      // Strategi 2: Klik langsung tombol DOM
      const confirmBtn = document.querySelector('.swal2-confirm');
      if (confirmBtn && !confirmBtn.disabled && confirmBtn.textContent.trim() === 'Setuju') {
        confirmBtn.click();
        handled = true;
        console.log('[BPJS NIK Auto] ✅ Tombol "Setuju" diklik via DOM.');
        setTimeout(() => handled = false, 3000);
      }
    };

    const observer = new MutationObserver(tryClickAgree);
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Polling cadangan
    let attempts = 0;
    const poll = setInterval(() => {
      if (attempts > 20) {
        clearInterval(poll);
        return;
      }
      tryClickAgree();
      attempts++;
    }, 500);
  } else {
    // Inisialisasi UI panel
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
  }

  function initTopWindow() {
    if ($('#autoNikPanel').length) return;

    $('body').append(`
      <div id="autoNikPanel" style="
        position: fixed; top: 10px; right: 10px; z-index: 9999999;
        background: #fff; border: 1px solid #ccc; padding: 10px; width: 280px;
        font-family: sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      ">
        <h4 style="margin:0 0 8px;">🤖 Otomatisasi NIK (V 1.5)</h4>
        <textarea id="nikList" placeholder="Paste NIK (16 digit, satu per baris)" rows="5" style="width:100%;font-size:12px;"></textarea><br>
        <button id="startBtn" style="
          margin-top:6px; background:#007bff; color:white; border:none;
          padding:5px 10px; border-radius:3px; cursor:pointer;
        ">▶ Start</button>
        <div id="progress" style="margin-top:6px;font-size:12px;">
          Status: <span id="progressText">Siap</span>
        </div>
      </div>
    `);

    let nikArray = [];
    $('#startBtn').on('click', function () {
      const raw = $('#nikList').val().trim();
      if (!raw) {
        $('#progressText').text('❌ Isi dulu NIK!');
        return;
      }
      nikArray = raw.split(/\r?\n/)
                    .map(n => n.trim())
                    .filter(n => /^\d{16}$/.test(n));
      if (nikArray.length === 0) {
        $('#progressText').text('❌ NIK tidak valid');
        return;
      }
      $('#progressText').text(`▶ Mulai (${nikArray.length})`);
      processNextNik();
    });

    function processNextNik() {
      if (nikArray.length === 0) {
        $('#progressText').text('✅ Selesai');
        return;
      }
      const nik = nikArray.shift();
      $('#rbkartunik').prop('checked', true).trigger('change');
      $('#txtNokartu').val(nik);
      $('#nikList').val(nikArray.join('\n'));
      $('#progressText').text(`🔄 Proses: ${nik}`);
    }

    window.addEventListener('message', (e) => {
      if (e.data.type === 'NIK_PROCESSED') {
        setTimeout(processNextNik, 1200);
      }
    });
  }
})();
