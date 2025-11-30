// ==UserScript==
// @name         EPUS: Tutup Popup Billing
// @namespace    PKM
// @version      3.4
// @description  Menutup popup tagihan ePuskesmas secara otomatis & persisten
// ==/UserScript==

(function () {
  'use strict';

  const allowedHosts = ['cirebon.epuskesmas.id', 'epuskesmas.id'];
  if (!allowedHosts.some(host => window.location.hostname.endsWith(host))) {
    return;
  }

  const TARGET_KEYWORDS = [
    "Pembayaran Layanan Telah Melewati Jatuh Tempo",
    "e-Puskesmas Pemberitahuan"
  ];

  function getAllTextContent(el) {
    if (!el || el.nodeType !== 1) return '';
    return (el.textContent || '') +
           Array.from(el.querySelectorAll('*'))
                .map(n => n.textContent || '')
                .join(' ');
  }

  function isBillingNotification(element) {
    const txt = getAllTextContent(element).toLowerCase();
    return TARGET_KEYWORDS.some(k => txt.includes(k.toLowerCase()));
  }

  function closeBillingModal(root) {
    const modal = root.closest(".modal, .modal-dialog, .modal-content");
    if (!modal) return false;
    const btn = modal.querySelector("#btn_close_suspend");
    if (btn && !btn.disabled) {
      btn.click();
    }
    setTimeout(() => {
      if (modal.parentNode) modal.remove();
      document.querySelectorAll(".modal-backdrop").forEach(b => {
        if (b.parentNode) b.remove();
      });
    }, 100);
    return true;
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (isBillingNotification(node)) {
          closeBillingModal(node);
        }
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
        let el;
        while ((el = walker.nextNode())) {
          if (isBillingNotification(el)) {
            closeBillingModal(el);
          }
        }
      }
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  const pollClose = () => {
    const allElems = document.querySelectorAll('body *');
    for (const el of allElems) {
      if (isBillingNotification(el)) {
        if (closeBillingModal(el)) {
          console.log("[BillingClose] Popup ditemukan dan ditutup via polling.");
        }
      }
    }
  };

  setInterval(pollClose, 1500);
  setTimeout(pollClose, 500);
})();