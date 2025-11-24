// ==UserScript==
// @name         PKM Centralized Userscript Loader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically loads PKM work scripts from GitHub
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    const baseURL =
        "https://raw.githubusercontent.com/cobrabagaskara/pkm_script/main";

    /** Load manifest.json */
    GM_xmlhttpRequest({
        method: "GET",
        url: `${baseURL}/manifest.json`,
        onload: function (res) {
            try {
                const manifest = JSON.parse(res.responseText);
                console.log("[PKM Loader] Manifest loaded:", manifest);

                manifest.modules.forEach((moduleName) => {
                    loadModule(moduleName);
                });
            } catch (e) {
                console.error("[PKM Loader] Failed to parse manifest.json", e);
            }
        },
    });

    /** Load each module file */
    function loadModule(fileName) {
        GM_xmlhttpRequest({
            method: "GET",
            url: `${baseURL}/modules/${fileName}`,
            onload: function (res) {
                try {
                    const scriptEl = document.createElement("script");
                    scriptEl.textContent = res.responseText;
                    document.body.appendChild(scriptEl);

                    console.log("[PKM Loader] Module loaded:", fileName);
                } catch (err) {
                    console.error(`[PKM Loader] Error loading ${fileName}`, err);
                }
            },
            onerror: function () {
                console.error(`[PKM Loader] Failed to fetch ${fileName}`);
            },
        });
    }
})();