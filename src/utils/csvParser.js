/**
 * CSV Parser Utility
 * 
 * Handles parsing CSV files with intelligent data validation,
 * error handling, and data normalization for employee data.
 * Specifically designed for Red Hat compensation report format.
 */

class CSVParser {
    constructor() {
        // Required columns for employee data (Red Hat format)
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
            'Identified as Future Talent?',
            'Manager Full name',
            'Latest Hire Date',
            'Currency',
            'Grade Band',
            'Job Function',
            'Location',
            'Management Level'
        ];

        // Column name mappings for Red Hat CSV format
        this.columnMappings = {
            // Employee identification
            'Employee Full name': 'name',
            'Business Title': 'title',
            'Job Function': 'jobFunction',
            'Job Profile': 'jobProfile',
            'Job Category': 'jobCategory',
            
            // Location and organization
            'Country': 'country',
            'Location': 'location',
            'Region': 'region',
            
            // Compensation
            'Total Base Pay': 'totalBasePay',
            'Base Pay All Countries': 'basePayAllCountries',
            'Salary': 'salary',
            'Currency': 'currency',
            'Comparatio': 'comparatio',
            'Grade Band': 'gradeBand',
            'Salary Range Segment': 'salaryRangeSegment',
            'Below Range Minimum?': 'belowRangeMinimum',
            
            // Performance and talent
            'Overall Performance Rating': 'performanceRating',
            'Identified as Future Talent?': 'futureTalent',
            'Movement Readiness': 'movementReadiness',
            
            // Management and hierarchy
            'Manager Full name': 'managerName',
            'Manager Employee Number': 'managerEmployeeNumber',
            'Management Level': 'managementLevel',
            'Manager Flag': 'managerFlag',
            
            // Employment details
            'Latest Hire Date': 'latestHireDate',
            'Original Hire Date': 'originalHireDate',
            'Last Salary Change Date': 'lastSalaryChangeDate',
            
            // Additional fields
            'Employee Number': 'employeeNumber',
            'FTE': 'fte',
            'Time Type': 'timeType',
            'Scheduled Weekly Hours': 'scheduledWeeklyHours'
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
            this.validateRequiredColumns(columnMapping, headers);

            // Parse data rows
            const employees = [];
            for (let i = 1; i < lines.length; i++) {
                try {
                    const rowData = this.parseCSVRow(lines[i], this.delimiter);
                    if (rowData.length === 0 || rowData.every(cell => !cell.trim())) {
                        continue; // Skip empty rows
                    }

                    const employee = this.parseEmployeeRow(rowData, columnMapping, headers, i + 1);
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
     * Parse a single CSV row handling quoted fields and delimiters
     * @param {string} row - CSV row string
     * @param {string} delimiter - Delimiter to use
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
     * Map CSV headers to column indices
     * @param {Array} headers - Array of header strings
     * @returns {Object} Mapping of header names to column indices
     */
    mapColumns(headers) {
        const mapping = {};
        
        // Create direct mapping of headers to indices
        headers.forEach((header, index) => {
            const cleanHeader = header.trim();
            if (cleanHeader) {
                mapping[cleanHeader] = index;
            }
        });

        return mapping;
    }

    /**
     * Validate that required columns are present
     * @param {Object} columnMapping - Column mapping object
     * @param {Array} headers - Original headers array
     */
    validateRequiredColumns(columnMapping, headers) {
        const missingColumns = [];
        
        for (const requiredCol of this.requiredColumns) {
            if (!(requiredCol in columnMapping)) {
                missingColumns.push(requiredCol);
            }
        }

        if (missingColumns.length > 0) {
            console.log('Available columns:', Object.keys(columnMapping));
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
        }
    }

    /**
     * Parse a single employee row
     * @param {Array} rowData - Array of cell values
     * @param {Object} columnMapping - Column mapping
     * @param {Array} headers - Original headers
     * @param {number} rowNumber - Row number for error reporting
     * @returns {Object} Employee object
     */
    parseEmployeeRow(rowData, columnMapping, headers, rowNumber) {
        const employee = {
            id: this.getColumnValue(rowData, columnMapping, 'Employee Number') || `emp_${rowNumber}_${Date.now()}`,
            rowNumber: rowNumber
        };

        try {
            // Parse core employee information
            employee.name = this.parseNameField(
                this.getColumnValue(rowData, columnMapping, 'Employee Full name')
            );
            
            employee.title = this.parseStringField(
                this.getColumnValue(rowData, columnMapping, 'Business Title'), 
                'Business title'
            );
            
            employee.country = this.parseCountryField(
                this.getColumnValue(rowData, columnMapping, 'Country')
            );

            // Parse salary information
            employee.salary = this.parseSalaryField(
                this.getColumnValue(rowData, columnMapping, 'Total Base Pay'),
                this.getColumnValue(rowData, columnMapping, 'Currency')
            );

            // Parse comparatio
            employee.comparatio = this.parseComparatio(
                this.getColumnValue(rowData, columnMapping, 'Comparatio')
            );

            // Parse performance rating
            employee.performanceRating = this.parsePerformanceRating(
                this.getColumnValue(rowData, columnMapping, 'Overall Performance Rating')
            );

            // Parse optional fields
            employee.futureTalent = this.parseFutureTalent(
                this.getColumnValue(rowData, columnMapping, 'Identified as Future Talent?')
            );

            employee.managerName = this.getColumnValue(rowData, columnMapping, 'Manager Full name') || null;
            employee.location = this.getColumnValue(rowData, columnMapping, 'Location') || null;
            employee.gradeBand = this.getColumnValue(rowData, columnMapping, 'Grade Band') || null;
            employee.managementLevel = this.getColumnValue(rowData, columnMapping, 'Management Level') || null;
            employee.jobFunction = this.getColumnValue(rowData, columnMapping, 'Job Function') || null;

            // Parse dates
            employee.latestHireDate = this.parseDateField(
                this.getColumnValue(rowData, columnMapping, 'Latest Hire Date')
            );
            
            employee.lastSalaryChangeDate = this.parseDateField(
                this.getColumnValue(rowData, columnMapping, 'Last Salary Change Date')
            );

            // Calculate time-based fields
            if (employee.lastSalaryChangeDate) {
                employee.timeSinceRaise = this.calculateMonthsSince(employee.lastSalaryChangeDate);
            }

            if (employee.latestHireDate) {
                employee.timeInRole = this.calculateMonthsSince(employee.latestHireDate);
            }

            // Parse additional compensation fields
            employee.belowRangeMinimum = this.parseBooleanField(
                this.getColumnValue(rowData, columnMapping, 'Below Range Minimum?')
            );

        } catch (error) {
            this.parseWarnings.push(`Row ${rowNumber}: ${error.message}`);
            
            // Set minimum required fields if parsing failed
            if (!employee.name) employee.name = 'Unknown Employee';
            if (!employee.title) employee.title = 'Unknown Title';
            if (!employee.country) employee.country = 'Unknown';
            if (!employee.salary) employee.salary = { amount: 0, currency: 'USD', formatted: '$0' };
            if (!employee.comparatio) employee.comparatio = 1.0;
        }

        return employee;
    }

    /**
     * Get column value by header name
     * @param {Array} rowData - Row data array
     * @param {Object} columnMapping - Column mapping
     * @param {string} columnName - Column name to get
     * @returns {string} Column value or empty string
     */
    getColumnValue(rowData, columnMapping, columnName) {
        const columnIndex = columnMapping[columnName];
        if (columnIndex !== undefined && rowData[columnIndex] !== undefined) {
            return rowData[columnIndex].toString().trim();
        }
        return '';
    }

    /**
     * Parse string field with validation
     * @param {string} value - Field value
     * @param {string} fieldName - Field name for error reporting
     * @returns {string} Parsed string
     */
    parseStringField(value, fieldName) {
        const trimmed = (value || '').toString().trim();
        if (!trimmed) {
            throw new Error(`${fieldName} cannot be empty`);
        }
        return trimmed;
    }

    /**
     * Parse name field and convert "lastname, firstname" to "firstname lastname"
     * @param {string} value - Name value from CSV
     * @returns {string} Formatted name as "firstname lastname"
     */
    parseNameField(value) {
        const trimmed = (value || '').toString().trim();
        if (!trimmed) {
            throw new Error('Employee name cannot be empty');
        }

        // Check if name is in "lastname, firstname" format
        if (trimmed.includes(',')) {
            const parts = trimmed.split(',').map(part => part.trim());
            if (parts.length >= 2 && parts[0] && parts[1]) {
                // Convert "lastname, firstname" to "firstname lastname"
                const lastName = parts[0];
                const firstName = parts[1];
                // Handle middle names or additional parts
                const additionalParts = parts.slice(2).filter(part => part).join(' ');
                const fullName = additionalParts ? 
                    `${firstName} ${additionalParts} ${lastName}` : 
                    `${firstName} ${lastName}`;
                return fullName;
            }
        }

        // Return as-is if not in comma format (already "firstname lastname" or single name)
        return trimmed;
    }

    /**
     * Parse country field with normalization
     * @param {string} value - Country value
     * @returns {string} Normalized country
     */
    parseCountryField(value) {
        const trimmed = (value || '').toString().trim();
        if (!trimmed) return 'Unknown';

        // Normalize common country variations
        const countryMappings = {
            'us': 'United States',
            'usa': 'United States',
            'united states of america': 'United States',
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
     * @param {string} salaryValue - Salary value
     * @param {string} currencyValue - Currency value
     * @returns {Object} Salary object with amount and currency
     */
    parseSalaryField(salaryValue, currencyValue) {
        if (!salaryValue || !salaryValue.toString().trim()) {
            throw new Error('Salary cannot be empty');
        }

        // Clean salary value - remove quotes, commas, and whitespace
        let cleanValue = salaryValue.toString().replace(/["',\s]/g, '');
        
        // Determine currency
        let currency = 'USD'; // Default
        if (currencyValue && currencyValue.toString().trim()) {
            currency = currencyValue.toString().trim().toUpperCase();
        }

        // Parse amount
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
     * Parse comparatio field
     * @param {string} value - Comparatio value
     * @returns {number} Parsed comparatio
     */
    parseComparatio(value) {
        if (!value || !value.toString().trim()) {
            return 1.0; // Default comparatio
        }

        let cleanValue = value.toString().replace(/[%,\s]/g, '');
        const number = parseFloat(cleanValue);
        
        if (isNaN(number)) {
            throw new Error('Invalid comparatio: not a number');
        }

        // Convert percentage to decimal if needed
        let finalNumber = number;
        if (value.toString().includes('%')) {
            finalNumber = number / 100;
        }

        // Ensure reasonable range
        if (finalNumber < 0.1 || finalNumber > 3.0) {
            throw new Error('Comparatio must be between 0.1 and 3.0');
        }

        return finalNumber;
    }

    /**
     * Parse performance rating with Red Hat specific mappings
     * @param {string} value - Performance rating value
     * @returns {Object} Performance rating object
     */
    parsePerformanceRating(value) {
        if (!value || !value.toString().trim()) {
            return null; // Will be handled by suggestion system
        }

        const cleanValue = value.toString().trim().toLowerCase();
        
        // Red Hat specific performance rating mappings
        const ratingMappings = {
            'high impact performer': { numeric: 5, text: 'High Impact Performer' },
            'successful performer': { numeric: 4, text: 'Successful Performer' },
            'evolving performer': { numeric: 3, text: 'Evolving Performer' },
            'needs improvement': { numeric: 2, text: 'Needs Improvement' },
            'unsatisfactory': { numeric: 1, text: 'Unsatisfactory' },
            
            // Alternative mappings
            'exceeds expectations': { numeric: 5, text: 'High Impact Performer' },
            'meets expectations': { numeric: 4, text: 'Successful Performer' },
            'below expectations': { numeric: 2, text: 'Needs Improvement' },
            'outstanding': { numeric: 5, text: 'High Impact Performer' },
            'excellent': { numeric: 5, text: 'High Impact Performer' },
            'good': { numeric: 4, text: 'Successful Performer' },
            'satisfactory': { numeric: 3, text: 'Evolving Performer' },
            'poor': { numeric: 1, text: 'Unsatisfactory' }
        };

        // Try exact match first
        if (ratingMappings[cleanValue]) {
            const rating = ratingMappings[cleanValue];
            return {
                numeric: rating.numeric,
                text: rating.text,
                original: value.toString().trim()
            };
        }

        // Try partial matches
        for (const [key, rating] of Object.entries(ratingMappings)) {
            if (cleanValue.includes(key)) {
                return {
                    numeric: rating.numeric,
                    text: rating.text,
                    original: value.toString().trim()
                };
            }
        }

        // Try to parse as number
        const numericValue = parseFloat(cleanValue);
        if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 5) {
            return {
                numeric: numericValue,
                text: this.getPerformanceText(numericValue),
                original: value.toString().trim()
            };
        }

        throw new Error('Unable to parse performance rating');
    }

    /**
     * Parse future talent field
     * @param {string} value - Future talent value
     * @returns {boolean} Parsed boolean
     */
    parseFutureTalent(value) {
        if (!value || !value.toString().trim()) {
            return false;
        }

        const cleanValue = value.toString().trim().toLowerCase();
        const trueValues = ['true', 'yes', 'y', '1', 'high', 'top'];
        
        return trueValues.includes(cleanValue);
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
        const trueValues = ['true', 'yes', 'y', '1'];
        
        return trueValues.includes(cleanValue);
    }

    /**
     * Parse date field
     * @param {string} value - Date value
     * @returns {Date|null} Parsed date or null
     */
    parseDateField(value) {
        if (!value || !value.toString().trim()) {
            return null;
        }

        try {
            const date = new Date(value.toString().trim());
            if (isNaN(date.getTime())) {
                return null;
            }
            return date;
        } catch (error) {
            return null;
        }
    }

    /**
     * Calculate months since a given date
     * @param {Date} date - Date to calculate from
     * @returns {number} Months since date
     */
    calculateMonthsSince(date) {
        if (!date) return null;
        
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
        
        return diffMonths;
    }

    /**
     * Get performance text from numeric rating
     * @param {number} rating - Numeric rating
     * @returns {string} Performance text
     */
    getPerformanceText(rating) {
        if (rating >= 4.5) return 'High Impact Performer';
        if (rating >= 3.5) return 'Successful Performer';
        if (rating >= 2.5) return 'Evolving Performer';
        if (rating >= 1.5) return 'Needs Improvement';
        return 'Unsatisfactory';
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

        const symbol = symbols[currency] || currency + ' ';
        
        // Format based on currency
        if (currency === 'INR') {
            // Indian Rupee formatting with lakhs/crores
            if (amount >= 10000000) {
                return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
            } else if (amount >= 100000) {
                return `${symbol}${(amount / 100000).toFixed(1)}L`;
            }
        }
        
        return `${symbol}${amount.toLocaleString()}`;
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
     * @returns {Array} Array of risk indicator strings
     */
    calculateRiskIndicators(employee) {
        const risks = [];

        // Below range minimum (from CSV data)
        if (employee.belowRangeMinimum) {
            risks.push('below_range_minimum');
        }

        // High performer with low comparatio - significant flight risk
        // Comparatio < 0.9 means paid below midpoint of pay grade
        if (employee.performanceRating && employee.performanceRating.numeric >= 4 && 
            employee.comparatio && employee.comparatio < 0.9) {
            risks.push('high_performer_low_pay');
            risks.push('flight_risk'); // High performers paid below midpoint are high flight risk
        }

        // Long time without raise - indicates potential flight risk
        if (employee.timeSinceRaise && employee.timeSinceRaise > 24) {
            risks.push('long_time_without_raise');
            risks.push('flight_risk'); // Long time without raise is a flight risk indicator
        }

        // Significantly below market rate (below 80% of midpoint)
        if (employee.comparatio && employee.comparatio < 0.8) {
            risks.push('below_market');
            risks.push('flight_risk'); // Paid significantly below pay grade midpoint
        }

        // Underpaid relative to grade (below 85% of midpoint)
        if (employee.comparatio && employee.comparatio < 0.85) {
            risks.push('underpaid');
        }

        // Well positioned (above midpoint)
        if (employee.comparatio && employee.comparatio > 1.1) {
            risks.push('well_positioned');
        }

        // Low pay based on currency and amount
        if (employee.salary) {
            const { amount, currency } = employee.salary;
            if (currency === 'USD' && amount < 50000) {
                risks.push('low_pay');
            } else if (currency === 'INR' && amount < 1000000) {
                risks.push('low_pay');
            } else if (currency === 'EUR' && amount < 40000) {
                risks.push('low_pay');
            } else if (currency === 'GBP' && amount < 35000) {
                risks.push('low_pay');
            }
        }

        // Check for promotion readiness based on performance and time in role
        if (employee.performanceRating && employee.performanceRating.numeric >= 4 && 
            employee.timeInRole && employee.timeInRole >= 18) {
            risks.push('promotion_ready');
        }

        // Remove duplicates and return
        return [...new Set(risks)];
    }
}

// Export for use in other modules
window.CSVParser = CSVParser; 