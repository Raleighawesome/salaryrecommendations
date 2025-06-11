/**
 * Help System Component
 * 
 * Provides comprehensive user help, documentation, and interactive tutorials
 * for the Team Analyzer application. Includes contextual help, guided tours,
 * and searchable documentation.
 * 
 * Features:
 * - Interactive guided tours for new users
 * - Contextual help tooltips and overlays
 * - Searchable help documentation
 * - Video tutorials and step-by-step guides
 * - FAQ section with common questions
 * - Keyboard shortcuts reference
 * - Troubleshooting guides
 */

class HelpSystem {
    constructor() {
        this.isInitialized = false;
        this.currentTour = null;
        this.helpData = this.initializeHelpData();
        this.searchIndex = [];
        this.tooltips = new Map();
        
        this.createHelpInterface();
        this.setupEventListeners();
        this.initializeTooltips();
        
        console.log('Help System initialized');
    }

    /**
     * Initialize help data and documentation
     */
    initializeHelpData() {
        return {
            gettingStarted: {
                title: "Getting Started",
                icon: "🚀",
                sections: [
                    {
                        title: "Welcome to Team Analyzer",
                        content: `
                            <p>Team Analyzer helps you analyze employee data, plan salary raises, and make data-driven decisions about your team.</p>
                            <h4>Key Features:</h4>
                            <ul>
                                <li><strong>Data Upload:</strong> Import CSV files with employee information</li>
                                <li><strong>Data Analysis:</strong> View and filter employee data with powerful tools</li>
                                <li><strong>Raise Planning:</strong> Calculate and model salary raise scenarios</li>
                                <li><strong>Analytics:</strong> Visualize team metrics and insights</li>
                                <li><strong>Export:</strong> Export results to various formats</li>
                            </ul>
                        `
                    },
                    {
                        title: "Quick Start Guide",
                        content: `
                            <ol>
                                <li><strong>Upload Data:</strong> Click "Choose File" and select your CSV file</li>
                                <li><strong>Review Data:</strong> Check the uploaded data in the Table tab</li>
                                <li><strong>Plan Raises:</strong> Use the Raises tab to model salary increases</li>
                                <li><strong>View Analytics:</strong> Explore insights in the Analytics tab</li>
                                <li><strong>Export Results:</strong> Save your analysis using the Export tab</li>
                            </ol>
                        `
                    }
                ]
            },
            dataUpload: {
                title: "Data Upload",
                icon: "📁",
                sections: [
                    {
                        title: "CSV File Format",
                        content: `
                            <p>Your CSV file should include the following columns:</p>
                            <ul>
                                <li><strong>id:</strong> Unique employee identifier</li>
                                <li><strong>name:</strong> Employee full name</li>
                                <li><strong>title:</strong> Job title or role</li>
                                <li><strong>country:</strong> Country location</li>
                                <li><strong>salary_amount:</strong> Current salary amount</li>
                                <li><strong>salary_currency:</strong> Currency code (USD, EUR, etc.)</li>
                                <li><strong>performance_rating:</strong> Performance rating</li>
                                <li><strong>comparatio:</strong> Salary comparatio (optional)</li>
                                <li><strong>time_in_role_months:</strong> Months in current role</li>
                                <li><strong>time_since_last_raise_months:</strong> Months since last raise</li>
                                <li><strong>future_talent:</strong> Future talent rating (optional)</li>
                            </ul>
                        `
                    },
                    {
                        title: "Data Validation",
                        content: `
                            <p>The system automatically validates your data and provides feedback:</p>
                            <ul>
                                <li><strong>Required Fields:</strong> ID, name, title, country, and salary are required</li>
                                <li><strong>Duplicates:</strong> Duplicate employees are detected and can be merged</li>
                                <li><strong>Performance Ratings:</strong> Missing ratings can be suggested automatically</li>
                                <li><strong>Currency Support:</strong> Multiple currencies are supported and validated</li>
                            </ul>
                        `
                    }
                ]
            },
            dataAnalysis: {
                title: "Data Analysis",
                icon: "📊",
                sections: [
                    {
                        title: "Table View",
                        content: `
                            <p>The Table tab provides powerful tools to explore your employee data:</p>
                            <ul>
                                <li><strong>Search:</strong> Use the search bar to find specific employees</li>
                                <li><strong>Filters:</strong> Apply filters by country, salary range, performance, etc.</li>
                                <li><strong>Sorting:</strong> Click column headers to sort data</li>
                                <li><strong>Virtual Scrolling:</strong> Handles large datasets efficiently</li>
                            </ul>
                        `
                    },
                    {
                        title: "Performance Suggestions",
                        content: `
                            <p>For employees missing performance ratings, the system can suggest ratings based on:</p>
                            <ul>
                                <li>Salary comparatio relative to peers</li>
                                <li>Time in role and career progression</li>
                                <li>Salary positioning within role/country</li>
                            </ul>
                        `
                    }
                ]
            },
            raisePlanning: {
                title: "Raise Planning",
                icon: "💰",
                sections: [
                    {
                        title: "Scenario Modeling",
                        content: `
                            <p>Create and compare different raise scenarios:</p>
                            <ul>
                                <li><strong>Budget-Based:</strong> Set a total budget and optimize distribution</li>
                                <li><strong>Performance-Based:</strong> Allocate raises based on performance ratings</li>
                                <li><strong>Equity-Based:</strong> Focus on closing pay gaps and improving equity</li>
                                <li><strong>Custom:</strong> Create your own raise criteria and rules</li>
                            </ul>
                        `
                    },
                    {
                        title: "Budget Planning",
                        content: `
                            <p>Plan your raise budget effectively:</p>
                            <ul>
                                <li><strong>Total Budget:</strong> Set overall budget constraints</li>
                                <li><strong>Country Limits:</strong> Apply different limits by country</li>
                                <li><strong>Approval Thresholds:</strong> Set thresholds for management approval</li>
                                <li><strong>Cost Analysis:</strong> See total cost impact of raise scenarios</li>
                            </ul>
                        `
                    }
                ]
            },
            analytics: {
                title: "Analytics & Insights",
                icon: "📈",
                sections: [
                    {
                        title: "Team Metrics",
                        content: `
                            <p>View comprehensive team analytics:</p>
                            <ul>
                                <li><strong>Headcount:</strong> Total employees by country, role, performance</li>
                                <li><strong>Salary Distribution:</strong> Histograms and percentile analysis</li>
                                <li><strong>Performance Analysis:</strong> Performance vs compensation correlation</li>
                                <li><strong>Equity Insights:</strong> Pay gap analysis and equity metrics</li>
                            </ul>
                        `
                    },
                    {
                        title: "Visualizations",
                        content: `
                            <p>Interactive charts and visualizations:</p>
                            <ul>
                                <li><strong>Salary Histograms:</strong> Distribution of salaries across the team</li>
                                <li><strong>Scatter Plots:</strong> Performance vs salary relationships</li>
                                <li><strong>Box Plots:</strong> Salary ranges by country or role</li>
                                <li><strong>Trend Analysis:</strong> Identify patterns and outliers</li>
                            </ul>
                        `
                    }
                ]
            },
            export: {
                title: "Export & Sharing",
                icon: "📤",
                sections: [
                    {
                        title: "Export Formats",
                        content: `
                            <p>Export your analysis in multiple formats:</p>
                            <ul>
                                <li><strong>Google Sheets:</strong> Direct integration with Google Sheets</li>
                                <li><strong>CSV:</strong> Standard comma-separated values format</li>
                                <li><strong>PDF:</strong> Professional reports with charts and analysis</li>
                                <li><strong>Excel:</strong> Microsoft Excel compatible format</li>
                            </ul>
                        `
                    },
                    {
                        title: "Export Options",
                        content: `
                            <p>Customize your exports:</p>
                            <ul>
                                <li><strong>Data Selection:</strong> Choose which data to include</li>
                                <li><strong>Charts:</strong> Include or exclude visualizations</li>
                                <li><strong>Anonymization:</strong> Remove sensitive personal information</li>
                                <li><strong>Templates:</strong> Use predefined export templates</li>
                            </ul>
                        `
                    }
                ]
            },
            troubleshooting: {
                title: "Troubleshooting",
                icon: "🔧",
                sections: [
                    {
                        title: "Common Issues",
                        content: `
                            <h4>File Upload Problems:</h4>
                            <ul>
                                <li><strong>File too large:</strong> Try splitting large files or removing unnecessary columns</li>
                                <li><strong>Invalid format:</strong> Ensure your file is in CSV format with proper encoding</li>
                                <li><strong>Missing columns:</strong> Check that required columns are present and named correctly</li>
                            </ul>
                            
                            <h4>Performance Issues:</h4>
                            <ul>
                                <li><strong>Slow loading:</strong> Large datasets may take time to process</li>
                                <li><strong>Browser compatibility:</strong> Use Chrome, Safari, Firefox, or Edge for best performance</li>
                                <li><strong>Memory issues:</strong> Close other browser tabs if experiencing slowdowns</li>
                            </ul>
                        `
                    },
                    {
                        title: "Browser Support",
                        content: `
                            <p>Team Analyzer works best with modern browsers:</p>
                            <ul>
                                <li><strong>Recommended:</strong> Chrome 80+, Safari 13+, Firefox 75+, Edge 80+</li>
                                <li><strong>Features:</strong> Some features may be limited in older browsers</li>
                                <li><strong>Mobile:</strong> Basic functionality available on mobile devices</li>
                            </ul>
                        `
                    }
                ]
            },
            shortcuts: {
                title: "Keyboard Shortcuts",
                icon: "⌨️",
                sections: [
                    {
                        title: "Navigation",
                        content: `
                            <table class="shortcuts-table">
                                <tr><td><kbd>Tab</kbd></td><td>Navigate between tabs</td></tr>
                                <tr><td><kbd>Ctrl/Cmd + F</kbd></td><td>Focus search bar</td></tr>
                                <tr><td><kbd>Escape</kbd></td><td>Close modals and overlays</td></tr>
                                <tr><td><kbd>?</kbd></td><td>Show this help system</td></tr>
                            </table>
                        `
                    },
                    {
                        title: "Data Table",
                        content: `
                            <table class="shortcuts-table">
                                <tr><td><kbd>↑/↓</kbd></td><td>Navigate table rows</td></tr>
                                <tr><td><kbd>Enter</kbd></td><td>Select/edit row</td></tr>
                                <tr><td><kbd>Ctrl/Cmd + A</kbd></td><td>Select all visible rows</td></tr>
                                <tr><td><kbd>Delete</kbd></td><td>Remove selected rows</td></tr>
                            </table>
                        `
                    }
                ]
            }
        };
    }

    /**
     * Create search index for help content
     */
    createSearchIndex() {
        this.searchIndex = [];
        
        Object.entries(this.helpData).forEach(([categoryKey, category]) => {
            category.sections.forEach((section, sectionIndex) => {
                const searchItem = {
                    category: categoryKey,
                    categoryTitle: category.title,
                    sectionIndex: sectionIndex,
                    title: section.title,
                    content: section.content.replace(/<[^>]*>/g, ''), // Strip HTML
                    keywords: `${category.title} ${section.title} ${section.content}`.toLowerCase()
                };
                this.searchIndex.push(searchItem);
            });
        });
    }

    /**
     * Create help interface
     */
    createHelpInterface() {
        // Create help button
        this.createHelpButton();
        
        // Create help modal
        this.createHelpModal();
        
        // Create tour overlay
        this.createTourOverlay();
    }

    /**
     * Create floating help button
     */
    createHelpButton() {
        const helpButton = document.createElement('button');
        helpButton.id = 'help-button';
        helpButton.className = 'help-button';
        helpButton.innerHTML = '?';
        helpButton.title = 'Help & Documentation (Press ? key)';
        
        helpButton.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #667eea;
            color: white;
            border: none;
            font-size: 1.5rem;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        helpButton.addEventListener('click', () => this.showHelp());
        helpButton.addEventListener('mouseenter', () => {
            helpButton.style.transform = 'scale(1.1)';
            helpButton.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.4)';
        });
        helpButton.addEventListener('mouseleave', () => {
            helpButton.style.transform = 'scale(1)';
            helpButton.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.3)';
        });
        
        document.body.appendChild(helpButton);
    }

    /**
     * Create help modal
     */
    createHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'help-modal';
        modal.className = 'help-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'help-modal-content';
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 1000px;
            height: 80%;
            max-height: 600px;
            display: flex;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;
        
        modalContent.innerHTML = `
            <div class="help-sidebar">
                <div class="help-header">
                    <h2>Help & Documentation</h2>
                    <button class="help-close">×</button>
                </div>
                <div class="help-search">
                    <input type="text" placeholder="Search help..." id="help-search-input">
                </div>
                <nav class="help-nav">
                    ${Object.entries(this.helpData).map(([key, category]) => `
                        <button class="help-nav-item" data-category="${key}">
                            <span class="help-nav-icon">${category.icon}</span>
                            <span class="help-nav-title">${category.title}</span>
                        </button>
                    `).join('')}
                </nav>
                <div class="help-actions">
                    <button class="help-tour-btn">📚 Take a Tour</button>
                </div>
            </div>
            <div class="help-content">
                <div id="help-content-area">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Setup modal event listeners
        this.setupModalEventListeners(modal);
    }

    /**
     * Setup modal event listeners
     */
    setupModalEventListeners(modal) {
        const closeBtn = modal.querySelector('.help-close');
        const searchInput = modal.querySelector('#help-search-input');
        const navItems = modal.querySelectorAll('.help-nav-item');
        const tourBtn = modal.querySelector('.help-tour-btn');
        
        // Close modal
        closeBtn.addEventListener('click', () => this.hideHelp());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideHelp();
        });
        
        // Search functionality
        searchInput.addEventListener('input', (e) => this.searchHelp(e.target.value));
        
        // Navigation
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                this.showHelpCategory(category);
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        // Tour button
        tourBtn.addEventListener('click', () => {
            this.hideHelp();
            this.startGuidedTour();
        });
        
        // Show getting started by default
        this.showHelpCategory('gettingStarted');
        navItems[0].classList.add('active');
    }

    /**
     * Create tour overlay
     */
    createTourOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'tour-overlay';
        overlay.className = 'tour-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: none;
            z-index: 15000;
        `;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tour-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            max-width: 350px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 15001;
        `;
        
        overlay.appendChild(tooltip);
        document.body.appendChild(overlay);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                this.showHelp();
            }
            
            if (e.key === 'Escape') {
                this.hideHelp();
                this.endTour();
            }
        });
        
        // Context help triggers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('help-trigger')) {
                e.preventDefault();
                const topic = e.target.dataset.helpTopic;
                this.showContextualHelp(topic, e.target);
            }
        });
    }

    /**
     * Initialize tooltips for help triggers
     */
    initializeTooltips() {
        // Add help triggers to key elements
        const helpTriggers = [
            { selector: '#file-upload', topic: 'dataUpload', text: 'Need help with file upload?' },
            { selector: '.filter-panel', topic: 'dataAnalysis', text: 'Learn about filtering data' },
            { selector: '.raises-container', topic: 'raisePlanning', text: 'Get help with raise planning' },
            { selector: '.analytics-dashboard', topic: 'analytics', text: 'Understand analytics features' },
            { selector: '.export-interface', topic: 'export', text: 'Learn about export options' }
        ];
        
        helpTriggers.forEach(trigger => {
            const element = document.querySelector(trigger.selector);
            if (element && !element.querySelector('.help-trigger')) {
                const helpIcon = document.createElement('span');
                helpIcon.className = 'help-trigger';
                helpIcon.innerHTML = '?';
                helpIcon.dataset.helpTopic = trigger.topic;
                helpIcon.title = trigger.text;
                helpIcon.style.cssText = `
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #667eea;
                    color: white;
                    text-align: center;
                    line-height: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-left: 0.5rem;
                    opacity: 0.7;
                    transition: opacity 0.2s ease;
                `;
                
                helpIcon.addEventListener('mouseenter', () => helpIcon.style.opacity = '1');
                helpIcon.addEventListener('mouseleave', () => helpIcon.style.opacity = '0.7');
                
                element.appendChild(helpIcon);
            }
        });
    }

    /**
     * Show help modal
     */
    showHelp() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide help modal
     */
    hideHelp() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Show specific help category
     */
    showHelpCategory(categoryKey) {
        const category = this.helpData[categoryKey];
        if (!category) return;
        
        const contentArea = document.getElementById('help-content-area');
        if (!contentArea) return;
        
        contentArea.innerHTML = `
            <div class="help-category">
                <div class="help-category-header">
                    <h1>${category.icon} ${category.title}</h1>
                </div>
                <div class="help-sections">
                    ${category.sections.map(section => `
                        <div class="help-section">
                            <h3>${section.title}</h3>
                            <div class="help-section-content">
                                ${section.content}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Search help content
     */
    searchHelp(query) {
        if (!query.trim()) {
            this.showHelpCategory('gettingStarted');
            return;
        }
        
        const results = this.searchIndex.filter(item => 
            item.keywords.includes(query.toLowerCase())
        ).slice(0, 10);
        
        const contentArea = document.getElementById('help-content-area');
        if (!contentArea) return;
        
        if (results.length === 0) {
            contentArea.innerHTML = `
                <div class="help-search-results">
                    <h2>🔍 Search Results</h2>
                    <p>No results found for "${query}". Try different keywords or browse the categories.</p>
                </div>
            `;
            return;
        }
        
        contentArea.innerHTML = `
            <div class="help-search-results">
                <h2>🔍 Search Results for "${query}"</h2>
                <div class="search-results-list">
                    ${results.map(result => `
                        <div class="search-result-item" data-category="${result.category}" data-section="${result.sectionIndex}">
                            <h4>${result.categoryTitle} - ${result.title}</h4>
                            <p>${result.content.substring(0, 200)}...</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add click handlers for search results
        contentArea.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                this.showHelpCategory(category);
                
                // Update navigation
                const navItems = document.querySelectorAll('.help-nav-item');
                navItems.forEach(nav => nav.classList.remove('active'));
                const targetNav = document.querySelector(`[data-category="${category}"]`);
                if (targetNav) targetNav.classList.add('active');
            });
        });
    }

    /**
     * Show contextual help
     */
    showContextualHelp(topic, element) {
        this.showHelp();
        this.showHelpCategory(topic);
        
        // Update navigation
        const navItems = document.querySelectorAll('.help-nav-item');
        navItems.forEach(nav => nav.classList.remove('active'));
        const targetNav = document.querySelector(`[data-category="${topic}"]`);
        if (targetNav) targetNav.classList.add('active');
    }

    /**
     * Start guided tour
     */
    startGuidedTour() {
        const tourSteps = [
            {
                target: '#file-upload',
                title: 'Welcome to Team Analyzer!',
                content: 'Let\'s start by uploading your employee data. Click "Choose File" to select a CSV file.',
                position: 'bottom'
            },
            {
                target: '.tabs-nav',
                title: 'Navigation Tabs',
                content: 'Use these tabs to navigate between different features: Table, Raises, Analytics, and Export.',
                position: 'bottom'
            },
            {
                target: '.search-bar',
                title: 'Search and Filter',
                content: 'Once you have data loaded, use the search bar and filters to find specific employees.',
                position: 'bottom'
            },
            {
                target: '.raises-container',
                title: 'Raise Planning',
                content: 'Plan salary raises using scenario modeling, budget planning, and recommendations.',
                position: 'top'
            },
            {
                target: '.analytics-dashboard',
                title: 'Analytics Dashboard',
                content: 'View team insights, salary distributions, and performance analytics.',
                position: 'top'
            },
            {
                target: '#help-button',
                title: 'Need Help?',
                content: 'Click this help button anytime or press "?" to access documentation and tutorials.',
                position: 'left'
            }
        ];
        
        this.runTour(tourSteps);
    }

    /**
     * Run guided tour
     */
    runTour(steps) {
        if (steps.length === 0) {
            this.endTour();
            return;
        }
        
        const step = steps[0];
        const target = document.querySelector(step.target);
        
        if (!target) {
            // Skip this step if target doesn't exist
            this.runTour(steps.slice(1));
            return;
        }
        
        this.showTourStep(step, target, () => {
            this.runTour(steps.slice(1));
        });
    }

    /**
     * Show tour step
     */
    showTourStep(step, target, onNext) {
        const overlay = document.getElementById('tour-overlay');
        const tooltip = overlay.querySelector('.tour-tooltip');
        
        if (!overlay || !tooltip) return;
        
        // Position tooltip
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (step.position) {
            case 'top':
                top = rect.top - tooltipRect.height - 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 20;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 20;
                break;
            default:
                top = rect.bottom + 20;
                left = rect.left;
        }
        
        // Ensure tooltip stays within viewport
        top = Math.max(20, Math.min(top, window.innerHeight - tooltipRect.height - 20));
        left = Math.max(20, Math.min(left, window.innerWidth - tooltipRect.width - 20));
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        
        tooltip.innerHTML = `
            <div class="tour-step">
                <h3>${step.title}</h3>
                <p>${step.content}</p>
                <div class="tour-actions">
                    <button class="btn btn-secondary tour-skip">Skip Tour</button>
                    <button class="btn btn-primary tour-next">Next</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        tooltip.querySelector('.tour-next').addEventListener('click', onNext);
        tooltip.querySelector('.tour-skip').addEventListener('click', () => this.endTour());
        
        // Highlight target element
        target.style.position = 'relative';
        target.style.zIndex = '15002';
        target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.5)';
        
        overlay.style.display = 'block';
        this.currentTour = { target, originalStyles: target.style.cssText };
    }

    /**
     * End tour
     */
    endTour() {
        const overlay = document.getElementById('tour-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        if (this.currentTour && this.currentTour.target) {
            this.currentTour.target.style.cssText = this.currentTour.originalStyles;
        }
        
        this.currentTour = null;
    }

    /**
     * Get help system status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            categoriesCount: Object.keys(this.helpData).length,
            searchIndexSize: this.searchIndex.length,
            currentTour: this.currentTour ? 'active' : 'none'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HelpSystem;
} else {
    window.HelpSystem = HelpSystem;
} 