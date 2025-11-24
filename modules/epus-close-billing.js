// ==UserScript==
// @name         Epus Close ONLY ePuskesmas Billing Notification (Modul)
// @namespace    PKM
// @version      3.1
// @description  Menutup popup tagihan ePuskesmas tanpa mengganggu menu lain
// ==/UserScript==

(function () {
    'use strict';

    // ✅ PENAMBAHAN: Pastikan hanya jalan di domain epuskesmas.id
    if (!window.location.hostname.endsWith('epuskesmas.id')) {
        return;
    }

    const TARGET_KEYWORDS = [
        "Pembayaran Layanan Telah Melewati Jatuh Tempo",
        "e-Puskesmas Pemberitahuan"
    ];

    function isBillingNotification(element) {
        if (!element) return false;

        const txt = element.textContent?.toLowerCase() || "";
        return TARGET_KEYWORDS.some(k =>
            txt.includes(k.toLowerCase())
        );
    }

    function closeBillingModal(root) {
        const modal = root.closest(".modal-content, .modal, .modal-dialog");
        if (!modal) return;

        const btn = modal.querySelector("#btn_close_suspend");
        if (btn) btn.click();

        setTimeout(() => {
            modal.remove();
            document.querySelectorAll(".modal-backdrop").forEach(b => b.remove());
        }, 100);
    }

    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;

                if (isBillingNotification(node)) {
                    closeBillingModal(node);
                    continue;
                }

                // Perbaikan logika: cek teks di dalam node secara rekursif
                if (node.textContent && isBillingNotification(node)) {
                    closeBillingModal(node);
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log("[BillingClose Modul] Active → Only closing tagihan modal on epuskesmas.id.");
})();