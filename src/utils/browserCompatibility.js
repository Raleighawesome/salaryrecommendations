/**
 * Browser Compatibility Manager
 * 
 * Provides graceful degradation for browser compatibility issues.
 * Detects browser capabilities and provides fallbacks for unsupported features.
 * Ensures the Team Analyzer works across Chrome, Safari, Firefox, and Edge.
 * 
 * Features:
 * - Browser detection and capability testing
 * - Feature polyfills and fallbacks
 * - Performance optimization based on browser capabilities
 * - User notifications for compatibility issues
 * - Graceful degradation strategies
 */

class BrowserCompatibility {
    constructor() {
        this.browserInfo = {};
        this.capabilities = {};
        this.fallbacks = {};
        this.warnings = [];
        
        // Initialize browser detection and capability testing
        this.detectBrowser();
        this.testCapabilities();
        this.setupFallbacks();
        this.applyCompatibilityFixes();
    }

    /**
     * Detect browser type and version
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        const vendor = navigator.vendor;
        
        // Detect browser type
        if (userAgent.includes('Chrome') && vendor.includes('Google')) {
            this.browserInfo.name = 'Chrome';
        } else if (userAgent.includes('Safari') && vendor.includes('Apple')) {
            this.browserInfo.name = 'Safari';
        } else if (userAgent.includes('Firefox')) {
            this.browserInfo.name = 'Firefox';
        } else if (userAgent.includes('Edge')) {
            this.browserInfo.name = 'Edge';
        } else {
            this.browserInfo.name = 'Unknown';
        }
        
        // Extract version information
        this.browserInfo.version = this.extractVersion(userAgent);
        this.browserInfo.userAgent = userAgent;
        this.browserInfo.platform = navigator.platform;
        this.browserInfo.mobile = /Mobi|Android/i.test(userAgent);
        
        console.log('Browser detected:', this.browserInfo);
    }

    /**
     * Extract browser version from user agent
     */
    extractVersion(userAgent) {
        let version = 'Unknown';
        
        try {
            if (userAgent.includes('Chrome')) {
                const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
                version = match ? match[1] : 'Unknown';
            } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
                const match = userAgent.match(/Version\/(\d+\.\d+)/);
                version = match ? match[1] : 'Unknown';
            } else if (userAgent.includes('Firefox')) {
                const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
                version = match ? match[1] : 'Unknown';
            } else if (userAgent.includes('Edge')) {
                const match = userAgent.match(/Edge\/(\d+\.\d+)/);
                version = match ? match[1] : 'Unknown';
            }
        } catch (error) {
            console.warn('Error extracting browser version:', error);
        }
        
        return version;
    }

    /**
     * Test browser capabilities
     */
    testCapabilities() {
        // Test JavaScript features
        this.capabilities.es6 = this.testES6Support();
        this.capabilities.cssGrid = this.testCSSGridSupport();
        this.capabilities.cssFlexbox = this.testFlexboxSupport();
        this.capabilities.fileAPI = this.testFileAPISupport();
        this.capabilities.localStorage = this.testLocalStorageSupport();
        this.capabilities.requestAnimationFrame = this.testRequestAnimationFrameSupport();
        this.capabilities.intersectionObserver = this.testIntersectionObserverSupport();
        
        // Test CSS features
        this.capabilities.cssCustomProperties = this.testCSSCustomPropertiesSupport();
        this.capabilities.cssCalc = this.testCSSCalcSupport();
        
        // Test HTML5 features
        this.capabilities.canvas = this.testCanvasSupport();
        this.capabilities.svg = this.testSVGSupport();
        
        // Test performance features
        this.capabilities.serviceWorkers = this.testServiceWorkerSupport();
        
        // Test security features
        this.capabilities.https = location.protocol === 'https:';
        this.capabilities.csp = this.testCSPSupport();
        
        console.log('Browser capabilities:', this.capabilities);
    }

    /**
     * Test ES6 support
     */
    testES6Support() {
        try {
            eval('const test = () => `ES6`;');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test CSS Grid support
     */
    testCSSGridSupport() {
        return window.CSS && CSS.supports('display', 'grid');
    }

    /**
     * Test Flexbox support
     */
    testFlexboxSupport() {
        return window.CSS && CSS.supports('display', 'flex');
    }

    /**
     * Test File API support
     */
    testFileAPISupport() {
        return !!(window.File && window.FileReader && window.FileList && window.Blob);
    }

    /**
     * Test localStorage support
     */
    testLocalStorageSupport() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test requestAnimationFrame support
     */
    testRequestAnimationFrameSupport() {
        return !!(window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame);
    }

    /**
     * Test Intersection Observer support
     */
    testIntersectionObserverSupport() {
        return 'IntersectionObserver' in window;
    }

    /**
     * Test CSS Custom Properties support
     */
    testCSSCustomPropertiesSupport() {
        return CSS.supports('--test', 'value');
    }

    /**
     * Test CSS calc() support
     */
    testCSSCalcSupport() {
        return CSS.supports('width', 'calc(100% - 10px)');
    }

    /**
     * Test Canvas support
     */
    testCanvasSupport() {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    }

    /**
     * Test SVG support
     */
    testSVGSupport() {
        return !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
    }

    /**
     * Test Service Worker support
     */
    testServiceWorkerSupport() {
        return 'serviceWorker' in navigator;
    }

    /**
     * Test Content Security Policy support
     */
    testCSPSupport() {
        return 'securityPolicy' in document || 'SecurityPolicyViolationEvent' in window;
    }

    /**
     * Setup fallbacks for unsupported features
     */
    setupFallbacks() {
        // ES6 fallbacks
        if (!this.capabilities.es6) {
            this.setupES6Fallbacks();
        }
        
        // CSS fallbacks
        if (!this.capabilities.cssGrid) {
            this.setupCSSGridFallback();
        }
        
        if (!this.capabilities.cssFlexbox) {
            this.setupFlexboxFallback();
        }
        
        // Storage fallbacks
        if (!this.capabilities.localStorage) {
            this.setupLocalStorageFallback();
        }
        
        // Animation fallbacks
        if (!this.capabilities.requestAnimationFrame) {
            this.setupRequestAnimationFrameFallback();
        }
        
        // Observer fallbacks
        if (!this.capabilities.intersectionObserver) {
            this.setupIntersectionObserverFallback();
        }
        
        console.log('Fallbacks setup:', this.fallbacks);
    }

    /**
     * Setup ES6 fallbacks
     */
    setupES6Fallbacks() {
        // Add polyfills for basic ES6 features
        if (!Array.prototype.includes) {
            Array.prototype.includes = function(searchElement) {
                return this.indexOf(searchElement) !== -1;
            };
        }
        
        if (!String.prototype.includes) {
            String.prototype.includes = function(search) {
                return this.indexOf(search) !== -1;
            };
        }
        
        if (!Object.assign) {
            Object.assign = function(target) {
                for (let i = 1; i < arguments.length; i++) {
                    const source = arguments[i];
                    for (const key in source) {
                        if (source.hasOwnProperty(key)) {
                            target[key] = source[key];
                        }
                    }
                }
                return target;
            };
        }
        
        this.fallbacks.es6 = true;
    }

    /**
     * Setup CSS Grid fallback
     */
    setupCSSGridFallback() {
        // Add CSS class for grid fallback
        document.documentElement.classList.add('no-css-grid');
        
        // Add fallback styles
        const style = document.createElement('style');
        style.textContent = `
            .no-css-grid .grid-container {
                display: block;
            }
            .no-css-grid .grid-item {
                display: inline-block;
                vertical-align: top;
                width: 48%;
                margin: 1%;
            }
        `;
        document.head.appendChild(style);
        
        this.fallbacks.cssGrid = true;
    }

    /**
     * Setup Flexbox fallback
     */
    setupFlexboxFallback() {
        document.documentElement.classList.add('no-flexbox');
        
        const style = document.createElement('style');
        style.textContent = `
            .no-flexbox .flex-container {
                display: block;
            }
            .no-flexbox .flex-item {
                display: inline-block;
                vertical-align: top;
            }
        `;
        document.head.appendChild(style);
        
        return true;
    }

    /**
     * Setup localStorage fallback
     */
    setupLocalStorageFallback() {
        // Create in-memory storage fallback
        window.localStorage = {
            _data: {},
            setItem: function(key, value) {
                this._data[key] = String(value);
            },
            getItem: function(key) {
                return this._data[key] || null;
            },
            removeItem: function(key) {
                delete this._data[key];
            },
            clear: function() {
                this._data = {};
            }
        };
        
        this.warnings.push('localStorage not supported - using in-memory storage');
        this.fallbacks.localStorage = true;
    }

    /**
     * Setup requestAnimationFrame fallback
     */
    setupRequestAnimationFrameFallback() {
        window.requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                return setTimeout(callback, 1000 / 60);
            };
        
        window.cancelAnimationFrame = window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            function(id) {
                clearTimeout(id);
            };
        
        this.fallbacks.requestAnimationFrame = true;
    }

    /**
     * Setup Intersection Observer fallback
     */
    setupIntersectionObserverFallback() {
        // Simple polyfill for basic intersection detection
        window.IntersectionObserver = function(callback, options) {
            this.callback = callback;
            this.options = options || {};
            this.elements = [];
            
            this.observe = function(element) {
                this.elements.push(element);
                // Trigger immediate callback for fallback
                setTimeout(() => {
                    this.callback([{
                        target: element,
                        isIntersecting: true,
                        intersectionRatio: 1
                    }]);
                }, 100);
            };
            
            this.unobserve = function(element) {
                const index = this.elements.indexOf(element);
                if (index > -1) {
                    this.elements.splice(index, 1);
                }
            };
            
            this.disconnect = function() {
                this.elements = [];
            };
        };
        
        this.fallbacks.intersectionObserver = true;
    }

    /**
     * Apply compatibility fixes
     */
    applyCompatibilityFixes() {
        // Add browser-specific classes
        document.documentElement.classList.add(`browser-${this.browserInfo.name.toLowerCase()}`);
        
        if (this.browserInfo.mobile) {
            document.documentElement.classList.add('mobile-browser');
        }
        
        // Apply performance optimizations based on browser
        this.applyPerformanceOptimizations();
        
        // Show compatibility warnings if needed
        this.showCompatibilityWarnings();
    }

    /**
     * Apply performance optimizations based on browser capabilities
     */
    applyPerformanceOptimizations() {
        // Disable heavy animations on older browsers
        if (!this.capabilities.requestAnimationFrame || this.browserInfo.mobile) {
            document.documentElement.classList.add('reduced-motion');
        }
        
        // Reduce virtual scrolling complexity on older browsers
        if (!this.capabilities.intersectionObserver) {
            document.documentElement.classList.add('simple-scrolling');
        }
        
        // Disable complex CSS features on older browsers
        if (!this.capabilities.cssGrid || !this.capabilities.cssFlexbox) {
            document.documentElement.classList.add('simple-layout');
        }
    }

    /**
     * Show compatibility warnings to users
     */
    showCompatibilityWarnings() {
        if (this.warnings.length === 0 && this.isFullySupported()) {
            return;
        }
        
        const warningMessages = [];
        
        // Check for critical missing features
        if (!this.capabilities.fileAPI) {
            warningMessages.push('File upload may not work properly in this browser');
        }
        
        if (!this.capabilities.localStorage) {
            warningMessages.push('Settings and preferences will not be saved');
        }
        
        if (!this.capabilities.es6) {
            warningMessages.push('Some features may not work properly');
        }
        
        // Add custom warnings
        warningMessages.push(...this.warnings);
        
        // Show warnings if any exist
        if (warningMessages.length > 0) {
            this.showBrowserWarning(warningMessages);
        }
    }

    /**
     * Show browser compatibility warning
     */
    showBrowserWarning(messages) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'browser-compatibility-warning';
        warningDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #fff3cd;
            border-bottom: 2px solid #ffc107;
            padding: 1rem;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        warningDiv.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <strong>⚠️ Browser Compatibility Notice</strong>
                    <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                        ${messages.map(msg => `• ${msg}`).join('<br>')}
                    </div>
                    <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #856404;">
                        For the best experience, please use Chrome, Safari, Firefox, or Edge.
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                ">×</button>
            </div>
        `;
        
        document.body.insertBefore(warningDiv, document.body.firstChild);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.remove();
            }
        }, 10000);
    }

    /**
     * Check if browser is fully supported
     */
    isFullySupported() {
        const requiredFeatures = ['fileAPI', 'localStorage', 'es6'];
        return requiredFeatures.every(feature => this.capabilities[feature]);
    }

    /**
     * Get browser compatibility report
     */
    getCompatibilityReport() {
        return {
            browser: this.browserInfo,
            capabilities: this.capabilities,
            fallbacks: Object.keys(this.fallbacks),
            warnings: this.warnings,
            fullySupported: this.isFullySupported(),
            recommendedBrowsers: [
                'Chrome 80+',
                'Safari 13+',
                'Firefox 75+',
                'Edge 80+'
            ]
        };
    }

    /**
     * Enable feature if supported, otherwise use fallback
     */
    enableFeature(featureName, enableCallback, fallbackCallback) {
        if (this.capabilities[featureName]) {
            enableCallback();
        } else if (fallbackCallback) {
            fallbackCallback();
        }
    }

    /**
     * Get polyfill script URLs for missing features
     */
    getPolyfillUrls() {
        const polyfills = [];
        
        if (!this.capabilities.es6) {
            polyfills.push('https://polyfill.io/v3/polyfill.min.js?features=es6');
        }
        
        if (!this.capabilities.intersectionObserver) {
            polyfills.push('https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver');
        }
        
        if (!this.capabilities.resizeObserver) {
            polyfills.push('https://polyfill.io/v3/polyfill.min.js?features=ResizeObserver');
        }
        
        return polyfills;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserCompatibility;
} else {
    window.BrowserCompatibility = BrowserCompatibility;
} 