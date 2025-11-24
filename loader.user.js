// ==UserScript==
// @name         PKM Script Loader
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Load dynamic modules from GitHub repository
// @author       cobrabagaskara
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // Konfigurasi: ganti jika repo berpindah
    const REPO_BASE = 'https://raw.githubusercontent.com/cobrabagaskara/pkm_script/main';

    console.log('[PKM Loader] Memuat daftar modul dari manifest.json...');

    GM_xmlhttpRequest({
        method: 'GET',
        url: `${REPO_BASE}/manifest.json?t=${Date.now()}`, // hindari cache
        onload: function (response) {
            if (response.status !== 200) {
                console.error('[PKM Loader] Gagal mengambil manifest.json');
                return;
            }

            try {
                const manifest = JSON.parse(response.responseText);
                if (!Array.isArray(manifest.modules)) {
                    console.error('[PKM Loader] Format manifest tidak valid');
                    return;
                }

                manifest.modules.forEach(module => {
                    if (typeof module !== 'string') return;

                    console.log(`[PKM Loader] Memuat modul: ${module}`);
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: `${REPO_BASE}/modules/${encodeURIComponent(module)}?t=${Date.now()}`,
                        onload: function (res) {
                            if (res.status === 200) {
                                try {
                                    const script = document.createElement('script');
                                    script.textContent = res.responseText;
                                    script.setAttribute('data-pkm-module', module);
                                    document.head.appendChild(script);
                                    console.log(`[PKM Loader] Modul ${module} berhasil dijalankan.`);
                                } catch (e) {
                                    console.error(`[PKM Loader] Error mengeksekusi ${module}:`, e);
                                }
                            } else {
                                console.error(`[PKM Loader] Gagal memuat modul ${module}: ${res.status}`);
                            }
                        },
                        onerror: function () {
                            console.error(`[PKM Loader] Gagal mengunduh modul ${module}`);
                        }
                    });
                });
            } catch (e) {
                console.error('[PKM Loader] Error parsing manifest.json:', e);
            }
        },
        onerror: function () {
            console.error('[PKM Loader] Gagal menghubungi GitHub');
        }
    });
})();