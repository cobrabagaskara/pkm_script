// ==UserScript==
// @name         BPJS NIK Auto
// @namespace    PKM
// @version      1.6
// @description  Otomatisasi NIK dengan auto-klik "Setuju" di popup BPJS + deteksi #pstname
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

  const allowedPaths = ['/eclaim/iCare'];
  const currentPath = window.location.pathname;
  const isPathAllowed = allowedPaths.some(path => currentPath.startsWith(path));
  if (!isPathAllowed && window.self === window.top) {
    return;
  }

  const isInIframe = window.self !== window.top;

  // === Logika untuk Iframe (popup & sinyal) ===
  if (isInIframe) {
    let handled = false;

    const tryClickAgree = () => {
      if (handled) return;

      // Strategi 1: Cari popup berdasarkan teks
      const allModals = document.querySelectorAll('.modal');
      for (const modal of allModals) {
        const modalText = modal.innerText || '';
        if (modalText.includes('KERAHASIAAN INFORMASI')) {
          // Cari tombol Setuju
          const buttons = modal.querySelectorAll('button, .btn');
          for (const btn of buttons) {
            if (btn.textContent.includes('Setuju') && !btn.disabled) {
              btn.click();
              handled = true;
              console.log('[BPJS NIK Auto] ✅ Tombol Setuju diklik via teks.');
              setTimeout(() => handled = false, 3000);
              return;
            }
          }
        }
      }

      // Strategi 2: Cari elemen #pstname
      if (document.querySelector('#pstname:visible')) {
        window.parent.postMessage({ type: 'NIK_PROCESSED' }, '*');
      }
    };

    const observer = new MutationObserver(tryClickAgree);
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    setInterval(tryClickAgree, 800);
    return; // Jangan lanjut ke UI
  }

  // === Logika untuk Top Window (UI Panel) ===
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

  let nikArray = [];
  let isProcessing = false;
  let messageListener = null;

  function initTopWindow() {
    if ($('#autoNikPanel').length) return;

    $('body').append(`
      <div id="autoNikPanel" style="
        position: fixed; top: 10px; right: 10px; z-index: 9999999;
        background: #fff; border: 1px solid #ccc; padding: 10px; width: 280px;
        font-family: sans-serif; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      ">
        <h4 style="margin:0 0 8px;">🤖 Otomatisasi NIK (Auto Setuju)</h4>
        <textarea id="nikList" placeholder="Paste NIK (16 digit, satu per baris)" rows="5" style="width:100%;font-size:12px;"></textarea><br>
        <button id="startBtn" style="
          margin-top:6px; background:#007bff; color:white; border:none;
          padding:5px 10; border-radius:3px; cursor:pointer;
        ">▶ Start</button>
        <div id="progress" style="margin-top:6px;font-size:12px;">
          Status: <span id="progressText">Siap</span>
        </div>
      </div>
    `);

    $('#startBtn').on('click', startProcessing);
  }

  function startProcessing() {
    if (isProcessing) return;

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

    isProcessing = true;
    $('#progressText').text(`▶ Mulai (${nikArray.length})`);

    if (messageListener) {
      window.removeEventListener('message', messageListener);
    }

    messageListener = (e) => {
      if (e.data.type === 'NIK_PROCESSED') {
        setTimeout(processNextNik, 1200);
      }
    };
    window.addEventListener('message', messageListener);

    processNextNik();
  }

  function processNextNik() {
    if (nikArray.length === 0) {
      $('#progressText').text('✅ Selesai');
      isProcessing = false;
      if (messageListener) {
        window.removeEventListener('message', messageListener);
        messageListener = null;
      }
      return;
    }

    const nik = nikArray.shift();
    $('#rbkartunik').prop('checked', true).trigger('change');
    $('#txtNokartu').val(nik);
    $('#nikList').val(nikArray.join('\n'));
    $('#progressText').text(`🔄 Proses: ${nik}`);
  }
})();
