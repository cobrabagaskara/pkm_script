// ==UserScript==
// @name         Example: Hello Alert
// @namespace    PKM
// @version      1.0
// @description  Contoh modul sederhana
// @author       cobrabagaskara
// ==/UserScript==

(function () {
    'use strict';

    // Jalankan setelah halaman siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    function run() {
        console.log('[PKM Module] Hello from example-hello.js!');
        // alert('Hello from PKM module!'); // Hati-hati dengan alert di produksi
    }
})();