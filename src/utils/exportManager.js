/**
 * Export Manager
 * 
 * Comprehensive export system for Team Analyzer data and reports.
 * Supports multiple export formats including Google Sheets, CSV, and PDF.
 * 
 * Features:
 * - Google Sheets integration
 * - CSV export with custom formatting
 * - PDF report generation
 * - Excel-compatible formats
 * - Batch export capabilities
 * - Export templates and customization
 * - Progress tracking for large exports
 */

class ExportManager {
    constructor() {
        this.exportFormats = {
            CSV: 'csv',
            GOOGLE_SHEETS: 'google_sheets',
            PDF: 'pdf',
            EXCEL: 'excel',
            JSON: 'json'
        };
        
        this.exportTemplates = {
            EMPLOYEE_DATA: 'employee_data',
            SALARY_ANALYSIS: 'salary_analysis',
            RAISE_RECOMMENDATIONS: 'raise_recommendations',
            BUDGET_ANALYSIS: 'budget_analysis',
            RISK_ASSESSMENT: 'risk_assessment',
            COMPREHENSIVE_REPORT: 'comprehensive_report'
        };
        
        // Google Sheets API configuration
        this.googleSheetsConfig = {
            apiKey: null, // To be set by user
            clientId: null, // To be set by user
            scope: 'https://www.googleapis.com/auth/spreadsheets'
        };
        
        this.isGoogleSheetsReady = false;
        this.exportProgress = {};
    }

    /**
     * Initialize Google Sheets API
     */
    async initializeGoogleSheets(apiKey, clientId) {
        try {
            this.googleSheetsConfig.apiKey = apiKey;
            this.googleSheetsConfig.clientId = clientId;
            
            // Load Google API
            await this.loadGoogleAPI();
            
            // Initialize the API
            await gapi.load('auth2', () => {
                gapi.auth2.init({
                    client_id: this.googleSheetsConfig.clientId
                });
            });
            
            await gapi.load('client', async () => {
                await gapi.client.init({
                    apiKey: this.googleSheetsConfig.apiKey,
                    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
                });
            });
            
            this.isGoogleSheetsReady = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize Google Sheets API:', error);
            return false;
        }
    }

    /**
     * Load Google API script
     */
    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Export data to specified format
     */
    async exportData(data, format, template, options = {}) {
        const exportId = this.generateExportId();
        this.exportProgress[exportId] = { status: 'starting', progress: 0 };
        
        try {
            let result;
            
            switch (format) {
                case this.exportFormats.CSV:
                    result = await this.exportToCSV(data, template, options, exportId);
                    break;
                case this.exportFormats.GOOGLE_SHEETS:
                    result = await this.exportToGoogleSheets(data, template, options, exportId);
                    break;
                case this.exportFormats.PDF:
                    result = await this.exportToPDF(data, template, options, exportId);
                    break;
                case this.exportFormats.EXCEL:
                    result = await this.exportToExcel(data, template, options, exportId);
                    break;
                case this.exportFormats.JSON:
                    result = await this.exportToJSON(data, template, options, exportId);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
            
            this.exportProgress[exportId] = { status: 'completed', progress: 100, result };
            return result;
            
        } catch (error) {
            this.exportProgress[exportId] = { status: 'error', progress: 0, error: error.message };
            throw error;
        }
    }

    /**
     * Export to CSV format
     */
    async exportToCSV(data, template, options, exportId) {
        this.updateProgress(exportId, 'processing', 10);
        
        const csvData = this.prepareDataForTemplate(data, template);
        this.updateProgress(exportId, 'formatting', 50);
        
        const csvContent = this.convertToCSV(csvData, options);
        this.updateProgress(exportId, 'downloading', 90);
        
        const filename = this.generateFilename(template, 'csv', options);
        this.downloadFile(csvContent, filename, 'text/csv');
        
        this.updateProgress(exportId, 'completed', 100);
        return { success: true, filename, format: 'CSV' };
    }

    /**
     * Export to Google Sheets
     */
    async exportToGoogleSheets(data, template, options, exportId) {
        if (!this.isGoogleSheetsReady) {
            throw new Error('Google Sheets API not initialized');
        }
        
        this.updateProgress(exportId, 'authenticating', 10);
        
        // Authenticate user
        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance.isSignedIn.get()) {
            await authInstance.signIn();
        }
        
        this.updateProgress(exportId, 'preparing', 30);
        
        const sheetData = this.prepareDataForTemplate(data, template);
        const spreadsheetTitle = this.generateFilename(template, 'sheet', options);
        
        this.updateProgress(exportId, 'creating', 50);
        
        // Create new spreadsheet
        const spreadsheet = await gapi.client.sheets.spreadsheets.create({
            properties: {
                title: spreadsheetTitle
            }
        });
        
        const spreadsheetId = spreadsheet.result.spreadsheetId;
        
        this.updateProgress(exportId, 'uploading', 70);
        
        // Add data to spreadsheet
        await this.populateGoogleSheet(spreadsheetId, sheetData, template);
        
        this.updateProgress(exportId, 'formatting', 90);
        
        // Apply formatting
        await this.formatGoogleSheet(spreadsheetId, template);
        
        this.updateProgress(exportId, 'completed', 100);
        
        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
        return { 
            success: true, 
            spreadsheetId, 
            url: spreadsheetUrl, 
            format: 'Google Sheets' 
        };
    }

    /**
     * Export to PDF format
     */
    async exportToPDF(data, template, options, exportId) {
        this.updateProgress(exportId, 'preparing', 10);
        
        // Load jsPDF library if not already loaded
        await this.loadJsPDF();
        
        this.updateProgress(exportId, 'generating', 30);
        
        const pdfData = this.prepareDataForTemplate(data, template);
        const pdf = this.generatePDF(pdfData, template, options);
        
        this.updateProgress(exportId, 'downloading', 90);
        
        const filename = this.generateFilename(template, 'pdf', options);
        pdf.save(filename);
        
        this.updateProgress(exportId, 'completed', 100);
        return { success: true, filename, format: 'PDF' };
    }

    /**
     * Export to Excel format
     */
    async exportToExcel(data, template, options, exportId) {
        this.updateProgress(exportId, 'preparing', 10);
        
        // Load SheetJS library if not already loaded
        await this.loadSheetJS();
        
        this.updateProgress(exportId, 'processing', 30);
        
        const excelData = this.prepareDataForTemplate(data, template);
        
        this.updateProgress(exportId, 'generating', 60);
        
        const workbook = this.createExcelWorkbook(excelData, template, options);
        
        this.updateProgress(exportId, 'downloading', 90);
        
        const filename = this.generateFilename(template, 'xlsx', options);
        XLSX.writeFile(workbook, filename);
        
        this.updateProgress(exportId, 'completed', 100);
        return { success: true, filename, format: 'Excel' };
    }

    /**
     * Export to JSON format
     */
    async exportToJSON(data, template, options, exportId) {
        this.updateProgress(exportId, 'processing', 30);
        
        const jsonData = this.prepareDataForTemplate(data, template);
        
        this.updateProgress(exportId, 'formatting', 60);
        
        const jsonContent = JSON.stringify(jsonData, null, 2);
        
        this.updateProgress(exportId, 'downloading', 90);
        
        const filename = this.generateFilename(template, 'json', options);
        this.downloadFile(jsonContent, filename, 'application/json');
        
        this.updateProgress(exportId, 'completed', 100);
        return { success: true, filename, format: 'JSON' };
    }

    /**
     * Prepare data based on template
     */
    prepareDataForTemplate(data, template) {
        switch (template) {
            case this.exportTemplates.EMPLOYEE_DATA:
                return this.prepareEmployeeData(data);
            case this.exportTemplates.SALARY_ANALYSIS:
                return this.prepareSalaryAnalysis(data);
            case this.exportTemplates.RAISE_RECOMMENDATIONS:
                return this.prepareRaiseRecommendations(data);
            case this.exportTemplates.BUDGET_ANALYSIS:
                return this.prepareBudgetAnalysis(data);
            case this.exportTemplates.RISK_ASSESSMENT:
                return this.prepareRiskAssessment(data);
            case this.exportTemplates.COMPREHENSIVE_REPORT:
                return this.prepareComprehensiveReport(data);
            default:
                return data;
        }
    }

    /**
     * Prepare employee data for export
     */
    prepareEmployeeData(data) {
        const { employees } = data;
        
        return {
            title: 'Employee Data Export',
            timestamp: new Date().toISOString(),
            headers: [
                'Employee ID', 'Name', 'Email', 'Department', 'Job Title', 
                'Country', 'Salary', 'Currency', 'Performance Rating', 
                'Tenure', 'Last Raise Date', 'Manager', 'Future Talent'
            ],
            rows: employees.map(emp => [
                emp.id || '',
                emp.name || '',
                emp.email || '',
                emp.department || '',
                emp.jobTitle || '',
                emp.country || '',
                emp.salary || '',
                emp.currency || 'USD',
                emp.performanceRating || '',
                emp.tenure || '',
                emp.lastRaiseDate || '',
                emp.manager || '',
                emp.futureTalent || ''
            ]),
            summary: {
                totalEmployees: employees.length,
                departments: [...new Set(employees.map(emp => emp.department))].length,
                countries: [...new Set(employees.map(emp => emp.country))].length,
                avgSalary: employees.reduce((sum, emp) => sum + parseFloat(emp.salary || 0), 0) / employees.length
            }
        };
    }

    /**
     * Prepare salary analysis for export
     */
    prepareSalaryAnalysis(data) {
        const { employees, analysis } = data;
        
        return {
            title: 'Salary Analysis Report',
            timestamp: new Date().toISOString(),
            summary: analysis.summary,
            byDepartment: analysis.byDepartment,
            byCountry: analysis.byCountry,
            byRole: analysis.byRole,
            equityGaps: analysis.equityGaps,
            recommendations: analysis.recommendations
        };
    }

    /**
     * Prepare raise recommendations for export
     */
    prepareRaiseRecommendations(data) {
        const { recommendations, budgetImpact } = data;
        
        return {
            title: 'Raise Recommendations',
            timestamp: new Date().toISOString(),
            headers: [
                'Employee Name', 'Current Salary', 'Recommended Raise %', 
                'New Salary', 'Justification', 'Priority', 'Budget Impact'
            ],
            rows: recommendations.map(rec => [
                rec.employeeName,
                this.formatCurrency(rec.currentSalary),
                `${rec.raisePercentage}%`,
                this.formatCurrency(rec.newSalary),
                rec.justification,
                rec.priority,
                this.formatCurrency(rec.budgetImpact)
            ]),
            budgetSummary: budgetImpact
        };
    }

    /**
     * Convert data to CSV format
     */
    convertToCSV(data, options = {}) {
        const { delimiter = ',', includeHeaders = true, encoding = 'utf-8' } = options;
        
        let csv = '';
        
        // Add title and metadata
        if (data.title) {
            csv += `"${data.title}"\n`;
            csv += `"Generated: ${new Date().toLocaleString()}"\n\n`;
        }
        
        // Add headers
        if (includeHeaders && data.headers) {
            csv += data.headers.map(header => `"${header}"`).join(delimiter) + '\n';
        }
        
        // Add rows
        if (data.rows) {
            data.rows.forEach(row => {
                csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(delimiter) + '\n';
            });
        }
        
        // Add summary if available
        if (data.summary) {
            csv += '\n"Summary"\n';
            Object.entries(data.summary).forEach(([key, value]) => {
                csv += `"${key}","${value}"\n`;
            });
        }
        
        return csv;
    }

    /**
     * Populate Google Sheet with data
     */
    async populateGoogleSheet(spreadsheetId, data, template) {
        const requests = [];
        
        // Add title
        if (data.title) {
            requests.push({
                updateCells: {
                    range: {
                        sheetId: 0,
                        startRowIndex: 0,
                        endRowIndex: 1,
                        startColumnIndex: 0,
                        endColumnIndex: 1
                    },
                    rows: [{
                        values: [{
                            userEnteredValue: { stringValue: data.title },
                            userEnteredFormat: {
                                textFormat: { bold: true, fontSize: 16 }
                            }
                        }]
                    }],
                    fields: 'userEnteredValue,userEnteredFormat'
                }
            });
        }
        
        // Add headers
        if (data.headers) {
            const headerRow = data.headers.map(header => ({
                userEnteredValue: { stringValue: header },
                userEnteredFormat: {
                    textFormat: { bold: true },
                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
                }
            }));
            
            requests.push({
                updateCells: {
                    range: {
                        sheetId: 0,
                        startRowIndex: 2,
                        endRowIndex: 3,
                        startColumnIndex: 0,
                        endColumnIndex: data.headers.length
                    },
                    rows: [{ values: headerRow }],
                    fields: 'userEnteredValue,userEnteredFormat'
                }
            });
        }
        
        // Add data rows
        if (data.rows) {
            const dataRows = data.rows.map(row => ({
                values: row.map(cell => ({
                    userEnteredValue: { stringValue: String(cell) }
                }))
            }));
            
            requests.push({
                updateCells: {
                    range: {
                        sheetId: 0,
                        startRowIndex: 3,
                        endRowIndex: 3 + data.rows.length,
                        startColumnIndex: 0,
                        endColumnIndex: data.headers ? data.headers.length : data.rows[0].length
                    },
                    rows: dataRows,
                    fields: 'userEnteredValue'
                }
            });
        }
        
        // Execute all requests
        if (requests.length > 0) {
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetId,
                requests: requests
            });
        }
    }

    /**
     * Format Google Sheet
     */
    async formatGoogleSheet(spreadsheetId, template) {
        const requests = [
            // Auto-resize columns
            {
                autoResizeDimensions: {
                    dimensions: {
                        sheetId: 0,
                        dimension: 'COLUMNS',
                        startIndex: 0,
                        endIndex: 20
                    }
                }
            },
            // Freeze header row
            {
                updateSheetProperties: {
                    properties: {
                        sheetId: 0,
                        gridProperties: {
                            frozenRowCount: 3
                        }
                    },
                    fields: 'gridProperties.frozenRowCount'
                }
            }
        ];
        
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            requests: requests
        });
    }

    /**
     * Generate PDF document
     */
    generatePDF(data, template, options) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        let yPosition = 20;
        
        // Add title
        if (data.title) {
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text(data.title, 20, yPosition);
            yPosition += 15;
        }
        
        // Add timestamp
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
        yPosition += 20;
        
        // Add table if data has headers and rows
        if (data.headers && data.rows) {
            pdf.autoTable({
                head: [data.headers],
                body: data.rows,
                startY: yPosition,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [200, 200, 200] }
            });
        }
        
        return pdf;
    }

    /**
     * Create Excel workbook
     */
    createExcelWorkbook(data, template, options) {
        const workbook = XLSX.utils.book_new();
        
        // Create main data sheet
        const worksheet = XLSX.utils.aoa_to_sheet([]);
        
        let rowIndex = 0;
        
        // Add title
        if (data.title) {
            XLSX.utils.sheet_add_aoa(worksheet, [[data.title]], { origin: `A${rowIndex + 1}` });
            rowIndex += 2;
        }
        
        // Add headers and data
        if (data.headers && data.rows) {
            XLSX.utils.sheet_add_aoa(worksheet, [data.headers], { origin: `A${rowIndex + 1}` });
            rowIndex++;
            XLSX.utils.sheet_add_aoa(worksheet, data.rows, { origin: `A${rowIndex + 1}` });
        }
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        
        // Add summary sheet if available
        if (data.summary) {
            const summarySheet = XLSX.utils.json_to_sheet([data.summary]);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        }
        
        return workbook;
    }

    /**
     * Load jsPDF library
     */
    async loadJsPDF() {
        if (window.jspdf) return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                // Load autoTable plugin
                const autoTableScript = document.createElement('script');
                autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
                autoTableScript.onload = resolve;
                autoTableScript.onerror = reject;
                document.head.appendChild(autoTableScript);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Load SheetJS library
     */
    async loadSheetJS() {
        if (window.XLSX) return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Download file to user's computer
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Generate filename based on template and format
     */
    generateFilename(template, format, options = {}) {
        const timestamp = new Date().toISOString().split('T')[0];
        const templateName = template.replace(/_/g, '-');
        const customName = options.filename || '';
        
        const baseName = customName || `team-analyzer-${templateName}-${timestamp}`;
        return `${baseName}.${format}`;
    }

    /**
     * Generate unique export ID
     */
    generateExportId() {
        return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Update export progress
     */
    updateProgress(exportId, status, progress) {
        this.exportProgress[exportId] = { status, progress };
        
        // Emit progress event
        window.dispatchEvent(new CustomEvent('exportProgress', {
            detail: { exportId, status, progress }
        }));
    }

    /**
     * Get export progress
     */
    getExportProgress(exportId) {
        return this.exportProgress[exportId] || { status: 'unknown', progress: 0 };
    }

    /**
     * Format currency value
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    /**
     * Prepare comprehensive report
     */
    prepareComprehensiveReport(data) {
        return {
            title: 'Team Analyzer Comprehensive Report',
            timestamp: new Date().toISOString(),
            executiveSummary: data.executiveSummary,
            employeeData: this.prepareEmployeeData(data),
            salaryAnalysis: data.salaryAnalysis,
            raiseRecommendations: data.raiseRecommendations,
            budgetAnalysis: data.budgetAnalysis,
            riskAssessment: data.riskAssessment,
            insights: data.insights,
            recommendations: data.recommendations
        };
    }

    /**
     * Prepare budget analysis for export
     */
    prepareBudgetAnalysis(data) {
        return {
            title: 'Budget Analysis Report',
            timestamp: new Date().toISOString(),
            currentBudget: data.currentBudget,
            proposedBudget: data.proposedBudget,
            budgetImpact: data.budgetImpact,
            departmentBreakdown: data.departmentBreakdown,
            countryBreakdown: data.countryBreakdown,
            compliance: data.compliance,
            recommendations: data.recommendations
        };
    }

    /**
     * Prepare risk assessment for export
     */
    prepareRiskAssessment(data) {
        return {
            title: 'Risk Assessment Report',
            timestamp: new Date().toISOString(),
            riskSummary: data.riskSummary,
            highRiskEmployees: data.highRiskEmployees,
            riskFactors: data.riskFactors,
            retentionProbabilities: data.retentionProbabilities,
            interventions: data.interventions,
            recommendations: data.recommendations
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportManager;
} else if (typeof window !== 'undefined') {
    window.ExportManager = ExportManager;
} 