// ==UserScript==
// @name         PKM Script Loader (DEV)
// @namespace    http://tampermonkey.net/
// @version      2.0-dev
// @description  [DEV] Load modular scripts from dev/modular-system branch
// @author       cobrabagaskara
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // 🔧 Konfigurasi branch pengembangan
    const REPO_USER = 'cobrabagaskara';
    const REPO_NAME = 'pkm_script';
    const BRANCH = 'dev/modular-system'; // ← SESUAIKAN UNTUK DEV

    // ✅ Pastikan tidak ada spasi! URL harus bersih.
    const REPO_BASE = `https://raw.githubusercontent.com/${REPO_USER}/${REPO_NAME}/${BRANCH}`;

    console.log(`[PKM Loader DEV] Menggunakan branch: ${BRANCH}`);
    console.log('[PKM Loader DEV] Memuat daftar modul dari manifest.json...');

    GM_xmlhttpRequest({
        method: 'GET',
        url: `${REPO_BASE}/manifest.json?t=${Date.now()}`,
        onload: function (response) {
            if (response.status !== 200) {
                console.error('[PKM Loader DEV] Gagal mengambil manifest.json', response.status);
                return;
            }

            try {
                const manifest = JSON.parse(response.responseText);
                if (!Array.isArray(manifest.modules)) {
                    console.error('[PKM Loader DEV] Format manifest tidak valid: modules bukan array');
                    return;
                }

                manifest.modules.forEach(module => {
                    if (typeof module !== 'string' || !module.trim()) return;

                    console.log(`[PKM Loader DEV] Memuat modul: ${module}`);
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: `${REPO_BASE}/modules/${encodeURIComponent(module.trim())}?t=${Date.now()}`,
                        onload: function (res) {
                            if (res.status === 200) {
                                try {
                                    const script = document.createElement('script');
                                    script.textContent = res.responseText;
                                    script.setAttribute('data-pkm-module', module);
                                    (document.head || document.documentElement).appendChild(script);
                                    console.log(`[PKM Loader DEV] ✅ Modul ${module} berhasil dijalankan.`);
                                } catch (e) {
                                    console.error(`[PKM Loader DEV] ❌ Error mengeksekusi ${module}:`, e);
                                }
                            } else {
                                console.error(`[PKM Loader DEV] ❌ Gagal memuat modul ${module}: status ${res.status}`);
                            }
                        },
                        onerror: function () {
                            console.error(`[PKM Loader DEV] ❌ Gagal mengunduh modul: ${module}`);
                        }
                    });
                });
            } catch (e) {
                console.error('[PKM Loader DEV] ❌ Error parsing manifest.json:', e);
            }
        },
        onerror: function () {
            console.error('[PKM Loader DEV] ❌ Gagal menghubungi GitHub (cek koneksi / URL)');
        }
    });
})();