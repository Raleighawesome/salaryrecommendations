/**
 * Team Analyzer - Main Application Entry Point
 * 
 * This file initializes the application and handles core functionality
 * including tab navigation and application state management.
 */

// Application state
const AppState = {
    currentTab: 'table',
    employeeData: null,
    uploadedFile: null,
    fileUpload: null,
    duplicateResults: null,
    dataValidator: null,
    performanceSuggestions: null,
    performanceSuggester: null,
    currencyUtils: null,
    currencyAnalysis: null,
    raiseSettings: {
        performanceWeight: 0.4,
        timeInRoleWeight: 0.3,
        timeSinceRaiseWeight: 0.2,
        comparatioWeight: 0.1,
        budgetPercentage: 3.0
    },
    isLoading: false
};

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Team Analyzer initializing...');
    
    // Initialize browser compatibility system first
    if (window.BrowserCompatibility) {
        window.browserCompatibility = new BrowserCompatibility();
        console.log('Browser compatibility system initialized');
        
        // Log compatibility report
        const report = window.browserCompatibility.getCompatibilityReport();
        console.log('Browser compatibility report:', report);
        
        // Show warning if browser is not fully supported
        if (!window.browserCompatibility.isFullySupported()) {
            console.warn('Browser may have limited functionality');
        }
    }
    
    // Initialize tab navigation
    initializeTabNavigation();
    
    // Initialize notification system
    initializeNotifications();
    
    // Initialize file upload component
    initializeFileUpload();
    
    // Initialize data table component
    initializeDataTable();
    
    // Initialize raise components
    initializeRaiseComponents();
    
    // Initialize analytics dashboard
    initializeAnalyticsDashboard();
    
    // Initialize visualizations
    initializeVisualizations();
    
    // Initialize export interface
    initializeExportInterface();
    
    // Initialize help system
    if (window.HelpSystem) {
        window.helpSystem = new HelpSystem();
        console.log('Help system initialized');
    }
    
    // Initialize testing framework
    if (window.TestingFramework) {
        window.testingFramework = new TestingFramework();
        console.log('Testing framework initialized');
        
        // Add testing button for development/QA
        const testButton = document.createElement('button');
        testButton.id = 'test-button';
        testButton.innerHTML = '🧪';
        testButton.title = 'Run Quality Assurance Tests';
        testButton.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 8rem;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #28a745;
            color: white;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        `;
        testButton.addEventListener('click', () => {
            console.log('Starting quality assurance tests...');
            window.testingFramework.runAllTests();
        });
        document.body.appendChild(testButton);
    }
    
    // Show initial upload section
    showUploadSection();
    
    console.log('Team Analyzer initialized successfully');
    
    // Enhanced error handling and notifications are already initialized via their scripts
    // Update global error handler to use the enhanced system
    window.handleError = (error, context, options) => {
        return window.errorHandler.handleError(error, context, options);
    };
});

/**
 * Setup the raises tab with scenario modeling and budget tools
 */
function setupRaisesTab() {
    const raisesTab = document.getElementById('raises-tab');
    if (!raisesTab) return;
    
    raisesTab.innerHTML = `
        <div class="raises-container">
            <div class="raises-header">
                <h2>Salary Raise Planning</h2>
                <p>Plan and model different raise scenarios for your team</p>
            </div>
            
            <div class="raises-tabs">
                <nav class="sub-tabs-nav">
                    <button class="sub-tab-button active" data-subtab="scenarios">Scenario Modeling</button>
                    <button class="sub-tab-button" data-subtab="budget">Budget Planning</button>
                    <button class="sub-tab-button" data-subtab="recommendations">Recommendations</button>
                    <button class="sub-tab-button" data-subtab="approvals">Approvals</button>
                </nav>
                
                <div class="sub-tab-content">
                    <div id="scenarios-subtab" class="sub-tab-panel active">
                        <div id="scenario-modeler">
                            <!-- Scenario modeler will be rendered here -->
                        </div>
                    </div>
                    <div id="budget-subtab" class="sub-tab-panel">
                        <div id="budget-modeler">
                            <!-- Budget modeler will be rendered here -->
                        </div>
                    </div>
                    <div id="recommendations-subtab" class="sub-tab-panel">
                        <div id="raise-recommendations">
                            <!-- Raise recommendations will be rendered here -->
                        </div>
                    </div>
                    <div id="approvals-subtab" class="sub-tab-panel">
                        <div id="approval-workflow">
                            <!-- Approval workflow will be rendered here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize sub-tab navigation
    initializeSubTabNavigation();
}

/**
 * Initialize sub-tab navigation for raises tab
 */
function initializeSubTabNavigation() {
    const subTabButtons = document.querySelectorAll('.sub-tab-button');
    const subTabPanels = document.querySelectorAll('.sub-tab-panel');
    
    subTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSubTab = this.getAttribute('data-subtab');
            
            // Update sub-tab buttons
            subTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update sub-tab panels
            subTabPanels.forEach(panel => panel.classList.remove('active'));
            const targetPanel = document.getElementById(`${targetSubTab}-subtab`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
            
            console.log(`Switched to sub-tab: ${targetSubTab}`);
        });
    });
}

/**
 * Initialize tab navigation functionality
 */
function initializeTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

/**
 * Switch to a specific tab
 * @param {string} tabName - The name of the tab to switch to
 */
function switchTab(tabName) {
    // Update state
    AppState.currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        }
    });
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const targetPanel = document.getElementById(`${tabName}-tab`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    console.log(`Switched to tab: ${tabName}`);
}

/**
 * Show the upload section and hide analysis section
 */
function showUploadSection() {
    const uploadSection = document.getElementById('upload-section');
    const analysisSection = document.getElementById('analysis-section');
    
    if (uploadSection) uploadSection.classList.remove('hidden');
    if (analysisSection) analysisSection.classList.add('hidden');
}

/**
 * Show the analysis section and hide upload section
 */
function showAnalysisSection() {
    const uploadSection = document.getElementById('upload-section');
    const analysisSection = document.getElementById('analysis-section');
    
    if (uploadSection) uploadSection.classList.add('hidden');
    if (analysisSection) analysisSection.classList.remove('hidden');
}

/**
 * Initialize notification system
 */
function initializeNotifications() {
    // Create notifications container if it doesn't exist
    if (!document.getElementById('notifications')) {
        const notificationsContainer = document.createElement('div');
        notificationsContainer.id = 'notifications';
        notificationsContainer.className = 'notifications-container';
        document.body.appendChild(notificationsContainer);
    }
}

/**
 * Initialize file upload component
 */
function initializeFileUpload() {
    // Load FileUpload component script
    const script = document.createElement('script');
    script.src = 'src/components/FileUpload.js';
    script.onload = function() {
        // Initialize file upload component
        const fileUpload = new FileUpload('file-upload-container');
        
        // Set callback for when file is processed
        fileUpload.setOnFileProcessed(handleFileProcessed);
        
        // Store reference for later use
        AppState.fileUpload = fileUpload;
    };
    document.head.appendChild(script);
}

/**
 * Initialize raise components (scenario modeler, budget modeler, etc.)
 */
function initializeRaiseComponents() {
    // Load required scripts for raise components
    const scripts = [
        'src/utils/raiseCalculator.js',
        'src/components/ScenarioModeler.js',
        'src/components/BudgetModeler.js',
        'src/components/RaiseRecommendations.js',
        'src/components/ApprovalWorkflow.js'
    ];
    
    loadScriptsSequentially(scripts).then(() => {
        // Initialize scenario modeler (it finds its own container)
        const scenarioModeler = new ScenarioModeler();
        AppState.scenarioModeler = scenarioModeler;
        // Make it globally available for its HTML event handlers
        window.scenarioModeler = scenarioModeler;
        // Render the component
        scenarioModeler.render();
        
        // Initialize budget modeler with its container
        const budgetContainer = document.getElementById('budget-modeler');
        if (budgetContainer) {
            const budgetModeler = new BudgetModeler(budgetContainer);
            AppState.budgetModeler = budgetModeler;
        }
        
        // Initialize raise recommendations with its container
        const recommendationsContainer = document.getElementById('raise-recommendations');
        if (recommendationsContainer) {
            const raiseRecommendations = new RaiseRecommendations(recommendationsContainer);
            AppState.raiseRecommendations = raiseRecommendations;
        }
        
        // Initialize approval workflow with its container
        const approvalContainer = document.getElementById('approval-workflow');
        if (approvalContainer) {
            const approvalWorkflow = new ApprovalWorkflow(approvalContainer);
            AppState.approvalWorkflow = approvalWorkflow;
        }
        
        // Setup raises tab content
        setupRaisesTab();
        
        console.log('Raise components initialized successfully');
    }).catch(error => {
        console.error('Error loading raise components:', error);
        handleError(error, 'Raise Components Initialization');
    });
}

/**
 * Initialize analytics dashboard component
 */
function initializeAnalyticsDashboard() {
    // Load analytics dashboard script
    const script = document.createElement('script');
    script.src = 'src/components/AnalyticsDashboard.js';
    script.onload = () => {
        // Initialize analytics dashboard
        const insightsTab = document.getElementById('insights-tab');
        if (insightsTab) {
            const analyticsDashboard = new AnalyticsDashboard(insightsTab);
            AppState.analyticsDashboard = analyticsDashboard;
            console.log('Analytics dashboard initialized successfully');
        }
    };
    script.onerror = (error) => {
        console.error('Error loading analytics dashboard:', error);
        handleError(error, 'Analytics Dashboard Initialization');
    };
    document.head.appendChild(script);
}

/**
 * Initialize visualizations component
 */
function initializeVisualizations() {
    // Load visualization styles
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = 'src/styles/visualizations.css';
    document.head.appendChild(styleLink);
    
    // Load salary visualization script
    const script = document.createElement('script');
    script.src = 'src/components/SalaryVisualization.js';
    script.onload = () => {
        // Initialize salary visualization
        const visualizationsTab = document.getElementById('visualizations-tab');
        if (visualizationsTab) {
            const salaryVisualization = new SalaryVisualization(visualizationsTab);
            AppState.salaryVisualization = salaryVisualization;
            console.log('Salary visualization initialized successfully');
        }
    };
    script.onerror = (error) => {
        console.error('Error loading salary visualization:', error);
        handleError(error, 'Salary Visualization Initialization');
    };
    document.head.appendChild(script);
}

/**
 * Initialize export interface component
 */
function initializeExportInterface() {
    // Export interface is already loaded via script tag
    // Initialize export interface when tab is accessed
    const exportTab = document.getElementById('export-tab');
    if (exportTab) {
        // Create a simple data manager interface for the export component
        const dataManager = {
            getEmployees: () => AppState.employeeData || [],
            getRaiseRecommendations: () => {
                // Get recommendations from raise recommendations component
                if (AppState.raiseRecommendations && AppState.raiseRecommendations.getRecommendations) {
                    return AppState.raiseRecommendations.getRecommendations();
                }
                return [];
            },
            getBudgetAnalysis: () => {
                // Get budget analysis from budget modeler
                if (AppState.budgetModeler && AppState.budgetModeler.getBudgetAnalysis) {
                    return AppState.budgetModeler.getBudgetAnalysis();
                }
                return {};
            }
        };
        
        // Initialize export interface
        const exportInterface = new ExportInterface(exportTab, dataManager);
        AppState.exportInterface = exportInterface;
        console.log('Export interface initialized successfully');
    }
}

/**
 * Initialize data table component
 */
function initializeDataTable() {
    // Load required scripts for data table
    const scripts = [
        'src/utils/virtualScroll.js',
        'src/components/DataTable.js',
        'src/components/FilterPanel.js',
        'src/components/SearchBar.js',
        'src/components/DuplicateMerger.js',
        'src/components/PerformanceSuggester.js'
    ];
    
    loadScriptsSequentially(scripts).then(() => {
        // Initialize data table component
        const tableContainer = document.getElementById('data-table-container');
        if (tableContainer) {
            const dataTable = new DataTable(tableContainer, {
                itemHeight: 60,
                bufferSize: 10,
                sortable: true,
                selectable: true,
                showActions: true,
                onRowSelect: handleRowSelect,
                onRowEdit: handleRowEdit,
                onRowMerge: handleRowMerge,
                onSort: handleTableSort
            });
            
            // Store reference for later use
            AppState.dataTable = dataTable;
            
            // Show empty state initially
            dataTable.showEmptyState();
            
            // Initialize search bar
            const searchContainer = document.getElementById('search-bar-container');
            if (searchContainer) {
                const searchBar = new SearchBar(searchContainer, {
                    placeholder: 'Search employees by name or title...',
                    debounceDelay: 300,
                    onSearch: handleSearchChange,
                    onClear: handleSearchClear
                });
                
                // Store reference for later use
                AppState.searchBar = searchBar;
            }
            
            // Initialize filter panel
            const filterContainer = document.getElementById('filter-panel-container');
            if (filterContainer) {
                const filterPanel = new FilterPanel(filterContainer, {
                    onFiltersChange: handleFiltersChange
                });
                
                // Store reference for later use
                AppState.filterPanel = filterPanel;
            }
            
            // Initialize duplicate merger
            const duplicateMergerContainer = document.getElementById('duplicate-merger-container');
            if (duplicateMergerContainer) {
                const duplicateMerger = new DuplicateMerger(duplicateMergerContainer, {
                    onMergeComplete: handleMergeComplete,
                    onMergeCancel: handleMergeCancel
                });
                
                // Store reference for later use
                AppState.duplicateMerger = duplicateMerger;
            }
            
            // Initialize performance suggester
            const performanceSuggesterContainer = document.getElementById('performance-suggester-container');
            if (performanceSuggesterContainer) {
                const performanceSuggesterComponent = new PerformanceSuggester();
                performanceSuggesterComponent.init(
                    performanceSuggesterContainer,
                    [],
                    {
                        onApplied: handleSuggestionApplied,
                        onSkipped: handleSuggestionSkipped,
                        onCompleted: handleSuggestionsCompleted
                    }
                );
                
                // Store reference for later use
                AppState.performanceSuggesterComponent = performanceSuggesterComponent;
            }
        }
    }).catch(error => {
        console.error('Failed to load data table components:', error);
        handleError(error, 'Data Table Initialization');
    });
}

/**
 * Load scripts sequentially
 * @param {Array} scripts - Array of script URLs
 * @returns {Promise} Promise that resolves when all scripts are loaded
 */
function loadScriptsSequentially(scripts) {
    return scripts.reduce((promise, script) => {
        return promise.then(() => {
            return new Promise((resolve, reject) => {
                const scriptElement = document.createElement('script');
                scriptElement.src = script;
                scriptElement.onload = resolve;
                scriptElement.onerror = reject;
                document.head.appendChild(scriptElement);
            });
        });
    }, Promise.resolve());
}

/**
 * Handle processed file data
 * @param {File} file - The uploaded file
 * @param {string} content - File content
 */
async function handleFileProcessed(file, content) {
    console.log('File processed:', file.name);
    
    try {
        setLoading(true, 'Parsing CSV data...');
        
        // Load CSV parser if not already loaded
        if (!window.CSVParser) {
            await loadCSVParser();
        }
        
        // Parse CSV content with verbose error handling
        const parser = new CSVParser();
        let parsedData;
        try {
            parsedData = await parser.parseCSV(content);
        } catch (parseError) {
            const firstErrors = parser.parseErrors && parser.parseErrors.length > 0 ?
                ` Errors: ${parser.parseErrors.slice(0, 3).join('; ')}${parser.parseErrors.length > 3 ? '...' : ''}` : '';
            const message = `Failed to parse ${file.name}. ${parseError.message}.${firstErrors}`;
            showNotification(message, 'error', 10000);
            handleError(parseError, 'CSV Parsing', {
                category: 'file_processing',
                severity: 'high',
                showNotification: false,
                details: parser.parseErrors
            });
            return;
        }
        
        // Load data validator and detect duplicates
        if (!window.DataValidator) {
            await loadDataValidator();
        }
        
        setLoading(true, 'Detecting duplicates...');
        const validator = new DataValidator();
        const duplicateResults = validator.detectDuplicates(parsedData.employees);
        
        // Load performance suggester and generate suggestions
        if (!window.PerformanceSuggester) {
            await loadPerformanceSuggester();
        }
        
        setLoading(true, 'Generating performance suggestions...');
        const performanceSuggester = new PerformanceSuggester();
        const performanceSuggestions = performanceSuggester.generateSuggestions(parsedData.employees);
        
        // Load currency utilities for multi-currency support
        if (!window.CurrencyUtils) {
            await loadCurrencyUtils();
        }
        
        setLoading(true, 'Processing currency data...');
        const currencyUtils = new CurrencyUtils();
        const currencyAnalysis = analyzeCurrencyData(parsedData.employees, currencyUtils);
        
        // Enhanced data validation and integrity checking
        setLoading(true, 'Performing comprehensive data validation...');
        let dataIntegrityReport = null;
        if (window.DataIntegrityChecker) {
            const integrityChecker = new DataIntegrityChecker();
            dataIntegrityReport = integrityChecker.validateDataset(parsedData.employees);
            
            // Show validation results if there are issues
            if (dataIntegrityReport.summary.totalIssues > 0) {
                const criticalCount = dataIntegrityReport.summary.criticalIssues;
                const totalCount = dataIntegrityReport.summary.totalIssues;
                const grade = dataIntegrityReport.summary.dataQualityGrade;
                
                if (criticalCount > 0) {
                    window.notificationSystem.error(
                        `Data validation found ${criticalCount} critical issues that need attention (Quality Grade: ${grade})`,
                        {
                            persistent: true,
                            actions: [
                                {
                                    id: 'view_issues',
                                    label: 'View Issues',
                                    primary: true,
                                    callback: () => showDataValidationReport(dataIntegrityReport)
                                }
                            ]
                        }
                    );
                } else {
                    window.notificationSystem.warning(
                        `Data validation found ${totalCount} issues (Quality Grade: ${grade})`,
                        {
                            actions: [
                                {
                                    id: 'view_report',
                                    label: 'View Report',
                                    callback: () => showDataValidationReport(dataIntegrityReport)
                                }
                            ]
                        }
                    );
                }
            } else {
                window.notificationSystem.success(
                    `Data validation passed! Quality Grade: ${dataIntegrityReport.summary.dataQualityGrade}`,
                    { duration: 3000 }
                );
            }
        }
        
        // Store parsed data in app state
        AppState.uploadedFile = {
            name: file.name,
            size: file.size,
            content: content,
            uploadedAt: new Date()
        };
        
        AppState.employeeData = parsedData;
        AppState.duplicateResults = duplicateResults;
        AppState.dataValidator = validator;
        AppState.performanceSuggestions = performanceSuggestions;
        AppState.performanceSuggester = performanceSuggester;
        AppState.currencyUtils = currencyUtils;
        AppState.currencyAnalysis = currencyAnalysis;
        AppState.dataIntegrityReport = dataIntegrityReport;
        
        setLoading(false);
        
        // Show parsing results
        showParsingResults(parsedData.metadata, duplicateResults, performanceSuggestions, currencyAnalysis);
        
        // Update search bar, filter panel and data table with processed data
        if (AppState.searchBar) {
            AppState.searchBar.updateData(parsedData.employees);
        }
        
        if (AppState.filterPanel) {
            AppState.filterPanel.updateData(parsedData.employees);
        }
        
        if (AppState.dataTable) {
            AppState.dataTable.updateData(parsedData.employees);
        }
        
        // Update performance suggester with suggestions
        if (AppState.performanceSuggesterComponent && performanceSuggestions.length > 0) {
            AppState.performanceSuggesterComponent.updateSuggestions(performanceSuggestions);
        }
        
        // Initialize scenario modeler with employee data
        if (AppState.scenarioModeler) {
            const budgetConstraints = {
                totalBudget: calculateTotalBudget(parsedData.employees),
                maxRaisePercent: 12,
                vpApprovalThreshold: 12
            };
            AppState.scenarioModeler.initialize(parsedData.employees, budgetConstraints);
        }
        
        // Initialize other raise components with data
        if (AppState.budgetModeler) {
            AppState.budgetModeler.initialize(parsedData.employees);
        }
        
        if (AppState.raiseRecommendations) {
            AppState.raiseRecommendations.initialize(parsedData.employees);
        }
        
        if (AppState.approvalWorkflow) {
            AppState.approvalWorkflow.initialize(parsedData.employees);
        }
        
        // Initialize analytics dashboard with employee data
        if (AppState.analyticsDashboard) {
            AppState.analyticsDashboard.setEmployees(parsedData.employees);
        }
        
        // Initialize salary visualization with employee data
        if (AppState.salaryVisualization) {
            AppState.salaryVisualization.setEmployees(parsedData.employees);
        }
        
        // Show analysis section
        showAnalysisSection();
        
        // Switch to table tab to show data
        switchTab('table');
        
        showNotification(
            `Successfully parsed ${parsedData.employees.length} employees from ${file.name}`,
            'success'
        );
        
    } catch (error) {
        setLoading(false);
        console.error('Post-upload processing error:', {
            file: file ? file.name : 'unknown',
            message: error.message,
            stack: error.stack
        });

        showNotification(
            `Error processing ${file.name}: ${error.message}`,
            'error',
            10000
        );

        handleError(error, 'CSV Parsing', {
            category: 'file_processing',
            severity: 'high',
            details: {
                fileName: file ? file.name : 'unknown',
                stack: error.stack
            }
        });
    }
}

/**
 * Load CSV parser script
 * @returns {Promise} Promise that resolves when script is loaded
 */
function loadCSVParser() {
    return new Promise((resolve, reject) => {
        if (window.CSVParser) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'src/utils/csvParser.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Load data validator script
 * @returns {Promise} Promise that resolves when script is loaded
 */
function loadDataValidator() {
    return new Promise((resolve, reject) => {
        if (window.DataValidator) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'src/utils/dataValidator.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Load performance suggester script
 * @returns {Promise} Promise that resolves when script is loaded
 */
function loadPerformanceSuggester() {
    return new Promise((resolve, reject) => {
        if (window.PerformanceSuggester) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'src/utils/performanceSuggester.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Load currency utilities script
 * @returns {Promise} Promise that resolves when script is loaded
 */
function loadCurrencyUtils() {
    return new Promise((resolve, reject) => {
        if (window.CurrencyUtils) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'src/utils/currencyUtils.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Show parsing results to user
 * @param {Object} metadata - Parsing metadata
 * @param {Object} duplicateResults - Duplicate detection results
 * @param {Object} performanceSuggestions - Performance suggestion results
 * @param {Object} currencyAnalysis - Currency analysis results
 */
function showParsingResults(metadata, duplicateResults, performanceSuggestions, currencyAnalysis) {
    let message = `Parsed ${metadata.validEmployees} employees successfully`;
    
    if (metadata.warnings.length > 0) {
        message += ` with ${metadata.warnings.length} warnings`;
        console.warn('Parsing warnings:', metadata.warnings);
    }
    
    if (metadata.errors.length > 0) {
        message += ` and ${metadata.errors.length} errors`;
        console.error('Parsing errors:', metadata.errors);
        
        // Show detailed errors to user
        showNotification(
            `Some rows had issues: ${metadata.errors.slice(0, 3).join('; ')}${metadata.errors.length > 3 ? '...' : ''}`,
            'warning',
            10000
        );
    }
    
    // Show duplicate detection results
    if (duplicateResults.totalDuplicates > 0) {
        showNotification(
            `Found ${duplicateResults.totalDuplicates} potential duplicate groups affecting ${duplicateResults.affectedEmployees} employees. Click "Review Duplicates" to merge them.`,
            'warning',
            8000
        );
        console.log('Duplicate detection results:', duplicateResults);
        
        // Store duplicate results for merger
        AppState.duplicateResults = duplicateResults;
    } else {
        console.log('No duplicates detected');
    }
    
    // Show performance suggestion results
    if (performanceSuggestions.totalSuggestions > 0) {
        showNotification(
            `Generated ${performanceSuggestions.totalSuggestions} performance rating suggestions for employees with missing ratings. Click "Review Suggestions" to apply them.`,
            'success',
            8000
        );
        console.log('Performance suggestions:', performanceSuggestions);
        
        // Add a button to show performance suggestions
        setTimeout(() => {
            addPerformanceSuggestionButton();
        }, 1000);
    } else {
        console.log('All employees have performance ratings');
    }
    
    // Show currency analysis results
    if (currencyAnalysis.statistics.uniqueCurrencies > 1) {
        const currencyList = currencyAnalysis.statistics.currencyDistribution
            .map(c => `${c.currency} (${c.count})`)
            .join(', ');
        showNotification(
            `Multi-currency data detected: ${currencyList}. Salaries normalized to USD for comparison.`,
            'info',
            8000
        );
    }
    
    if (currencyAnalysis.validationResults.length > 0) {
        showNotification(
            `${currencyAnalysis.validationResults.length} salary amounts have validation warnings. Check the data table for details.`,
            'warning',
            6000
        );
    }
    
    console.log('Currency analysis:', currencyAnalysis);
}

/**
 * Handle row selection in data table
 * @param {Object} employee - Selected employee data
 * @param {number} index - Row index
 */
function handleRowSelect(employee, index) {
    console.log('Row selected:', employee.name, 'at index', index);
    // Future: Update selection-based UI elements
}

/**
 * Handle row edit action
 * @param {Object} employee - Employee to edit
 * @param {number} index - Row index
 */
function handleRowEdit(employee, index) {
    console.log('Edit employee:', employee.name);
    // Future: Open edit modal/form
    showNotification(`Edit functionality for ${employee.name} coming soon!`, 'info');
}

/**
 * Handle row merge action for duplicates
 * @param {Object} employee - Employee to merge
 * @param {number} index - Row index
 */
function handleRowMerge(employee, index) {
    console.log('Merge employee:', employee.name);
    // Future: Open merge interface
    showNotification(`Merge functionality for ${employee.name} coming soon!`, 'info');
}

/**
 * Handle table sorting
 * @param {string} column - Column being sorted
 * @param {string} direction - Sort direction ('asc' or 'desc')
 */
function handleTableSort(column, direction) {
    console.log(`Table sorted by ${column} ${direction}`);
    // Future: Update other UI elements based on sort
}

/**
 * Handle search changes from search bar
 * @param {string} searchTerm - Search term
 * @param {Array} searchResults - Search results
 */
function handleSearchChange(searchTerm, searchResults) {
    console.log(`Search performed: "${searchTerm}", ${searchResults.length} results`);
    
    // Update filter panel with search term to coordinate filtering
    if (AppState.filterPanel) {
        AppState.filterPanel.setSearchTerm(searchTerm);
    }
    
    // The filter panel will trigger handleFiltersChange which updates the data table
}

/**
 * Handle search clear from search bar
 */
function handleSearchClear() {
    console.log('Search cleared');
    
    // Clear search term in filter panel
    if (AppState.filterPanel) {
        AppState.filterPanel.setSearchTerm('');
    }
}

/**
 * Handle merge completion from duplicate merger
 * @param {Object} results - Merge results
 */
function handleMergeComplete(results) {
    console.log('Merge completed:', results);
    
    // Apply merge decisions to employee data
    if (results.decisions && results.decisions.length > 0) {
        const updatedData = applyMergeDecisions(AppState.employeeData, results.decisions);
        
        // Update all components with merged data
        AppState.employeeData = updatedData;
        
        if (AppState.searchBar) {
            AppState.searchBar.updateData(updatedData);
        }
        
        if (AppState.filterPanel) {
            AppState.filterPanel.updateData(updatedData);
        }
        
        if (AppState.dataTable) {
            AppState.dataTable.updateData(updatedData);
        }
        
        // Update analytics dashboard with merged data
        if (AppState.analyticsDashboard) {
            AppState.analyticsDashboard.setEmployees(updatedData);
        }
        
        // Update salary visualization with merged data
        if (AppState.salaryVisualization) {
            AppState.salaryVisualization.setEmployees(updatedData);
        }
        
        // Show success notification
        showNotification(
            `Merge completed: ${results.mergedGroups} groups merged, ${results.keptSeparate} kept separate`,
            'success',
            5000
        );
    }
}

/**
 * Handle merge cancellation from duplicate merger
 */
function handleMergeCancel() {
    console.log('Merge cancelled');
    // Duplicate merger is already hidden by the component
}

/**
 * Handle performance suggestion applied
 * @param {Object} suggestion - The applied suggestion
 * @param {string} rating - The applied rating
 */
function handleSuggestionApplied(suggestion, rating) {
    console.log('Performance suggestion applied:', suggestion.employee.name, rating);
    
    // Update the employee data in the table
    if (AppState.dataTable) {
        AppState.dataTable.updateData(AppState.employeeData.employees);
    }
    
    // Update filter panel if needed
    if (AppState.filterPanel) {
        AppState.filterPanel.updateData(AppState.employeeData.employees);
    }
}

/**
 * Handle performance suggestion skipped
 * @param {Object} suggestion - The skipped suggestion
 */
function handleSuggestionSkipped(suggestion) {
    console.log('Performance suggestion skipped:', suggestion.employee.name);
}

/**
 * Handle all performance suggestions completed
 */
function handleSuggestionsCompleted() {
    console.log('All performance suggestions completed');
    showNotification('Performance rating suggestions completed', 'success');
    
    // Hide the performance suggester container
    const container = document.getElementById('performance-suggester-container');
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Show performance suggester interface
 */
function showPerformanceSuggester() {
    const container = document.getElementById('performance-suggester-container');
    if (container && AppState.performanceSuggestions && AppState.performanceSuggestions.length > 0) {
        container.style.display = 'block';
        
        // Scroll to the suggester
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        showNotification(`${AppState.performanceSuggestions.length} performance rating suggestions available`, 'info');
    } else {
        showNotification('No performance rating suggestions available', 'warning');
    }
}

/**
 * Add performance suggestion button to the interface
 */
function addPerformanceSuggestionButton() {
    // Check if button already exists
    if (document.getElementById('performance-suggestion-btn')) {
        return;
    }
    
    // Find the data table container
    const tableContainer = document.getElementById('data-table-container');
    if (!tableContainer) {
        return;
    }
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 100;
    `;
    
    // Create the button
    const button = document.createElement('button');
    button.id = 'performance-suggestion-btn';
    button.className = 'btn btn-primary';
    button.innerHTML = `
        📊 Review Suggestions (${AppState.performanceSuggestions.length})
    `;
    button.style.cssText = `
        background: #3b82f6;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
    `;
    
    // Add hover effect
    button.addEventListener('mouseenter', () => {
        button.style.background = '#2563eb';
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.background = '#3b82f6';
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    
    // Add click handler
    button.addEventListener('click', () => {
        showPerformanceSuggester();
        // Hide the button after clicking
        buttonContainer.style.display = 'none';
    });
    
    buttonContainer.appendChild(button);
    tableContainer.style.position = 'relative';
    tableContainer.appendChild(buttonContainer);
}

/**
 * Apply merge decisions to employee data
 * @param {Array} employeeData - Original employee data
 * @param {Array} decisions - Merge decisions
 * @returns {Array} Updated employee data
 */
function applyMergeDecisions(employeeData, decisions) {
    let updatedData = [...employeeData];
    
    // Process decisions in reverse order to maintain indices
    decisions.sort((a, b) => b.groupIndex - a.groupIndex);
    
    decisions.forEach(decision => {
        if (decision.action === 'merge') {
            // Remove original records and add merged record
            const originalIds = decision.originalRecords.map(record => record.id || record.name);
            
            // Remove original records
            updatedData = updatedData.filter(emp => 
                !originalIds.includes(emp.id || emp.name)
            );
            
            // Add merged record
            updatedData.push(decision.mergedRecord);
        } else if (decision.action === 'keep_separate') {
            // Mark records as not duplicates
            decision.records.forEach(record => {
                const index = updatedData.findIndex(emp => 
                    (emp.id && emp.id === record.id) || emp.name === record.name
                );
                if (index !== -1) {
                    updatedData[index].isDuplicate = false;
                }
            });
        }
    });
    
    return updatedData;
}

/**
 * Handle filter changes from filter panel
 * @param {Array} filteredData - Filtered employee data
 * @param {number} activeFilterCount - Number of active filters
 */
function handleFiltersChange(filteredData, activeFilterCount) {
    console.log(`Filters applied: ${activeFilterCount} active, ${filteredData.length} employees shown`);
    
    // Update data table with filtered data
    if (AppState.dataTable) {
        AppState.dataTable.applyFilters(filteredData);
    }
    
    // Show notification if significant filtering occurred
    if (activeFilterCount > 0 && AppState.employeeData) {
        const totalCount = AppState.employeeData.length;
        const filteredCount = filteredData.length;
        const percentage = Math.round((filteredCount / totalCount) * 100);
        
        if (percentage < 50) {
            showNotification(
                `Filters applied: Showing ${filteredCount} of ${totalCount} employees (${percentage}%)`,
                'info',
                3000
            );
        }
    }
}

/**
 * Calculate total budget for raises (typically 3-5% of total salary cost)
 * @param {Array} employees - Employee data
 * @returns {number} Total budget amount
 */
function calculateTotalBudget(employees) {
    const totalSalary = employees.reduce((sum, emp) => sum + (emp.currentSalary || 0), 0);
    // Default to 3% of total salary as budget
    return totalSalary * 0.03;
}

/**
 * Analyze currency data across employees
 * @param {Array} employees - Array of employees
 * @param {CurrencyUtils} currencyUtils - Currency utilities instance
 * @returns {Object} Currency analysis results
 */
function analyzeCurrencyData(employees, currencyUtils) {
    const currencyBreakdown = {};
    const salaries = [];
    const validationResults = [];

    // Analyze each employee's salary
    for (const employee of employees) {
        if (employee.salary && employee.salary.amount > 0) {
            const currency = employee.salary.currency;
            
            // Count currencies
            if (!currencyBreakdown[currency]) {
                currencyBreakdown[currency] = {
                    count: 0,
                    totalAmount: 0,
                    employees: []
                };
            }
            currencyBreakdown[currency].count++;
            currencyBreakdown[currency].totalAmount += employee.salary.amount;
            currencyBreakdown[currency].employees.push(employee.name);
            
            // Collect salary for normalization
            salaries.push({
                employeeId: employee.id,
                employeeName: employee.name,
                amount: employee.salary.amount,
                currency: currency,
                formatted: employee.salary.formatted
            });
            
            // Validate salary amount
            const validation = currencyUtils.validateSalaryAmount(employee.salary.amount, currency);
            if (!validation.isValid || validation.warnings.length > 0) {
                validationResults.push({
                    employeeId: employee.id,
                    employeeName: employee.name,
                    validation: validation
                });
            }
        }
    }

    // Normalize salaries to USD for comparison
    const normalizedSalaries = currencyUtils.normalizeSalaries(salaries, 'USD');
    
    // Calculate statistics
    const totalEmployeesWithSalary = salaries.length;
    const uniqueCurrencies = Object.keys(currencyBreakdown);
    const primaryCurrency = uniqueCurrencies.reduce((a, b) => 
        currencyBreakdown[a].count > currencyBreakdown[b].count ? a : b
    );

    return {
        currencyBreakdown: currencyBreakdown,
        normalizedSalaries: normalizedSalaries,
        validationResults: validationResults,
        statistics: {
            totalEmployeesWithSalary: totalEmployeesWithSalary,
            uniqueCurrencies: uniqueCurrencies.length,
            primaryCurrency: primaryCurrency,
            currencyDistribution: Object.entries(currencyBreakdown).map(([currency, data]) => ({
                currency: currency,
                count: data.count,
                percentage: Math.round((data.count / totalEmployeesWithSalary) * 100)
            }))
        },
        supportedCurrencies: currencyUtils.getSupportedCurrencies()
    };
}

/**
 * Show data validation report in a modal or dedicated interface
 * @param {Object} validationReport - The validation report from DataIntegrityChecker
 */
function showDataValidationReport(validationReport) {
    console.log('Data Validation Report:', validationReport);
    
    // Create a simple modal to display validation results
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    const summary = validationReport.summary;
    const quality = validationReport.dataQuality;
    
    modalContent.innerHTML = `
        <div class="validation-report">
            <div class="report-header">
                <h2>Data Validation Report</h2>
                <button class="close-btn" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                ">×</button>
            </div>
            
            <div class="report-summary" style="margin-bottom: 2rem;">
                <div class="quality-grade" style="
                    text-align: center;
                    padding: 1rem;
                    background: ${summary.dataQualityGrade.startsWith('A') ? '#d4edda' : 
                                summary.dataQualityGrade.startsWith('B') ? '#fff3cd' : '#f8d7da'};
                    border-radius: 8px;
                    margin-bottom: 1rem;
                ">
                    <h3>Data Quality Grade: ${summary.dataQualityGrade}</h3>
                    <p>Overall Score: ${(quality.overall * 100).toFixed(1)}%</p>
                </div>
                
                <div class="summary-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div class="stat-card" style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <h4>Total Issues</h4>
                        <p style="font-size: 1.5rem; font-weight: bold; color: ${summary.totalIssues > 0 ? '#dc3545' : '#28a745'};">
                            ${summary.totalIssues}
                        </p>
                    </div>
                    <div class="stat-card" style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <h4>Critical Issues</h4>
                        <p style="font-size: 1.5rem; font-weight: bold; color: ${summary.criticalIssues > 0 ? '#dc3545' : '#28a745'};">
                            ${summary.criticalIssues}
                        </p>
                    </div>
                    <div class="stat-card" style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <h4>Completeness</h4>
                        <p style="font-size: 1.5rem; font-weight: bold;">
                            ${(quality.completeness.score * 100).toFixed(1)}%
                        </p>
                    </div>
                    <div class="stat-card" style="padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                        <h4>Consistency</h4>
                        <p style="font-size: 1.5rem; font-weight: bold;">
                            ${(quality.consistency.score * 100).toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>
            
            ${summary.recommendations.length > 0 ? `
                <div class="recommendations" style="margin-bottom: 2rem;">
                    <h3>Top Recommendations</h3>
                    <ul style="list-style-type: none; padding: 0;">
                        ${summary.recommendations.map(rec => `
                            <li style="
                                padding: 0.75rem;
                                margin-bottom: 0.5rem;
                                background: #e3f2fd;
                                border-left: 4px solid #2196f3;
                                border-radius: 4px;
                            ">${rec}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="detailed-issues">
                <h3>Detailed Issues</h3>
                ${Object.entries(validationReport.fieldValidation).map(([field, result]) => {
                    if (result.issues.length === 0) return '';
                    return `
                        <div class="field-issues" style="margin-bottom: 1rem;">
                            <h4>${field} (${result.issues.length} issues)</h4>
                            <div class="issues-list" style="max-height: 200px; overflow-y: auto;">
                                ${result.issues.slice(0, 10).map(issue => `
                                    <div class="issue-item" style="
                                        padding: 0.5rem;
                                        margin-bottom: 0.25rem;
                                        background: ${issue.severity === 'critical' ? '#f8d7da' : 
                                                    issue.severity === 'high' ? '#fff3cd' : '#d1ecf1'};
                                        border-radius: 4px;
                                        font-size: 0.9rem;
                                    ">
                                        <strong>${issue.employeeName}:</strong> ${issue.message}
                                        ${issue.severity === 'critical' ? ' <span style="color: #721c24; font-weight: bold;">(CRITICAL)</span>' : ''}
                                    </div>
                                `).join('')}
                                ${result.issues.length > 10 ? `
                                    <p style="text-align: center; color: #6c757d; font-style: italic;">
                                        ... and ${result.issues.length - 10} more issues
                                    </p>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="report-actions" style="text-align: center; margin-top: 2rem;">
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close Report</button>
            </div>
        </div>
    `;
    
    modal.appendChild(modalContent);
    
    // Add close functionality
    const closeBtn = modalContent.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => modal.remove());
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
}

/**
 * Show a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'warning')
 * @param {number} duration - How long to show the notification (ms)
 */
function showNotification(message, type = 'success', duration = 5000) {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationsContainer.appendChild(notification);
    
    // Auto-remove notification after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, duration);
    
    console.log(`Notification (${type}): ${message}`);
}

/**
 * Show/hide loading overlay
 * @param {boolean} show - Whether to show or hide the loading overlay
 * @param {string} message - Optional loading message
 */
function setLoading(show, message = 'Processing your data...') {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.querySelector('.loading-text');
    
    if (!loadingOverlay) return;
    
    AppState.isLoading = show;
    
    if (show) {
        if (loadingText) loadingText.textContent = message;
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

/**
 * Handle errors gracefully with user-friendly messages
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {Object} options - Additional error handling options
 */
function handleError(error, context = 'Application', options = {}) {
    // Hide loading if active
    setLoading(false);
    
    // Use enhanced error handler if available, otherwise fallback to basic handling
    if (window.errorHandler) {
        return window.errorHandler.handleError(error, context, options);
    } else {
        // Fallback to basic error handling
        console.error(`${context} Error:`, error);
        const userMessage = getUserFriendlyErrorMessage(error, context);
        showNotification(userMessage, 'error', 8000);
    }
}

/**
 * Convert technical errors to user-friendly messages
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @returns {string} User-friendly error message
 */
function getUserFriendlyErrorMessage(error, context) {
    // Common error patterns and their user-friendly messages
    const errorPatterns = {
        'CSV': 'There was an issue processing your CSV file. Please check the format and try again.',
        'File': 'Unable to read the uploaded file. Please ensure it\'s a valid CSV file.',
        'Memory': 'The file is too large to process. Please try with a smaller dataset.',
        'Network': 'Connection issue detected. Please check your internet connection.',
        'Permission': 'Permission denied. Please check file access permissions.'
    };
    
    // Check for known error patterns
    for (const [pattern, message] of Object.entries(errorPatterns)) {
        if (error.message.includes(pattern) || context.includes(pattern)) {
            return message;
        }
    }
    
    // Default fallback message
    return `An unexpected error occurred in ${context}. Please try again or contact support if the issue persists.`;
}

// Export functions for use in other modules
window.TeamAnalyzer = {
    AppState,
    switchTab,
    showUploadSection,
    showAnalysisSection,
    showNotification,
    setLoading,
    handleError
}; 