// ==UserScript==
// @name         Epus Close ONLY ePuskesmas Billing Notification (Modul)
// @namespace    PKM
// @version      3.2
// @description  Menutup popup tagihan ePuskesmas secara otomatis
// ==/UserScript==

(function () {
    'use strict';

    if (!window.location.hostname.endsWith('epuskesmas.id')) {
        return;
    }

    const TARGET_KEYWORDS = [
        "Pembayaran Layanan Telah Melewati Jatuh Tempo",
        "e-Puskesmas Pemberitahuan"
    ];

    function getAllTextContent(el) {
        if (!el || el.nodeType !== 1) return '';
        return (el.textContent || '')
            + Array.from(el.querySelectorAll('*'))
                   .map(n => n.textContent || '')
                   .join(' ');
    }

    function isBillingNotification(element) {
        const txt = getAllTextContent(element).toLowerCase();
        return TARGET_KEYWORDS.some(k => txt.includes(k.toLowerCase()));
    }

    function closeBillingModal(root) {
        const modal = root.closest(".modal-content, .modal, .modal-dialog");
        if (!modal) return;

        const btn = modal.querySelector("#btn_close_suspend");
        if (btn) {
            btn.click();
        }

        // Tetap hapus sebagai fallback
        setTimeout(() => {
            if (modal.parentNode) modal.remove();
            document.querySelectorAll(".modal-backdrop").forEach(b => {
                if (b.parentNode) b.remove();
            });
        }, 150);
    }

    // Periksa elemen yang sudah ada saat script dimuat
    const initialCheck = () => {
        document.querySelectorAll('body *').forEach(el => {
            if (isBillingNotification(el)) {
                closeBillingModal(el);
            }
        });
    };

    // Amati perubahan DOM
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;

                if (isBillingNotification(node)) {
                    closeBillingModal(node);
                    continue;
                }

                // Cek juga jika ada anak yang mengandung teks
                if (node.querySelectorAll) {
                    node.querySelectorAll('*').forEach(child => {
                        if (isBillingNotification(child)) {
                            closeBillingModal(child);
                        }
                    });
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Jalankan pemeriksaan awal setelah DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialCheck);
    } else {
        initialCheck();
    }

    console.log("[BillingClose Modul] Active → Auto-close tagihan modal on epuskesmas.id.");
})();