// ==UserScript==
// @name         BPJS NIK Auto
// @namespace    PKM
// @version      1.3
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

  const isInIframe = window.self !== window.top;

  if (isInIframe) {
    let handled = false;
    const observer = new MutationObserver(() => {
      if (handled) return;
      if (typeof window.Swal !== 'undefined' && window.Swal.isVisible()) {
        const title = window.Swal.getTitle();
        if (title && title.innerHTML.includes('KERAHASIAAN INFORMASI')) {
          window.Swal.clickConfirm();
          handled = true;
          setTimeout(() => handled = false, 3000);
        }
      }
      if (document.querySelector('#pstname:visible')) {
        window.parent.postMessage({ type: 'NIK_PROCESSED' }, '*');
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    if (typeof $ === 'undefined') {
      // Jika jQuery belum siap, tunda
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
        <h4 style="margin:0 0 8px;">🤖 Otomatisasi NIK (Auto Setuju)</h4>
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