// ==UserScript==
// @name         PKM - Form Auto-Filler
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Automatically fills common forms
// @author       Cobra
// @match        https://www.google.com/
// @match        http://localhost/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('✅ PKM Form Auto-Filler: Loaded!');
    
    // Contoh fungsi auto-fill
    function autoFillForms() {
        // Cari field-field form dan isi otomatis
        const fields = {
            'username': 'pkm_user',
            'email': 'user@pkm.com',
            'name': 'PKM User'
        };
        
        Object.keys(fields).forEach(fieldName => {
            const field = document.querySelector(`input[name="${fieldName}"], #${fieldName}`);
            if (field && !field.value) {
                field.value = fields[fieldName];
                console.log(`✅ Auto-filled ${fieldName}`);
            }
        });
    }
    
    // Jalankan ketika page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoFillForms);
    } else {
        autoFillForms();
    }
    
    // Juga jalankan ketika ada dynamic content
    const observer = new MutationObserver(() => {
        autoFillForms();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();