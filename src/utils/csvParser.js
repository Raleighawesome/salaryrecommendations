/**
 * CSV Parser Utility
 * 
 * Handles parsing CSV files with intelligent data validation,
 * error handling, and data normalization for employee data.
 */

class CSVParser {
    constructor() {
        // Required columns for employee data
        this.requiredColumns = [
            'Employee Full name',
            'Business Title', 
            'Country',
            'Total Base Pay',
            'Comparatio',
            'Overall Performance Rating'
        ];

        // Optional columns that enhance functionality
        this.optionalColumns = [
            'Future Talent',
            'Time in Role',
            'Time Since Last Raise',
            'Department',
            'Manager',
            'Hire Date'
        ];

        // Column name variations and aliases
        this.columnAliases = {
            'Employee Full name': ['name', 'full name', 'employee name', 'full_name', 'employee_name'],
            'Business Title': ['title', 'job title', 'position', 'role', 'job_title', 'business_title'],
            'Country': ['location', 'region', 'office'],
            'Total Base Pay': ['salary', 'base salary', 'pay', 'compensation', 'base_pay', 'total_pay'],
            'Comparatio': ['comp ratio', 'ratio', 'market ratio', 'comp_ratio'],
            'Overall Performance Rating': ['performance', 'rating', 'perf rating', 'performance_rating', 'overall_rating'],
            'Future Talent': ['high potential', 'talent', 'future_talent', 'high_potential', 'identified as future talent?', 'identified as future talent'],
            'Time in Role': ['tenure', 'months in role', 'time_in_role', 'role_tenure'],
            'Time Since Last Raise': ['months since raise', 'last raise', 'time_since_raise', 'raise_tenure']
        };

        this.parseErrors = [];
        this.parseWarnings = [];

        // Delimiter used for parsing, default to comma
        this.delimiter = ',';
    }

    /**
     * Parse CSV content into structured employee data
     * @param {string} csvContent - Raw CSV content
     * @returns {Object} Parsed data with employees array and metadata
     */
    async parseCSV(csvContent) {
        try {
            this.parseErrors = [];
            this.parseWarnings = [];

            // Split into lines and handle different line endings
            const lines = csvContent.split(/\r?\n/).filter(line => line.trim());

            // Detect delimiter from header row (supports comma, semicolon, tab)
            this.delimiter = this.detectDelimiter(lines[0]);
            
            if (lines.length < 2) {
                throw new Error('CSV file must contain at least a header row and one data row');
            }

            // Parse header row
            const headers = this.parseCSVRow(lines[0], this.delimiter);
            console.log('CSV headers found:', headers);
            
            const columnMapping = this.mapColumns(headers);
            console.log('Column mapping:', columnMapping);

            // Validate required columns
            this.validateRequiredColumns(columnMapping);

            // Parse data rows
            const employees = [];
            for (let i = 1; i < lines.length; i++) {
                try {
                    const rowData = this.parseCSVRow(lines[i], this.delimiter);
                    if (rowData.length === 0 || rowData.every(cell => !cell.trim())) {
                        continue; // Skip empty rows
                    }

                    const employee = this.parseEmployeeRow(rowData, columnMapping, i + 1);
                    if (employee) {
                        employees.push(employee);
                    }
                } catch (error) {
                    this.parseErrors.push(`Row ${i + 1}: ${error.message}`);
                }
            }

            // Post-processing and validation
            const processedEmployees = this.postProcessEmployees(employees);

            return {
                employees: processedEmployees,
                metadata: {
                    totalRows: lines.length - 1,
                    validEmployees: processedEmployees.length,
                    columns: Object.keys(columnMapping),
                    errors: this.parseErrors,
                    warnings: this.parseWarnings,
                    parsedAt: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('CSV parsing error details:', {
                error: error.message,
                stack: error.stack,
                parseErrors: this.parseErrors,
                parseWarnings: this.parseWarnings
            });
            throw new Error(`CSV parsing failed: ${error.message}`);
        }
    }

    /**
     * Detect the delimiter used in a CSV line
     * @param {string} line - Header line of the CSV
     * @returns {string} Detected delimiter (default ',')
     */
    detectDelimiter(line) {
        const commaCount = (line.match(/,/g) || []).length;
        const semicolonCount = (line.match(/;/g) || []).length;
        const tabCount = (line.match(/\t/g) || []).length;

        if (semicolonCount > commaCount && semicolonCount >= tabCount) {
            return ';';
        }

        if (tabCount > commaCount && tabCount > semicolonCount) {
            return '\t';
        }

        return ',';
    }

    /**
     * Parse a single CSV row handling quoted fields and commas
     * @param {string} row - CSV row string
     * @returns {Array} Array of cell values
     */
    parseCSVRow(row, delimiter = this.delimiter || ',') {
        const cells = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < row.length) {
            const char = row[i];
            const nextChar = row[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === delimiter && !inQuotes) {
                // End of cell
                cells.push(current.trim());
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }

        // Add the last cell
        cells.push(current.trim());
        return cells;
    }

    /**
     * Map CSV headers to standard column names
     * @param {Array} headers - Array of header strings
     * @returns {Object} Mapping of standard names to column indices
     */
    mapColumns(headers) {
        const mapping = {};
        const normalizedHeaders = headers.map(h => h.trim().toLowerCase());

        // Direct matches first
        for (const [standardName, aliases] of Object.entries(this.columnAliases)) {
            const standardLower = standardName.toLowerCase();
            
            // Check for exact match
            let index = normalizedHeaders.indexOf(standardLower);
            
            // Check aliases if no exact match
            if (index === -1) {
                for (const alias of aliases) {
                    index = normalizedHeaders.indexOf(alias.toLowerCase());
                    if (index !== -1) break;
                }
            }

            if (index !== -1) {
                mapping[standardName] = index;
            }
        }

        return mapping;
    }

    /**
     * Validate that required columns are present
     * @param {Object} columnMapping - Column mapping object
     */
    validateRequiredColumns(columnMapping) {
        const missingColumns = [];
        
        for (const requiredCol of this.requiredColumns) {
            if (!(requiredCol in columnMapping)) {
                missingColumns.push(requiredCol);
            }
        }

        if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
        }
    }

    /**
     * Parse a single employee row
     * @param {Array} rowData - Array of cell values
     * @param {Object} columnMapping - Column mapping
     * @param {number} rowNumber - Row number for error reporting
     * @returns {Object} Employee object
     */
    parseEmployeeRow(rowData, columnMapping, rowNumber) {
        const employee = {
            id: `emp_${rowNumber}_${Date.now()}`,
            rowNumber: rowNumber
        };

        // Parse required fields
        for (const [columnName, columnIndex] of Object.entries(columnMapping)) {
            const cellValue = rowData[columnIndex] || '';
            
            try {
                switch (columnName) {
                    case 'Employee Full name':
                        employee.name = this.parseStringField(cellValue, 'Employee name');
                        break;
                    case 'Business Title':
                        employee.title = this.parseStringField(cellValue, 'Business title');
                        break;
                    case 'Country':
                        employee.country = this.parseCountryField(cellValue);
                        break;
                    case 'Total Base Pay':
                        employee.salary = this.parseSalaryField(cellValue);
                        break;
                    case 'Comparatio':
                        employee.comparatio = this.parseNumericField(cellValue, 'Comparatio', 0.1, 3.0);
                        break;
                    case 'Overall Performance Rating':
                        employee.performanceRating = this.parsePerformanceRating(cellValue);
                        break;
                    case 'Future Talent':
                        employee.futureTalent = this.parseBooleanField(cellValue);
                        break;
                    case 'Time in Role':
                        employee.timeInRole = this.parseNumericField(cellValue, 'Time in Role', 0, 600);
                        break;
                    case 'Time Since Last Raise':
                        employee.timeSinceRaise = this.parseNumericField(cellValue, 'Time Since Last Raise', 0, 600);
                        break;
                    default:
                        // Store additional columns as-is
                        employee[columnName.toLowerCase().replace(/\s+/g, '_')] = cellValue;
                }
            } catch (error) {
                this.parseWarnings.push(`Row ${rowNumber}, ${columnName}: ${error.message}`);
                
                // Set default values for failed parsing
                this.setDefaultValue(employee, columnName, cellValue);
            }
        }

        // Validate employee has minimum required data
        if (!employee.name || !employee.title) {
            throw new Error('Employee must have name and title');
        }

        return employee;
    }

    /**
     * Parse string field with validation
     * @param {string} value - Field value
     * @param {string} fieldName - Field name for error reporting
     * @returns {string} Parsed string
     */
    parseStringField(value, fieldName) {
        const trimmed = value.trim();
        if (!trimmed) {
            throw new Error(`${fieldName} cannot be empty`);
        }
        return trimmed;
    }

    /**
     * Parse country field with normalization
     * @param {string} value - Country value
     * @returns {string} Normalized country
     */
    parseCountryField(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Unknown';

        // Normalize common country variations
        const countryMappings = {
            'us': 'United States',
            'usa': 'United States',
            'united states': 'United States',
            'uk': 'United Kingdom',
            'britain': 'United Kingdom',
            'england': 'United Kingdom',
            'in': 'India',
            'ind': 'India'
        };

        const normalized = trimmed.toLowerCase();
        return countryMappings[normalized] || trimmed;
    }

    /**
     * Parse salary field with currency handling
     * @param {string} value - Salary value
     * @returns {Object} Salary object with amount and currency
     */
    parseSalaryField(value) {
        if (!value || !value.trim()) {
            throw new Error('Salary cannot be empty');
        }

        // Remove common formatting
        let cleanValue = value.toString().trim();
        
        // Extract currency symbol/code
        let currency = 'USD'; // Default
        const currencyPatterns = {
            'USD': /[$]|usd/i,
            'EUR': /[€]|eur/i,
            'GBP': /[£]|gbp/i,
            'INR': /[₹]|inr|rs/i,
            'CAD': /cad/i,
            'AUD': /aud/i
        };

        for (const [curr, pattern] of Object.entries(currencyPatterns)) {
            if (pattern.test(cleanValue)) {
                currency = curr;
                break;
            }
        }

        // Remove currency symbols and formatting
        cleanValue = cleanValue.replace(/[$€£₹,\s]/g, '').replace(/[a-zA-Z]/g, '');
        
        const amount = parseFloat(cleanValue);
        if (isNaN(amount) || amount < 0) {
            throw new Error('Invalid salary amount');
        }

        return {
            amount: amount,
            currency: currency,
            formatted: this.formatSalary(amount, currency)
        };
    }

    /**
     * Parse numeric field with range validation
     * @param {string} value - Numeric value
     * @param {string} fieldName - Field name
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Parsed number
     */
    parseNumericField(value, fieldName, min = -Infinity, max = Infinity) {
        if (!value || !value.toString().trim()) {
            return null; // Allow empty optional fields
        }

        let cleanValue = value.toString().replace(/[,\s]/g, '');
        let isPercentage = false;
        
        // Handle percentage values
        if (cleanValue.includes('%')) {
            isPercentage = true;
            cleanValue = cleanValue.replace('%', '');
        }
        
        const number = parseFloat(cleanValue);
        
        if (isNaN(number)) {
            throw new Error(`Invalid ${fieldName}: not a number`);
        }

        // Convert percentage to decimal for Comparatio field
        let finalNumber = number;
        if (isPercentage && fieldName === 'Comparatio') {
            finalNumber = number / 100;
        }

        if (finalNumber < min || finalNumber > max) {
            throw new Error(`${fieldName} must be between ${min} and ${max}`);
        }

        return finalNumber;
    }

    /**
     * Parse performance rating with normalization
     * @param {string} value - Performance rating value
     * @returns {Object} Performance rating object
     */
    parsePerformanceRating(value) {
        if (!value || !value.toString().trim()) {
            return null; // Will be handled by suggestion system
        }

        const cleanValue = value.toString().trim().toLowerCase();
        
        // Try to parse as number first
        const numericValue = parseFloat(cleanValue);
        if (!isNaN(numericValue)) {
            return {
                numeric: numericValue,
                text: this.getPerformanceText(numericValue),
                original: value.toString().trim()
            };
        }

        // Parse text ratings
        const textMappings = {
            'excellent': 5,
            'outstanding': 5,
            'high impact performer': 5,
            'exceeds': 4,
            'exceeds expectations': 4,
            'above average': 4,
            'successful performer': 4,
            'meets': 3,
            'meets expectations': 3,
            'satisfactory': 3,
            'average': 3,
            'evolving performer': 3,
            'below': 2,
            'below expectations': 2,
            'needs improvement': 2,
            'poor': 1,
            'unsatisfactory': 1
        };

        for (const [text, rating] of Object.entries(textMappings)) {
            if (cleanValue.includes(text)) {
                return {
                    numeric: rating,
                    text: this.getPerformanceText(rating),
                    original: value.toString().trim()
                };
            }
        }

        throw new Error('Unable to parse performance rating');
    }

    /**
     * Parse boolean field
     * @param {string} value - Boolean value
     * @returns {boolean} Parsed boolean
     */
    parseBooleanField(value) {
        if (!value || !value.toString().trim()) {
            return false;
        }

        const cleanValue = value.toString().trim().toLowerCase();
        const trueValues = ['true', 'yes', 'y', '1', 'high', 'top'];
        
        return trueValues.includes(cleanValue);
    }

    /**
     * Get performance text from numeric rating
     * @param {number} rating - Numeric rating
     * @returns {string} Performance text
     */
    getPerformanceText(rating) {
        if (rating >= 4.5) return 'Outstanding';
        if (rating >= 3.5) return 'Exceeds Expectations';
        if (rating >= 2.5) return 'Meets Expectations';
        if (rating >= 1.5) return 'Below Expectations';
        return 'Needs Improvement';
    }

    /**
     * Format salary for display
     * @param {number} amount - Salary amount
     * @param {string} currency - Currency code
     * @returns {string} Formatted salary
     */
    formatSalary(amount, currency) {
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹',
            'CAD': 'C$',
            'AUD': 'A$'
        };

        const symbol = symbols[currency] || currency;
        return `${symbol}${amount.toLocaleString()}`;
    }

    /**
     * Set default value for failed parsing
     * @param {Object} employee - Employee object
     * @param {string} columnName - Column name
     * @param {string} originalValue - Original value
     */
    setDefaultValue(employee, columnName, originalValue) {
        switch (columnName) {
            case 'Country':
                employee.country = 'Unknown';
                break;
            case 'Total Base Pay':
                employee.salary = { amount: 0, currency: 'USD', formatted: '$0' };
                break;
            case 'Comparatio':
                employee.comparatio = 1.0;
                break;
            case 'Overall Performance Rating':
                employee.performanceRating = null; // Will be suggested
                break;
            case 'Future Talent':
                employee.futureTalent = false;
                break;
            case 'Time in Role':
                employee.timeInRole = null;
                break;
            case 'Time Since Last Raise':
                employee.timeSinceRaise = null;
                break;
        }
    }

    /**
     * Post-process employees for additional validation and enhancement
     * @param {Array} employees - Array of employee objects
     * @returns {Array} Processed employees
     */
    postProcessEmployees(employees) {
        // Add derived fields and additional validation
        return employees.map(employee => {
            // Calculate risk indicators
            employee.riskIndicators = this.calculateRiskIndicators(employee);
            
            // Add metadata
            employee.processedAt = new Date().toISOString();
            
            return employee;
        });
    }

    /**
     * Calculate risk indicators for an employee
     * @param {Object} employee - Employee object
     * @returns {Object} Risk indicators
     */
    calculateRiskIndicators(employee) {
        const risks = {
            lowPay: false,
            highPerformerLowPay: false,
            longTimeWithoutRaise: false,
            belowMarket: false
        };

        // Low pay risk (salary below certain threshold)
        if (employee.salary && employee.salary.amount < 50000) {
            risks.lowPay = true;
        }

        // High performer with low pay
        if (employee.performanceRating && employee.performanceRating.numeric >= 4 && 
            employee.comparatio && employee.comparatio < 0.9) {
            risks.highPerformerLowPay = true;
        }

        // Long time without raise
        if (employee.timeSinceRaise && employee.timeSinceRaise > 24) {
            risks.longTimeWithoutRaise = true;
        }

        // Below market rate
        if (employee.comparatio && employee.comparatio < 0.8) {
            risks.belowMarket = true;
        }

        return risks;
    }
}

// Export for use in other modules
window.CSVParser = CSVParser; 