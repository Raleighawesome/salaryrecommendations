/**
 * Export Interface Component
 * 
 * Provides a user-friendly interface for exporting team data and reports
 * in various formats including Google Sheets, CSV, and PDF.
 * 
 * Features:
 * - Multiple export format options
 * - Template selection for different report types
 * - Google Sheets integration setup
 * - Export progress tracking
 * - Batch export capabilities
 */

class ExportInterface {
    constructor(container, dataManager) {
        this.container = container;
        this.dataManager = dataManager;
        this.isGoogleSheetsConfigured = false;
        
        try {
            this.exportManager = new ExportManager();
            this.init();
        } catch (error) {
            console.error('Error initializing ExportInterface:', error);
            this.showErrorState('Failed to initialize export functionality. Please refresh the page.');
        }
    }

    init() {
        this.render();
        this.attachEventListeners();
    }
    
    showErrorState(message) {
        this.container.innerHTML = `
            <div class="export-error-state">
                <div class="error-icon">⚠️</div>
                <h3>Export Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Reload Page</button>
            </div>
        `;
    }

    render() {
        this.container.innerHTML = `
            <div class="export-interface">
                <div class="export-header">
                    <h3>Export Data & Reports</h3>
                    <p>Export your team data and analysis reports in various formats</p>
                </div>

                <!-- Google Sheets Configuration -->
                <div class="export-section">
                    <h4>Google Sheets Integration</h4>
                    <div class="google-sheets-config">
                        <div class="config-status ${this.isGoogleSheetsConfigured ? 'configured' : 'not-configured'}">
                            <span class="status-icon">${this.isGoogleSheetsConfigured ? '✓' : '⚠'}</span>
                            <span class="status-text">
                                ${this.isGoogleSheetsConfigured ? 'Google Sheets Ready' : 'Google Sheets Not Configured'}
                            </span>
                        </div>
                        ${!this.isGoogleSheetsConfigured ? `
                            <div class="config-form">
                                <div class="form-group">
                                    <label for="google-api-key">Google API Key:</label>
                                    <input type="password" id="google-api-key" placeholder="Enter your Google API key">
                                </div>
                                <div class="form-group">
                                    <label for="google-client-id">Google Client ID:</label>
                                    <input type="text" id="google-client-id" placeholder="Enter your Google Client ID">
                                </div>
                                <button id="configure-google-sheets" class="btn btn-primary">Configure Google Sheets</button>
                                <div class="help-text">
                                    <a href="#" id="google-setup-help">How to get Google API credentials</a>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Export Templates -->
                <div class="export-section">
                    <h4>Select Report Type</h4>
                    <div class="template-grid">
                        <div class="template-card" data-template="employee_data">
                            <div class="template-icon">👥</div>
                            <h5>Employee Data</h5>
                            <p>Complete employee information with salaries and performance ratings</p>
                        </div>
                        <div class="template-card" data-template="salary_analysis">
                            <div class="template-icon">💰</div>
                            <h5>Salary Analysis</h5>
                            <p>Salary distribution, equity analysis, and compensation insights</p>
                        </div>
                        <div class="template-card" data-template="raise_recommendations">
                            <div class="template-icon">📈</div>
                            <h5>Raise Recommendations</h5>
                            <p>Recommended salary adjustments with justifications and budget impact</p>
                        </div>
                        <div class="template-card" data-template="budget_analysis">
                            <div class="template-icon">📊</div>
                            <h5>Budget Analysis</h5>
                            <p>Budget allocation, cost analysis, and financial projections</p>
                        </div>
                        <div class="template-card" data-template="risk_assessment">
                            <div class="template-icon">⚠️</div>
                            <h5>Risk Assessment</h5>
                            <p>Flight risk analysis, retention insights, and mitigation strategies</p>
                        </div>
                        <div class="template-card" data-template="comprehensive_report">
                            <div class="template-icon">📋</div>
                            <h5>Comprehensive Report</h5>
                            <p>Complete analysis including all data, insights, and recommendations</p>
                        </div>
                    </div>
                </div>

                <!-- Export Format Selection -->
                <div class="export-section">
                    <h4>Export Format</h4>
                    <div class="format-options">
                        <label class="format-option">
                            <input type="radio" name="export-format" value="csv" checked>
                            <div class="format-card">
                                <div class="format-icon">📄</div>
                                <span class="format-name">CSV</span>
                                <span class="format-desc">Excel-compatible spreadsheet</span>
                            </div>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="export-format" value="google_sheets">
                            <div class="format-card">
                                <div class="format-icon">📊</div>
                                <span class="format-name">Google Sheets</span>
                                <span class="format-desc">Online collaborative spreadsheet</span>
                            </div>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="export-format" value="pdf">
                            <div class="format-card">
                                <div class="format-icon">📑</div>
                                <span class="format-name">PDF Report</span>
                                <span class="format-desc">Formatted document for sharing</span>
                            </div>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="export-format" value="excel">
                            <div class="format-card">
                                <div class="format-icon">📈</div>
                                <span class="format-name">Excel</span>
                                <span class="format-desc">Microsoft Excel workbook</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Export Options -->
                <div class="export-section">
                    <h4>Export Options</h4>
                    <div class="export-options">
                        <label class="checkbox-option">
                            <input type="checkbox" id="include-charts" checked>
                            <span>Include charts and visualizations</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" id="include-sensitive" checked>
                            <span>Include sensitive salary data</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" id="include-recommendations">
                            <span>Include raise recommendations</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" id="anonymize-data">
                            <span>Anonymize employee names</span>
                        </label>
                    </div>
                </div>

                <!-- Export Actions -->
                <div class="export-section">
                    <div class="export-actions">
                        <button id="preview-export" class="btn btn-secondary">Preview Export</button>
                        <button id="start-export" class="btn btn-primary" disabled>Export Selected Data</button>
                    </div>
                </div>

                <!-- Export Progress -->
                <div id="export-progress" class="export-progress hidden">
                    <div class="progress-header">
                        <h4>Exporting...</h4>
                        <span id="progress-percentage">0%</span>
                    </div>
                    <div class="progress-bar">
                        <div id="progress-fill" class="progress-fill"></div>
                    </div>
                    <div id="progress-status" class="progress-status">Preparing export...</div>
                </div>

                <!-- Export Results -->
                <div id="export-results" class="export-results hidden">
                    <div class="results-header">
                        <h4>Export Complete</h4>
                    </div>
                    <div id="results-content" class="results-content">
                        <!-- Results will be populated here -->
                    </div>
                </div>

                <!-- Help Section -->
                <div class="export-section">
                    <details class="help-section">
                        <summary>Export Help & Tips</summary>
                        <div class="help-content">
                            <h5>Export Formats:</h5>
                            <ul>
                                <li><strong>CSV:</strong> Best for importing into Excel or other spreadsheet applications</li>
                                <li><strong>Google Sheets:</strong> Creates a new Google Sheets document for online collaboration</li>
                                <li><strong>PDF:</strong> Professional formatted report for presentations and sharing</li>
                                <li><strong>Excel:</strong> Native Excel format with multiple worksheets and formatting</li>
                            </ul>
                            
                            <h5>Google Sheets Setup:</h5>
                            <p>To export to Google Sheets, you need to configure Google API credentials:</p>
                            <ol>
                                <li>Go to the <a href="https://console.developers.google.com/" target="_blank">Google Cloud Console</a></li>
                                <li>Create a new project or select an existing one</li>
                                <li>Enable the Google Sheets API</li>
                                <li>Create credentials (API key and OAuth 2.0 client ID)</li>
                                <li>Enter the credentials above to enable Google Sheets export</li>
                            </ol>
                            
                            <h5>Data Privacy:</h5>
                            <p>All exports are processed locally in your browser. No data is sent to external servers except when using Google Sheets (which requires Google's servers).</p>
                        </div>
                    </details>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Google Sheets configuration
        const configureBtn = this.container.querySelector('#configure-google-sheets');
        if (configureBtn) {
            configureBtn.addEventListener('click', () => this.configureGoogleSheets());
        }

        // Template selection
        const templateCards = this.container.querySelectorAll('.template-card');
        templateCards.forEach(card => {
            card.addEventListener('click', () => this.selectTemplate(card));
        });

        // Format selection
        const formatOptions = this.container.querySelectorAll('input[name="export-format"]');
        formatOptions.forEach(option => {
            option.addEventListener('change', () => this.updateExportButton());
        });

        // Export actions
        const previewBtn = this.container.querySelector('#preview-export');
        const exportBtn = this.container.querySelector('#start-export');
        
        previewBtn.addEventListener('click', () => this.previewExport());
        exportBtn.addEventListener('click', () => this.startExport());

        // Help link
        const helpLink = this.container.querySelector('#google-setup-help');
        if (helpLink) {
            helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showGoogleSetupHelp();
            });
        }

        // Initial state
        this.updateExportButton();
    }

    async configureGoogleSheets() {
        const apiKey = this.container.querySelector('#google-api-key').value.trim();
        const clientId = this.container.querySelector('#google-client-id').value.trim();

        if (!apiKey || !clientId) {
            this.showNotification('Please enter both API key and Client ID', 'error');
            return;
        }

        try {
            this.showNotification('Configuring Google Sheets...', 'info');
            const success = await this.exportManager.initializeGoogleSheets(apiKey, clientId);
            
            if (success) {
                this.isGoogleSheetsConfigured = true;
                this.showNotification('Google Sheets configured successfully!', 'success');
                this.render(); // Re-render to update UI
            } else {
                this.showNotification('Failed to configure Google Sheets. Please check your credentials.', 'error');
            }
        } catch (error) {
            console.error('Google Sheets configuration error:', error);
            this.showNotification('Error configuring Google Sheets: ' + error.message, 'error');
        }
    }

    selectTemplate(selectedCard) {
        // Remove active class from all cards
        this.container.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Add active class to selected card
        selectedCard.classList.add('active');
        
        this.updateExportButton();
    }

    updateExportButton() {
        const selectedTemplate = this.container.querySelector('.template-card.active');
        const selectedFormat = this.container.querySelector('input[name="export-format"]:checked');
        const exportBtn = this.container.querySelector('#start-export');
        
        const canExport = selectedTemplate && selectedFormat && 
                         (selectedFormat.value !== 'google_sheets' || this.isGoogleSheetsConfigured);
        
        exportBtn.disabled = !canExport;
        
        if (selectedFormat && selectedFormat.value === 'google_sheets' && !this.isGoogleSheetsConfigured) {
            exportBtn.textContent = 'Configure Google Sheets First';
        } else {
            exportBtn.textContent = 'Export Selected Data';
        }
    }

    previewExport() {
        const selectedTemplate = this.container.querySelector('.template-card.active');
        if (!selectedTemplate) {
            this.showNotification('Please select a report type first', 'warning');
            return;
        }

        const template = selectedTemplate.dataset.template;
        const data = this.prepareExportData(template);
        
        // Show preview modal or section
        this.showExportPreview(data, template);
    }

    async startExport() {
        const selectedTemplate = this.container.querySelector('.template-card.active');
        const selectedFormat = this.container.querySelector('input[name="export-format"]:checked');
        
        if (!selectedTemplate || !selectedFormat) {
            this.showNotification('Please select both a report type and export format', 'warning');
            return;
        }

        const template = selectedTemplate.dataset.template;
        const format = selectedFormat.value;
        const options = this.getExportOptions();

        try {
            this.showExportProgress();
            const data = this.prepareExportData(template);
            
            const result = await this.exportManager.exportData(data, format, template, options);
            this.showExportResults(result);
            
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Export failed: ' + error.message, 'error');
            this.hideExportProgress();
        }
    }

    prepareExportData(template) {
        // Get current data from the data manager
        const employees = this.dataManager.getEmployees();
        const raiseRecommendations = this.dataManager.getRaiseRecommendations();
        const budgetAnalysis = this.dataManager.getBudgetAnalysis();
        
        return {
            employees,
            raiseRecommendations,
            budgetAnalysis,
            metadata: {
                exportDate: new Date().toISOString(),
                totalEmployees: employees.length,
                template: template
            }
        };
    }

    getExportOptions() {
        return {
            includeCharts: this.container.querySelector('#include-charts').checked,
            includeSensitive: this.container.querySelector('#include-sensitive').checked,
            includeRecommendations: this.container.querySelector('#include-recommendations').checked,
            anonymizeData: this.container.querySelector('#anonymize-data').checked
        };
    }

    showExportProgress() {
        const progressSection = this.container.querySelector('#export-progress');
        const resultsSection = this.container.querySelector('#export-results');
        
        progressSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        
        // Start progress monitoring
        this.monitorExportProgress();
    }

    hideExportProgress() {
        const progressSection = this.container.querySelector('#export-progress');
        progressSection.classList.add('hidden');
    }

    monitorExportProgress() {
        // This would be enhanced to track actual progress from ExportManager
        let progress = 0;
        const progressFill = this.container.querySelector('#progress-fill');
        const progressPercentage = this.container.querySelector('#progress-percentage');
        const progressStatus = this.container.querySelector('#progress-status');
        
        const interval = setInterval(() => {
            progress += 10;
            progressFill.style.width = progress + '%';
            progressPercentage.textContent = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                progressStatus.textContent = 'Export complete!';
            }
        }, 200);
    }

    showExportResults(result) {
        this.hideExportProgress();
        
        const resultsSection = this.container.querySelector('#export-results');
        const resultsContent = this.container.querySelector('#results-content');
        
        let resultHTML = '';
        
        if (result.format === 'Google Sheets') {
            resultHTML = `
                <div class="result-item">
                    <div class="result-icon">✅</div>
                    <div class="result-details">
                        <h5>Google Sheets Created Successfully</h5>
                        <p>Your data has been exported to a new Google Sheets document.</p>
                        <a href="${result.url}" target="_blank" class="btn btn-primary">Open Google Sheets</a>
                    </div>
                </div>
            `;
        } else {
            resultHTML = `
                <div class="result-item">
                    <div class="result-icon">✅</div>
                    <div class="result-details">
                        <h5>File Downloaded Successfully</h5>
                        <p>Your ${result.format} file "${result.filename}" has been downloaded.</p>
                        <p class="file-info">Check your Downloads folder for the exported file.</p>
                    </div>
                </div>
            `;
        }
        
        resultsContent.innerHTML = resultHTML;
        resultsSection.classList.remove('hidden');
        
        this.showNotification(`Export completed successfully as ${result.format}`, 'success');
    }

    showExportPreview(data, template) {
        // Create a preview modal or expand a preview section
        // This would show a sample of the data that will be exported
        console.log('Preview data for template:', template, data);
        this.showNotification('Export preview feature coming soon', 'info');
    }

    showGoogleSetupHelp() {
        // Show detailed help for Google API setup
        this.showNotification('Opening Google Cloud Console setup guide...', 'info');
        window.open('https://console.developers.google.com/', '_blank');
    }

    showNotification(message, type = 'info') {
        // Use the global notification system
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportInterface;
} else {
    window.ExportInterface = ExportInterface;
}