// Auto Close ONLY ePuskesmas Billing Notification
(function () {
    'use strict';

    const TARGET_KEYWORDS = [
        "Pembayaran Layanan Telah Melewati Jatuh Tempo",
        "e-Puskesmas Pemberitahuan"
    ];

    // Hanya jalankan di halaman URL yang mengandung "broadcastNotif"
    if (!window.location.href.includes("broadcastNotif")) return;

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

        // tombol close fleksibel
        const btn = modal.querySelector("#btn_close_suspend, .btn-close, [data-dismiss='modal']");
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

                const found = node.querySelector?.("*");
                if (found && isBillingNotification(node)) {
                    closeBillingModal(node);
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Fallback interval untuk modal yang muncul terlambat
    setInterval(() => {
        document.querySelectorAll(".modal-content, .modal, .modal-dialog").forEach(modal => {
            if (modal.dataset.billingHandled) return;

            const txt = modal.textContent?.toLowerCase() || "";
            if (TARGET_KEYWORDS.some(k => txt.includes(k.toLowerCase()))) {
                const btn = modal.querySelector("#btn_close_suspend, .btn-close, [data-dismiss='modal']");
                if (btn) btn.click();
                modal.remove();
                document.querySelectorAll(".modal-backdrop").forEach(b => b.remove());
                modal.dataset.billingHandled = true;
                console.log("[BillingClose] Modal removed by interval fallback");
            }
        });
    }, 1000);

    console.log("[BillingClose] Module loaded → Only closing tagihan modal.");
})();
