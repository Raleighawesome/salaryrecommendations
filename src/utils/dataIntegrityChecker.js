/**
 * Data Integrity Checker
 * 
 * Comprehensive data validation and integrity checking system for Team Analyzer.
 * Provides thorough validation rules, data consistency checks, business logic validation,
 * and automated data cleaning capabilities.
 * 
 * Features:
 * - Field-level validation with custom rules
 * - Cross-field validation and business logic checks
 * - Data consistency and referential integrity
 * - Automated data cleaning and normalization
 * - Performance and salary validation
 * - Country and currency validation
 * - Data completeness scoring
 * - Validation reporting and suggestions
 */

class DataIntegrityChecker {
    constructor() {
        console.log('🔄 DataIntegrityChecker constructor called');
        
        this.validationRules = {};
        this.businessRules = {};
        this.cleaningRules = {};
        this.validationHistory = [];
        
        // Validation severity levels
        this.severity = {
            CRITICAL: 'critical',
            HIGH: 'high',
            MEDIUM: 'medium',
            LOW: 'low',
            INFO: 'info'
        };
        
        // Validation categories
        this.categories = {
            REQUIRED: 'required',
            FORMAT: 'format',
            RANGE: 'range',
            CONSISTENCY: 'consistency',
            BUSINESS_LOGIC: 'business_logic',
            REFERENTIAL: 'referential',
            COMPLETENESS: 'completeness'
        };
        
        console.log('🔍 Categories defined:', this.categories);
        console.log('🔍 Severity levels defined:', this.severity);
        
        // Initialize validation rules
        console.log('🔄 Initializing validation rules...');
        this.initializeValidationRules();
        this.initializeBusinessRules();
        this.initializeCleaningRules();
        
        console.log('✅ DataIntegrityChecker constructor completed successfully');
    }

    /**
     * Initialize field-level validation rules
     */
    initializeValidationRules() {
        this.validationRules = {
            // Employee ID validation
            id: [
                {
                    name: 'required',
                    category: this.categories.REQUIRED,
                    severity: this.severity.CRITICAL,
                    validate: (value) => value !== null && value !== undefined && value !== '',
                    message: 'Employee ID is required'
                },
                {
                    name: 'unique',
                    category: this.categories.CONSISTENCY,
                    severity: this.severity.CRITICAL,
                    validate: (value, employee, allEmployees) => {
                        const duplicates = allEmployees.filter(emp => emp.id === value);
                        return duplicates.length <= 1;
                    },
                    message: 'Employee ID must be unique'
                }
            ],
            
            // Name validation
            name: [
                {
                    name: 'required',
                    category: this.categories.REQUIRED,
                    severity: this.severity.CRITICAL,
                    validate: (value) => value && value.trim().length > 0,
                    message: 'Employee name is required'
                },
                {
                    name: 'format',
                    category: this.categories.FORMAT,
                    severity: this.severity.MEDIUM,
                    validate: (value) => {
                        if (!value) return true; // Skip if empty (handled by required rule)
                        // Allow letters, spaces, hyphens, apostrophes, periods, and commas for names like "Jones, Asa"
                        return /^[a-zA-Z\s\-'\.,()\u00C0-\u017F]+$/.test(value.trim());
                    },
                    message: 'Name contains invalid characters'
                },
                {
                    name: 'length',
                    category: this.categories.RANGE,
                    severity: this.severity.MEDIUM,
                    validate: (value) => {
                        if (!value) return true;
                        const trimmed = value.trim();
                        return trimmed.length >= 2 && trimmed.length <= 100;
                    },
                    message: 'Name must be between 2 and 100 characters'
                }
            ],
            
            // Title validation
            title: [
                {
                    name: 'required',
                    category: this.categories.REQUIRED,
                    severity: this.severity.HIGH,
                    validate: (value) => value && value.trim().length > 0,
                    message: 'Job title is required'
                },
                {
                    name: 'length',
                    category: this.categories.RANGE,
                    severity: this.severity.LOW,
                    validate: (value) => {
                        if (!value) return true;
                        return value.trim().length <= 200;
                    },
                    message: 'Job title is too long (max 200 characters)'
                }
            ],
            
            // Country validation
            country: [
                {
                    name: 'required',
                    category: this.categories.REQUIRED,
                    severity: this.severity.HIGH,
                    validate: (value) => value && value.trim().length > 0,
                    message: 'Country is required'
                },
                {
                    name: 'valid_country',
                    category: this.categories.FORMAT,
                    severity: this.severity.MEDIUM,
                    validate: (value) => {
                        if (!value) return true;
                        const validCountries = this.getValidCountries();
                        const countryMappings = this.getCountryMappings();
                        const trimmedValue = value.trim();
                        
                        // Check if it's a valid country code, full name, or mapped name
                        return validCountries.includes(trimmedValue) || 
                               Object.keys(countryMappings).includes(trimmedValue.toLowerCase()) ||
                               Object.values(countryMappings).includes(trimmedValue);
                    },
                    message: 'Invalid country code or name'
                }
            ],
            
            // Salary validation
            salary: [
                {
                    name: 'required',
                    category: this.categories.REQUIRED,
                    severity: this.severity.CRITICAL,
                    validate: (value) => value && value.amount > 0,
                    message: 'Valid salary amount is required'
                },
                {
                    name: 'currency_required',
                    category: this.categories.REQUIRED,
                    severity: this.severity.HIGH,
                    validate: (value) => value && value.currency && value.currency.length > 0,
                    message: 'Salary currency is required'
                },
                {
                    name: 'valid_currency',
                    category: this.categories.FORMAT,
                    severity: this.severity.MEDIUM,
                    validate: (value) => {
                        if (!value || !value.currency) return true;
                        const validCurrencies = this.getValidCurrencies();
                        return validCurrencies.includes(value.currency);
                    },
                    message: 'Invalid currency code'
                },
                {
                    name: 'reasonable_amount',
                    category: this.categories.RANGE,
                    severity: this.severity.MEDIUM,
                    validate: (value) => {
                        if (!value || !value.amount) return true;
                        return value.amount >= 1000 && value.amount <= 10000000;
                    },
                    message: 'Salary amount seems unreasonable (should be between 1,000 and 10,000,000)'
                }
            ],
            
            // Performance rating validation
            performanceRating: [
                {
                    name: 'valid_rating',
                    category: this.categories.RANGE,
                    severity: this.severity.MEDIUM,
                    validate: (value) => {
                        if (value === null || value === undefined) return true; // Optional field
                        
                        // Handle both object format and string format
                        let ratingValue = value;
                        if (typeof value === 'object' && value.text) {
                            ratingValue = value.text;
                        }
                        
                        if (!ratingValue) return true;
                        
                        // Red Hat performance ratings
                        const validRatings = [
                            'High Impact Performer',
                            'Successful Performer', 
                            'Evolving Performer',
                            'Needs Improvement',
                            'Unsatisfactory',
                            // Legacy ratings for compatibility
                            'Exceeds Expectations', 
                            'Meets Expectations', 
                            'Below Expectations'
                        ];
                        return validRatings.includes(ratingValue.trim());
                    },
                    message: 'Invalid performance rating'
                }
            ],
            
            // Comparatio validation
            comparatio: [
                {
                    name: 'valid_range',
                    category: this.categories.RANGE,
                    severity: this.severity.MEDIUM,
                    validate: (value) => {
                        if (value === null || value === undefined) return true;
                        return value >= 0.5 && value <= 2.0;
                    },
                    message: 'Comparatio should be between 0.5 and 2.0'
                }
            ],
            
            // Time in role validation
            timeInRole: [
                {
                    name: 'valid_range',
                    category: this.categories.RANGE,
                    severity: this.severity.LOW,
                    validate: (value) => {
                        if (value === null || value === undefined) return true;
                        // More reasonable range - some people might have very long careers
                        return value >= 0 && value <= 600; // 600 months = 50 years
                    },
                    message: 'Time in role should be between 0 and 50 years (600 months)'
                }
            ],
            
            // Time since raise validation
            timeSinceRaise: [
                {
                    name: 'valid_range',
                    category: this.categories.RANGE,
                    severity: this.severity.LOW,
                    validate: (value) => {
                        if (value === null || value === undefined) return true;
                        // More reasonable range - some people might not have had raises for longer periods
                        return value >= 0 && value <= 120; // 120 months = 10 years
                    },
                    message: 'Time since raise should be between 0 and 10 years (120 months)'
                }
            ]
        };
    }

    /**
     * Initialize business logic validation rules
     */
    initializeBusinessRules() {
        this.businessRules = [
            {
                name: 'salary_comparatio_consistency',
                category: this.categories.BUSINESS_LOGIC,
                severity: this.severity.MEDIUM,
                validate: (employee, allEmployees) => {
                    if (!employee.salary || !employee.comparatio) return true;
                    
                    // Check if comparatio makes sense relative to others in same country/role
                    const peers = allEmployees.filter(emp => 
                        emp.country === employee.country && 
                        emp.title === employee.title &&
                        emp.id !== employee.id
                    );
                    
                    if (peers.length === 0) return true;
                    
                    const avgSalary = peers.reduce((sum, emp) => sum + (emp.salary?.amount || 0), 0) / peers.length;
                    const expectedComparatio = employee.salary.amount / avgSalary;
                    const difference = Math.abs(employee.comparatio - expectedComparatio);
                    
                    return difference <= 0.3; // Allow 30% variance
                },
                message: 'Comparatio seems inconsistent with salary relative to peers'
            },
            {
                name: 'performance_salary_alignment',
                category: this.categories.BUSINESS_LOGIC,
                severity: this.severity.LOW,
                validate: (employee, allEmployees) => {
                    if (!employee.performanceRating || !employee.comparatio) return true;
                    
                    // High performers should generally have higher comparatios
                    if (employee.performanceRating === 'Exceeds Expectations' && employee.comparatio < 0.8) {
                        return false;
                    }
                    if (employee.performanceRating === 'Below Expectations' && employee.comparatio > 1.2) {
                        return false;
                    }
                    
                    return true;
                },
                message: 'Performance rating and salary level may not be aligned'
            },
            {
                name: 'time_consistency',
                category: this.categories.BUSINESS_LOGIC,
                severity: this.severity.LOW,
                validate: (employee) => {
                    if (!employee.timeInRole || !employee.timeSinceRaise) return true;
                    
                    // Time since raise shouldn't exceed time in role
                    return employee.timeSinceRaise <= employee.timeInRole;
                },
                message: 'Time since raise cannot exceed time in role'
            },
            {
                name: 'future_talent_performance_consistency',
                category: this.categories.BUSINESS_LOGIC,
                severity: this.severity.LOW,
                validate: (employee) => {
                    if (!employee.futureTalent || !employee.performanceRating) return true;
                    
                    // Future talent should generally have good performance
                    if (employee.futureTalent === 'Yes' && 
                        ['Below Expectations', 'Needs Improvement'].includes(employee.performanceRating)) {
                        return false;
                    }
                    
                    return true;
                },
                message: 'Future talent designation may not align with performance rating'
            }
        ];
    }

    /**
     * Initialize data cleaning rules
     */
    initializeCleaningRules() {
        this.cleaningRules = {
            name: [
                {
                    name: 'trim_whitespace',
                    clean: (value) => value ? value.trim() : value
                },
                {
                    name: 'normalize_case',
                    clean: (value) => {
                        if (!value) return value;
                        return value.split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ');
                    }
                }
            ],
            title: [
                {
                    name: 'trim_whitespace',
                    clean: (value) => value ? value.trim() : value
                },
                {
                    name: 'normalize_case',
                    clean: (value) => {
                        if (!value) return value;
                        // Title case for job titles
                        return value.split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ');
                    }
                }
            ],
            country: [
                {
                    name: 'trim_whitespace',
                    clean: (value) => value ? value.trim() : value
                },
                {
                    name: 'normalize_country',
                    clean: (value) => {
                        if (!value) return value;
                        const countryMappings = this.getCountryMappings();
                        return countryMappings[value.toLowerCase()] || value;
                    }
                }
            ],
            performanceRating: [
                {
                    name: 'normalize_rating',
                    clean: (value) => {
                        if (!value) return value;
                        const ratingMappings = {
                            'exceeds': 'Exceeds Expectations',
                            'meets': 'Meets Expectations',
                            'below': 'Below Expectations',
                            'needs improvement': 'Needs Improvement',
                            'excellent': 'Exceeds Expectations',
                            'good': 'Meets Expectations',
                            'poor': 'Below Expectations'
                        };
                        return ratingMappings[value.toLowerCase()] || value;
                    }
                }
            ]
        };
    }

    /**
     * Validate a complete dataset
     * @param {Array} employees - Array of employee data
     * @param {Object} options - Validation options
     * @returns {Object} Comprehensive validation report
     */
    validateDataset(employees, options = {}) {
        const startTime = Date.now();
        const validationReport = {
            timestamp: new Date().toISOString(),
            totalEmployees: employees.length,
            validationOptions: options,
            fieldValidation: {},
            businessValidation: [],
            dataQuality: {},
            suggestions: [],
            summary: {},
            performance: {}
        };

        // Field-level validation
        validationReport.fieldValidation = this.validateFields(employees);
        
        // Business logic validation
        validationReport.businessValidation = this.validateBusinessRules(employees);
        
        // Data quality assessment
        validationReport.dataQuality = this.assessDataQuality(employees);
        
        // Generate suggestions
        validationReport.suggestions = this.generateSuggestions(validationReport);
        
        // Create summary
        validationReport.summary = this.createValidationSummary(validationReport);
        
        // Performance metrics
        validationReport.performance = {
            validationTime: Date.now() - startTime,
            rulesExecuted: this.countRulesExecuted(),
            memoryUsage: this.getMemoryUsage()
        };

        // Store in history
        this.validationHistory.push(validationReport);
        
        return validationReport;
    }

    /**
     * Validate all fields for all employees
     * @param {Array} employees - Array of employees
     * @returns {Object} Field validation results
     */
    validateFields(employees) {
        const fieldResults = {};
        
        for (const [fieldName, rules] of Object.entries(this.validationRules)) {
            fieldResults[fieldName] = {
                totalChecked: 0,
                passed: 0,
                failed: 0,
                issues: []
            };
            
            for (let i = 0; i < employees.length; i++) {
                const employee = employees[i];
                const fieldValue = employee[fieldName];
                
                for (const rule of rules) {
                    fieldResults[fieldName].totalChecked++;
                    
                    try {
                        const isValid = rule.validate(fieldValue, employee, employees);
                        
                        if (isValid) {
                            fieldResults[fieldName].passed++;
                        } else {
                            fieldResults[fieldName].failed++;
                            fieldResults[fieldName].issues.push({
                                employeeId: employee.id,
                                employeeName: employee.name || 'Unknown',
                                rule: rule.name,
                                category: rule.category,
                                severity: rule.severity,
                                message: rule.message,
                                value: fieldValue,
                                rowIndex: i
                            });
                        }
                    } catch (error) {
                        fieldResults[fieldName].failed++;
                        fieldResults[fieldName].issues.push({
                            employeeId: employee.id,
                            employeeName: employee.name || 'Unknown',
                            rule: rule.name,
                            category: 'validation_error',
                            severity: this.severity.HIGH,
                            message: `Validation error: ${error.message}`,
                            value: fieldValue,
                            rowIndex: i
                        });
                    }
                }
            }
        }
        
        return fieldResults;
    }

    /**
     * Validate business rules
     * @param {Array} employees - Array of employees
     * @returns {Array} Business validation results
     */
    validateBusinessRules(employees) {
        const businessResults = [];
        
        for (let i = 0; i < employees.length; i++) {
            const employee = employees[i];
            
            for (const rule of this.businessRules) {
                try {
                    const isValid = rule.validate(employee, employees);
                    
                    if (!isValid) {
                        businessResults.push({
                            employeeId: employee.id,
                            employeeName: employee.name || 'Unknown',
                            rule: rule.name,
                            category: rule.category,
                            severity: rule.severity,
                            message: rule.message,
                            rowIndex: i
                        });
                    }
                } catch (error) {
                    businessResults.push({
                        employeeId: employee.id,
                        employeeName: employee.name || 'Unknown',
                        rule: rule.name,
                        category: 'validation_error',
                        severity: this.severity.HIGH,
                        message: `Business rule error: ${error.message}`,
                        rowIndex: i
                    });
                }
            }
        }
        
        return businessResults;
    }

    /**
     * Assess overall data quality
     * @param {Array} employees - Array of employees
     * @returns {Object} Data quality assessment
     */
    assessDataQuality(employees) {
        const quality = {
            completeness: this.assessCompleteness(employees),
            consistency: this.assessConsistency(employees),
            accuracy: this.assessAccuracy(employees),
            validity: this.assessValidity(employees),
            overall: 0
        };
        
        // Calculate overall quality score
        quality.overall = (
            quality.completeness.score * 0.3 +
            quality.consistency.score * 0.25 +
            quality.accuracy.score * 0.25 +
            quality.validity.score * 0.2
        );
        
        return quality;
    }

    /**
     * Assess data completeness
     * @param {Array} employees - Array of employees
     * @returns {Object} Completeness assessment
     */
    assessCompleteness(employees) {
        const requiredFields = ['id', 'name', 'title', 'country', 'salary'];
        const optionalFields = ['performanceRating', 'comparatio', 'timeInRole', 'timeSinceRaise', 'futureTalent'];
        
        let totalRequired = 0;
        let completedRequired = 0;
        let totalOptional = 0;
        let completedOptional = 0;
        
        for (const employee of employees) {
            for (const field of requiredFields) {
                totalRequired++;
                if (this.isFieldComplete(employee[field])) {
                    completedRequired++;
                }
            }
            
            for (const field of optionalFields) {
                totalOptional++;
                if (this.isFieldComplete(employee[field])) {
                    completedOptional++;
                }
            }
        }
        
        const requiredScore = totalRequired > 0 ? completedRequired / totalRequired : 1;
        const optionalScore = totalOptional > 0 ? completedOptional / totalOptional : 1;
        
        return {
            score: requiredScore * 0.8 + optionalScore * 0.2,
            requiredCompleteness: requiredScore,
            optionalCompleteness: optionalScore,
            missingRequired: totalRequired - completedRequired,
            missingOptional: totalOptional - completedOptional
        };
    }

    /**
     * Assess data consistency
     * @param {Array} employees - Array of employees
     * @returns {Object} Consistency assessment
     */
    assessConsistency(employees) {
        const inconsistencies = [];
        
        // Check for duplicate IDs
        const idCounts = {};
        employees.forEach(emp => {
            idCounts[emp.id] = (idCounts[emp.id] || 0) + 1;
        });
        
        const duplicateIds = Object.entries(idCounts).filter(([id, count]) => count > 1);
        inconsistencies.push(...duplicateIds.map(([id, count]) => ({
            type: 'duplicate_id',
            message: `Duplicate employee ID: ${id} (${count} occurrences)`
        })));
        
        // Check for inconsistent country/currency combinations
        const countryCurrencies = {};
        employees.forEach(emp => {
            if (emp.country && emp.salary?.currency) {
                if (!countryCurrencies[emp.country]) {
                    countryCurrencies[emp.country] = new Set();
                }
                countryCurrencies[emp.country].add(emp.salary.currency);
            }
        });
        
        Object.entries(countryCurrencies).forEach(([country, currencies]) => {
            if (currencies.size > 1) {
                inconsistencies.push({
                    type: 'inconsistent_currency',
                    message: `Multiple currencies for ${country}: ${Array.from(currencies).join(', ')}`
                });
            }
        });
        
        const score = Math.max(0, 1 - (inconsistencies.length / employees.length));
        
        return {
            score,
            inconsistencies,
            duplicateIds: duplicateIds.length
        };
    }

    /**
     * Assess data accuracy
     * @param {Array} employees - Array of employees
     * @returns {Object} Accuracy assessment
     */
    assessAccuracy(employees) {
        let totalChecks = 0;
        let accurateChecks = 0;
        
        for (const employee of employees) {
            // Check salary reasonableness
            if (employee.salary?.amount) {
                totalChecks++;
                if (employee.salary.amount >= 1000 && employee.salary.amount <= 10000000) {
                    accurateChecks++;
                }
            }
            
            // Check comparatio reasonableness
            if (employee.comparatio !== null && employee.comparatio !== undefined) {
                totalChecks++;
                if (employee.comparatio >= 0.5 && employee.comparatio <= 2.0) {
                    accurateChecks++;
                }
            }
            
            // Check time values
            if (employee.timeInRole !== null && employee.timeInRole !== undefined) {
                totalChecks++;
                if (employee.timeInRole >= 0 && employee.timeInRole <= 50) {
                    accurateChecks++;
                }
            }
        }
        
        const score = totalChecks > 0 ? accurateChecks / totalChecks : 1;
        
        return {
            score,
            totalChecks,
            accurateChecks,
            inaccurateChecks: totalChecks - accurateChecks
        };
    }

    /**
     * Assess data validity
     * @param {Array} employees - Array of employees
     * @returns {Object} Validity assessment
     */
    assessValidity(employees) {
        let totalValidations = 0;
        let validValidations = 0;
        
        const validCountries = this.getValidCountries();
        const validCurrencies = this.getValidCurrencies();
        const validRatings = ['Exceeds Expectations', 'Meets Expectations', 'Below Expectations', 'Needs Improvement'];
        
        for (const employee of employees) {
            // Validate country
            if (employee.country) {
                totalValidations++;
                if (validCountries.includes(employee.country)) {
                    validValidations++;
                }
            }
            
            // Validate currency
            if (employee.salary?.currency) {
                totalValidations++;
                if (validCurrencies.includes(employee.salary.currency)) {
                    validValidations++;
                }
            }
            
            // Validate performance rating
            if (employee.performanceRating) {
                totalValidations++;
                if (validRatings.includes(employee.performanceRating)) {
                    validValidations++;
                }
            }
        }
        
        const score = totalValidations > 0 ? validValidations / totalValidations : 1;
        
        return {
            score,
            totalValidations,
            validValidations,
            invalidValidations: totalValidations - validValidations
        };
    }

    /**
     * Clean and normalize data
     * @param {Array} employees - Array of employees
     * @returns {Array} Cleaned employee data
     */
    cleanData(employees) {
        const cleanedEmployees = employees.map(employee => {
            const cleaned = { ...employee };
            
            for (const [fieldName, rules] of Object.entries(this.cleaningRules)) {
                if (cleaned[fieldName] !== null && cleaned[fieldName] !== undefined) {
                    for (const rule of rules) {
                        try {
                            cleaned[fieldName] = rule.clean(cleaned[fieldName]);
                        } catch (error) {
                            console.warn(`Error cleaning field ${fieldName} for employee ${employee.id}:`, error);
                        }
                    }
                }
            }
            
            return cleaned;
        });
        
        return cleanedEmployees;
    }

    /**
     * Generate validation suggestions
     * @param {Object} validationReport - Validation report
     * @returns {Array} Array of suggestions
     */
    generateSuggestions(validationReport) {
        const suggestions = [];
        
        // Critical issues suggestions
        const criticalIssues = this.getCriticalIssues(validationReport);
        if (criticalIssues.length > 0) {
            suggestions.push({
                type: 'critical',
                priority: 'high',
                message: `${criticalIssues.length} critical data issues found that must be resolved`,
                action: 'review_critical_issues',
                details: criticalIssues.slice(0, 5) // Show first 5
            });
        }
        
        // Data completeness suggestions
        if (validationReport.dataQuality.completeness.score < 0.8) {
            suggestions.push({
                type: 'completeness',
                priority: 'medium',
                message: 'Data completeness is below recommended threshold (80%)',
                action: 'improve_completeness',
                details: {
                    currentScore: validationReport.dataQuality.completeness.score,
                    missingRequired: validationReport.dataQuality.completeness.missingRequired
                }
            });
        }
        
        // Data cleaning suggestions
        const cleanableIssues = this.getCleanableIssues(validationReport);
        if (cleanableIssues.length > 0) {
            suggestions.push({
                type: 'cleaning',
                priority: 'low',
                message: `${cleanableIssues.length} data formatting issues can be automatically cleaned`,
                action: 'auto_clean_data',
                details: cleanableIssues
            });
        }
        
        return suggestions;
    }

    /**
     * Create validation summary
     * @param {Object} validationReport - Validation report
     * @returns {Object} Validation summary
     */
    createValidationSummary(validationReport) {
        const totalIssues = this.countTotalIssues(validationReport);
        const criticalIssues = this.getCriticalIssues(validationReport).length;
        const overallScore = validationReport.dataQuality.overall;
        
        let status = 'excellent';
        if (overallScore < 0.6) status = 'poor';
        else if (overallScore < 0.8) status = 'fair';
        else if (overallScore < 0.9) status = 'good';
        
        return {
            status,
            overallScore,
            totalIssues,
            criticalIssues,
            dataQualityGrade: this.getDataQualityGrade(overallScore),
            recommendations: this.getTopRecommendations(validationReport)
        };
    }

    /**
     * Helper methods
     */
    
    isFieldComplete(value) {
        return value !== null && value !== undefined && value !== '';
    }
    
    getValidCountries() {
        return [
            // Country codes
            'US', 'CA', 'UK', 'DE', 'FR', 'AU', 'JP', 'IN', 'BR', 'MX', 'NL', 'SE', 'NO', 'DK', 'FI',
            // Full country names (from Red Hat CSV)
            'United States of America', 'India', 'Canada', 'United Kingdom', 'Germany', 'France', 
            'Australia', 'Japan', 'Brazil', 'Mexico', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland'
        ];
    }
    
    getValidCurrencies() {
        return ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'JPY', 'INR', 'BRL', 'MXN', 'SEK', 'NOK', 'DKK'];
    }
    
    getCountryMappings() {
        return {
            'united states': 'US',
            'united states of america': 'US',
            'canada': 'CA',
            'united kingdom': 'UK',
            'germany': 'DE',
            'france': 'FR',
            'australia': 'AU',
            'japan': 'JP',
            'india': 'IN',
            'brazil': 'BR',
            'mexico': 'MX',
            'netherlands': 'NL',
            'sweden': 'SE',
            'norway': 'NO',
            'denmark': 'DK',
            'finland': 'FI'
        };
    }
    
    getCriticalIssues(validationReport) {
        const critical = [];
        
        for (const fieldResult of Object.values(validationReport.fieldValidation)) {
            critical.push(...fieldResult.issues.filter(issue => issue.severity === this.severity.CRITICAL));
        }
        
        critical.push(...validationReport.businessValidation.filter(issue => issue.severity === this.severity.CRITICAL));
        
        return critical;
    }
    
    getCleanableIssues(validationReport) {
        const cleanable = [];
        
        for (const fieldResult of Object.values(validationReport.fieldValidation)) {
            cleanable.push(...fieldResult.issues.filter(issue => 
                issue.category === this.categories.FORMAT && 
                issue.severity !== this.severity.CRITICAL
            ));
        }
        
        return cleanable;
    }
    
    countTotalIssues(validationReport) {
        let total = 0;
        
        for (const fieldResult of Object.values(validationReport.fieldValidation)) {
            total += fieldResult.issues.length;
        }
        
        total += validationReport.businessValidation.length;
        
        return total;
    }
    
    countRulesExecuted() {
        let count = 0;
        for (const rules of Object.values(this.validationRules)) {
            count += rules.length;
        }
        count += this.businessRules.length;
        return count;
    }
    
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize
            };
        }
        return null;
    }
    
    getDataQualityGrade(score) {
        if (score >= 0.95) return 'A+';
        if (score >= 0.9) return 'A';
        if (score >= 0.85) return 'B+';
        if (score >= 0.8) return 'B';
        if (score >= 0.75) return 'C+';
        if (score >= 0.7) return 'C';
        if (score >= 0.6) return 'D';
        return 'F';
    }
    
    getTopRecommendations(validationReport) {
        return validationReport.suggestions
            .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            })
            .slice(0, 3)
            .map(s => s.message);
    }
    
    /**
     * Get validation history
     * @returns {Array} Validation history
     */
    getValidationHistory() {
        return this.validationHistory;
    }
    
    /**
     * Clear validation history
     */
    clearValidationHistory() {
        this.validationHistory = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataIntegrityChecker;
} else {
    window.DataIntegrityChecker = DataIntegrityChecker;
}