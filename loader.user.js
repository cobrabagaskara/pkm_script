// ==UserScript==
// @name         Company Scripts Loader
// @namespace    http://yourcompany.com
// @version      1.0
// @description  Dynamic script loader from GitHub
// @author       You
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/yourusername/tampermonkey-scripts/main/loader.user.js
// @downloadURL  https://raw.githubusercontent.com/yourusername/tampermonkey-scripts/main/loader.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    const CONFIG = {
        repoUrl: 'https://raw.githubusercontent.com/yourusername/tampermonkey-scripts/main/',
        manifestFile: 'manifest.json',
        checkInterval: 60 * 60 * 1000, // 1 jam
        forceUpdate: false
    };
    
    class ScriptManager {
        constructor() {
            this.scripts = [];
            this.init();
        }
        
        async init() {
            this.addMenuCommands();
            await this.loadManifest();
            await this.checkUpdates();
            this.setupAutoUpdate();
        }
        
        addMenuCommands() {
            GM_registerMenuCommand('🔄 Check Updates', () => this.forceCheckUpdates());
            GM_registerMenuCommand('📊 Show Loaded Scripts', () => this.showLoadedScripts());
        }
        
        async loadManifest() {
            try {
                const manifest = await this.fetchFile(CONFIG.manifestFile);
                this.scripts = JSON.parse(manifest).scripts;
                console.log('📦 Loaded manifest:', this.scripts);
            } catch (error) {
                console.error('❌ Failed to load manifest:', error);
            }
        }
        
        async checkUpdates() {
            for (const scriptInfo of this.scripts) {
                await this.processScript(scriptInfo);
            }
        }
        
        async processScript(scriptInfo) {
            const storedVersion = GM_getValue(`version_${scriptInfo.name}`, '0');
            const scriptContent = await this.fetchFile(scriptInfo.path);
            
            // Extract version from script metadata
            const versionMatch = scriptContent.match(/@version\s+([\d.]+)/);
            const currentVersion = versionMatch ? versionMatch[1] : '1.0';
            
            if (currentVersion !== storedVersion || CONFIG.forceUpdate) {
                console.log(`🔄 Updating ${scriptInfo.name} to v${currentVersion}`);
                await this.executeScript(scriptContent, scriptInfo.name);
                GM_setValue(`version_${scriptInfo.name}`, currentVersion);
            }
        }
        
        async executeScript(content, scriptName) {
            try {
                // Remove metadata to prevent conflicts
                const cleanContent = content.replace(/\/\/ ==\/UserScript==[\s\S]*?/, '');
                
                // Create script element
                const script = document.createElement('script');
                script.textContent = `
                    try {
                        ${cleanContent}
                        console.log('✅ Successfully loaded: ${scriptName}');
                    } catch (error) {
                        console.error('❌ Error in ${scriptName}:', error);
                    }
                `;
                
                document.head.appendChild(script);
                document.head.removeChild(script);
                
            } catch (error) {
                console.error(`❌ Failed to execute ${scriptName}:`, error);
            }
        }
        
        fetchFile(filename) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: CONFIG.repoUrl + filename,
                    onload: function(response) {
                        if (response.status === 200) {
                            resolve(response.responseText);
                        } else {
                            reject(new Error(`HTTP ${response.status}`));
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
            alert('✅ Update check completed!');
        }
        
        showLoadedScripts() {
            const scriptList = this.scripts.map(s => 
                `• ${s.name} (v${GM_getValue(`version_${s.name}`, 'unknown')})`
            ).join('\\n');
            
            alert(`📊 Loaded Scripts:\\n${scriptList}`);
        }
    }
    
    // Initialize
    new ScriptManager();
})();