// ==UserScript==
// @name         Krisna Auto Klik  Kedawung
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Otomatis klik dua link rutin lalu munculkan tombol Kedawung
// @match        https://cirebonkab.krisna.systems/nonfisik/2026/nonfisik-usulan
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // =============================
    // 1) AUTO KLIK STEP 1 & STEP 2
    // =============================
    let step1Done = false;
    let step2Done = false;

    function tryAutoClicks() {
        // --- STEP 1 ---
        if (!step1Done) {
            const link1 = Array.from(document.querySelectorAll('a'))
                .find(a => a.textContent.trim() === "Bantuan Operasional Kesehatan");

            if (link1) {
                console.log("AutoKlik: Step 1 → Bantuan Operasional Kesehatan");
                link1.click();
                step1Done = true;
                return; // tunggu DOM berubah
            }
        }

        // --- STEP 2 ---
        if (step1Done && !step2Done) {
            const link2 = Array.from(document.querySelectorAll('a'))
                .find(a => a.textContent.trim() === "Bantuan Operasional Kesehatan - Puskesmas");

            if (link2) {
                console.log("AutoKlik: Step 2 → Bantuan Operasional Kesehatan - Puskesmas");
                link2.click();
                step2Done = true;
                return;
            }
        }
    }

    // Observasi perubahan DOM (SPA)
    const observer = new MutationObserver(tryAutoClicks);
    observer.observe(document.body, { childList: true, subtree: true });

    // =============================
    // 2) TOMBOL KEDAWUNG (SAMA SEPERTI SEBELUMNYA)
    // =============================
    const btn = document.createElement("button");
    btn.textContent = "Kedawung";
    btn.style.position = "fixed";
    btn.style.top = "10px";
    btn.style.right = "10px";
    btn.style.zIndex = "999999";
    btn.style.padding = "6px 12px";
    btn.style.background = "#007bff";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";
    btn.style.fontSize = "12px";

    btn.onclick = () => {
        const input = document.querySelector('input[placeholder="Search..."]');
        if (input) {
            input.value = "kedawung";
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            alert("Kolom Search tidak ditemukan.");
        }
    };

    document.body.appendChild(btn);
})();
