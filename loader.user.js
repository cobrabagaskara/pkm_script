// ==UserScript==
// @name         PKM Scripts Loader
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Dynamic script loader from GitHub for PKM
// @author       Cobra
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/cobrabagaskara/pkm_script/main/loader.user.js
// @downloadURL  https://raw.githubusercontent.com/cobrabagaskara/pkm_script/main/loader.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    const CONFIG = {
        repoUrl: 'https://raw.githubusercontent.com/cobrabagaskara/pkm_script/main/',
        manifestFile: 'manifest.json',
        checkInterval: 30 * 60 * 1000, // 30 menit
        forceUpdate: false
    };
    
    class ScriptManager {
        constructor() {
            this.scripts = [];
            this.init();
        }
        
        async init() {
            console.log('🚀 PKM Loader: Initializing...');
            this.addMenuCommands();
            await this.loadManifest();
            await this.checkUpdates();
            this.setupAutoUpdate();
        }
        
        addMenuCommands() {
            if (typeof GM_registerMenuCommand !== 'undefined') {
                GM_registerMenuCommand('🔄 Check PKM Updates', () => this.forceCheckUpdates());
                GM_registerMenuCommand('📊 Show PKM Scripts', () => this.showLoadedScripts());
            }
        }
        
        async loadManifest() {
            try {
                const manifest = await this.fetchFile(CONFIG.manifestFile);
                const data = JSON.parse(manifest);
                this.scripts = data.scripts;
                console.log('📦 PKM Loader: Loaded manifest with', this.scripts.length, 'scripts');
            } catch (error) {
                console.error('❌ PKM Loader: Failed to load manifest:', error);
            }
        }
        
        async checkUpdates() {
            console.log('🔍 PKM Loader: Checking for updates...');
            for (const scriptInfo of this.scripts) {
                await this.processScript(scriptInfo);
            }
        }
        
        async processScript(scriptInfo) {
            try {
                const storedVersion = GM_getValue(`pkm_version_${scriptInfo.name}`, '0');
                const scriptContent = await this.fetchFile(scriptInfo.path);
                
                // Extract version from script metadata
                const versionMatch = scriptContent.match(/@version\s+([\d.]+)/);
                const currentVersion = versionMatch ? versionMatch[1] : '1.0';
                
                if (currentVersion !== storedVersion || CONFIG.forceUpdate) {
                    console.log(`🔄 PKM Loader: Updating ${scriptInfo.name} from v${storedVersion} to v${currentVersion}`);
                    await this.executeScript(scriptContent, scriptInfo.name);
                    GM_setValue(`pkm_version_${scriptInfo.name}`, currentVersion);
                } else {
                    console.log(`✅ PKM Loader: ${scriptInfo.name} is up to date (v${currentVersion})`);
                }
            } catch (error) {
                console.error(`❌ PKM Loader: Failed to process ${scriptInfo.name}:`, error);
            }
        }
        
        async executeScript(content, scriptName) {
            return new Promise((resolve) => {
                try {
                    // Split to get content after metadata
                    const parts = content.split('// ==/UserScript==');
                    const scriptContent = parts.length > 1 ? parts[1] : content;
                    
                    // Create script element
                    const script = document.createElement('script');
                    script.textContent = `
                        (function() {
                            'use strict';
                            try {
                                ${scriptContent}
                                console.log('✅ PKM: Successfully loaded "${scriptName}"');
                            } catch (error) {
                                console.error('❌ PKM: Error in "${scriptName}":', error);
                            }
                        })();
                    `;
                    
                    document.head.appendChild(script);
                    setTimeout(() => {
                        if (script.parentNode) {
                            document.head.removeChild(script);
                        }
                        resolve();
                    }, 100);
                    
                } catch (error) {
                    console.error(`❌ PKM Loader: Failed to execute ${scriptName}:`, error);
                    resolve();
                }
            });
        }
        
        fetchFile(filename) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: CONFIG.repoUrl + filename,
                    timeout: 10000,
                    onload: function(response) {
                        if (response.status === 200) {
                            resolve(response.responseText);
                        } else {
                            reject(new Error(`HTTP ${response.status} for ${filename}`));
                        }
                    },
                    onerror: reject
                });
            });
        }
        
        setupAutoUpdate() {
            setInterval(() => {
                this.checkUpdates();
            }, CONFIG.checkInterval);
        }
        
        async forceCheckUpdates() {
            CONFIG.forceUpdate = true;
            await this.checkUpdates();
            CONFIG.forceUpdate = false;
            alert('✅ PKM Loader: Update check completed!');
        }
        
        showLoadedScripts() {
            const scriptList = this.scripts.map(s => {
                const version = GM_getValue(`pkm_version_${s.name}`, 'Not loaded');
                return `• ${s.name} (v${version}) - ${s.description}`;
            }).join('\n');
            
            alert(`📊 PKM Loaded Scripts:\n${scriptList}`);
        }
    }
    
    // =============================================
    // SOLUSI #2 - ROBUST INITIALIZATION
    // =============================================
    function initializeLoader() {
        const maxWaitTime = 5000; // 5 detik maximum
        const startTime = Date.now();
        
        function tryInitialize() {
            // Cek jika body sudah ada dan punya content (page meaningful loaded)
            if (document.body && document.body.children.length > 0) {
                console.log('🚀 PKM Loader: Page ready, initializing...');
                new ScriptManager();
                return true;
            }
            
            // Jika timeout, force initialize anyway
            if (Date.now() - startTime > maxWaitTime) {
                console.log('⚠️ PKM Loader: Timeout, forcing initialization...');
                new ScriptManager();
                return true;
            }
            
            // Coba lagi dalam 100ms
            setTimeout(tryInitialize, 100);
            return false;
        }
        
        tryInitialize();
    }
    
    // Handle different page states
    if (document.readyState === 'loading') {
        // Page masih loading, tunggu DOMContentLoaded dulu
        document.addEventListener('DOMContentLoaded', initializeLoader);
    } else {
        // DOM sudah ready, langsung initialize dengan safety check
        initializeLoader();
    }
    
    // Juga handle SPA navigation (untuk website modern)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('🔄 PKM Loader: URL changed (SPA navigation), re-initializing...');
            setTimeout(initializeLoader, 500);
        }
    }).observe(document, { subtree: true, childList: true });
    
})();