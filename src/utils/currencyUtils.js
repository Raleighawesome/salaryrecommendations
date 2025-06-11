/**
 * Currency Utilities
 * 
 * Provides currency validation, formatting, and conversion utilities
 * for multi-currency salary data processing.
 */

class CurrencyUtils {
    constructor() {
        // Supported currencies with their properties
        this.supportedCurrencies = {
            'USD': {
                name: 'US Dollar',
                symbol: '$',
                code: 'USD',
                decimalPlaces: 2,
                thousandsSeparator: ',',
                decimalSeparator: '.',
                symbolPosition: 'before'
            },
            'EUR': {
                name: 'Euro',
                symbol: '€',
                code: 'EUR',
                decimalPlaces: 2,
                thousandsSeparator: ',',
                decimalSeparator: '.',
                symbolPosition: 'before'
            },
            'GBP': {
                name: 'British Pound',
                symbol: '£',
                code: 'GBP',
                decimalPlaces: 2,
                thousandsSeparator: ',',
                decimalSeparator: '.',
                symbolPosition: 'before'
            },
            'INR': {
                name: 'Indian Rupee',
                symbol: '₹',
                code: 'INR',
                decimalPlaces: 0, // Typically no decimals for INR salaries
                thousandsSeparator: ',',
                decimalSeparator: '.',
                symbolPosition: 'before'
            },
            'CAD': {
                name: 'Canadian Dollar',
                symbol: 'C$',
                code: 'CAD',
                decimalPlaces: 2,
                thousandsSeparator: ',',
                decimalSeparator: '.',
                symbolPosition: 'before'
            },
            'AUD': {
                name: 'Australian Dollar',
                symbol: 'A$',
                code: 'AUD',
                decimalPlaces: 2,
                thousandsSeparator: ',',
                decimalSeparator: '.',
                symbolPosition: 'before'
            }
        };

        // Approximate exchange rates (in a real app, these would come from an API)
        this.exchangeRates = {
            'USD': 1.0,      // Base currency
            'EUR': 0.85,     // 1 USD = 0.85 EUR
            'GBP': 0.73,     // 1 USD = 0.73 GBP
            'INR': 83.0,     // 1 USD = 83 INR
            'CAD': 1.35,     // 1 USD = 1.35 CAD
            'AUD': 1.50      // 1 USD = 1.50 AUD
        };

        this.lastUpdated = new Date().toISOString();
    }

    /**
     * Validate if a currency code is supported
     * @param {string} currencyCode - Currency code to validate
     * @returns {boolean} Whether the currency is supported
     */
    isValidCurrency(currencyCode) {
        return currencyCode && this.supportedCurrencies.hasOwnProperty(currencyCode.toUpperCase());
    }

    /**
     * Get currency information
     * @param {string} currencyCode - Currency code
     * @returns {Object|null} Currency information or null if not found
     */
    getCurrencyInfo(currencyCode) {
        const code = currencyCode?.toUpperCase();
        return this.supportedCurrencies[code] || null;
    }

    /**
     * Format amount according to currency rules
     * @param {number} amount - Amount to format
     * @param {string} currencyCode - Currency code
     * @param {Object} options - Formatting options
     * @returns {string} Formatted amount
     */
    formatAmount(amount, currencyCode = 'USD', options = {}) {
        const currency = this.getCurrencyInfo(currencyCode);
        if (!currency) {
            return `${amount} ${currencyCode}`;
        }

        const {
            showSymbol = true,
            showCode = false,
            compact = false
        } = options;

        // Handle compact formatting for large numbers
        if (compact && amount >= 1000) {
            return this.formatCompactAmount(amount, currency, showSymbol, showCode);
        }

        // Format the number
        const decimalPlaces = currency.decimalPlaces;
        const formattedNumber = amount.toLocaleString('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
        });

        // Build the formatted string
        let result = '';
        
        if (showSymbol && currency.symbolPosition === 'before') {
            result += currency.symbol;
        }
        
        result += formattedNumber;
        
        if (showSymbol && currency.symbolPosition === 'after') {
            result += currency.symbol;
        }
        
        if (showCode) {
            result += ` ${currency.code}`;
        }

        return result;
    }

    /**
     * Format amount in compact notation (e.g., $120K, $1.2M)
     * @param {number} amount - Amount to format
     * @param {Object} currency - Currency information
     * @param {boolean} showSymbol - Whether to show currency symbol
     * @param {boolean} showCode - Whether to show currency code
     * @returns {string} Compact formatted amount
     */
    formatCompactAmount(amount, currency, showSymbol, showCode) {
        let value = amount;
        let suffix = '';

        if (value >= 1000000) {
            value = value / 1000000;
            suffix = 'M';
        } else if (value >= 1000) {
            value = value / 1000;
            suffix = 'K';
        }

        // Round to 1 decimal place for compact format
        const rounded = Math.round(value * 10) / 10;
        const formattedValue = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);

        let result = '';
        
        if (showSymbol && currency.symbolPosition === 'before') {
            result += currency.symbol;
        }
        
        result += formattedValue + suffix;
        
        if (showSymbol && currency.symbolPosition === 'after') {
            result += currency.symbol;
        }
        
        if (showCode) {
            result += ` ${currency.code}`;
        }

        return result;
    }

    /**
     * Convert amount from one currency to another
     * @param {number} amount - Amount to convert
     * @param {string} fromCurrency - Source currency code
     * @param {string} toCurrency - Target currency code
     * @returns {Object} Conversion result
     */
    convertCurrency(amount, fromCurrency, toCurrency) {
        const fromCode = fromCurrency?.toUpperCase();
        const toCode = toCurrency?.toUpperCase();

        if (!this.isValidCurrency(fromCode) || !this.isValidCurrency(toCode)) {
            throw new Error('Invalid currency code for conversion');
        }

        if (fromCode === toCode) {
            return {
                originalAmount: amount,
                convertedAmount: amount,
                fromCurrency: fromCode,
                toCurrency: toCode,
                exchangeRate: 1.0,
                formatted: this.formatAmount(amount, toCode)
            };
        }

        // Convert to USD first, then to target currency
        const fromRate = this.exchangeRates[fromCode];
        const toRate = this.exchangeRates[toCode];
        
        if (!fromRate || !toRate) {
            throw new Error('Exchange rate not available');
        }

        const usdAmount = amount / fromRate;
        const convertedAmount = usdAmount * toRate;
        const exchangeRate = toRate / fromRate;

        return {
            originalAmount: amount,
            convertedAmount: Math.round(convertedAmount * 100) / 100,
            fromCurrency: fromCode,
            toCurrency: toCode,
            exchangeRate: Math.round(exchangeRate * 10000) / 10000,
            formatted: this.formatAmount(convertedAmount, toCode),
            lastUpdated: this.lastUpdated
        };
    }

    /**
     * Normalize salary amounts to a common currency for comparison
     * @param {Array} salaries - Array of salary objects with amount and currency
     * @param {string} targetCurrency - Target currency for normalization
     * @returns {Array} Array of normalized salary objects
     */
    normalizeSalaries(salaries, targetCurrency = 'USD') {
        return salaries.map(salary => {
            try {
                const conversion = this.convertCurrency(
                    salary.amount, 
                    salary.currency, 
                    targetCurrency
                );
                
                return {
                    ...salary,
                    normalizedAmount: conversion.convertedAmount,
                    normalizedCurrency: targetCurrency,
                    exchangeRate: conversion.exchangeRate,
                    originalFormatted: this.formatAmount(salary.amount, salary.currency),
                    normalizedFormatted: conversion.formatted
                };
            } catch (error) {
                console.warn(`Failed to normalize salary for ${salary.currency}:`, error);
                return {
                    ...salary,
                    normalizedAmount: salary.amount,
                    normalizedCurrency: salary.currency,
                    exchangeRate: 1.0,
                    originalFormatted: this.formatAmount(salary.amount, salary.currency),
                    normalizedFormatted: this.formatAmount(salary.amount, salary.currency),
                    conversionError: error.message
                };
            }
        });
    }

    /**
     * Validate salary amount for a specific currency
     * @param {number} amount - Salary amount
     * @param {string} currencyCode - Currency code
     * @returns {Object} Validation result
     */
    validateSalaryAmount(amount, currencyCode) {
        const currency = this.getCurrencyInfo(currencyCode);
        if (!currency) {
            return {
                isValid: false,
                errors: [`Unsupported currency: ${currencyCode}`],
                warnings: []
            };
        }

        const errors = [];
        const warnings = [];

        // Basic amount validation
        if (typeof amount !== 'number' || isNaN(amount)) {
            errors.push('Amount must be a valid number');
        } else if (amount < 0) {
            errors.push('Amount cannot be negative');
        } else if (amount === 0) {
            warnings.push('Amount is zero');
        }

        // Currency-specific validation
        if (amount > 0) {
            const ranges = this.getTypicalSalaryRanges(currencyCode);
            
            if (amount < ranges.minimum) {
                warnings.push(`Amount (${this.formatAmount(amount, currencyCode)}) is below typical minimum for ${currency.name}`);
            } else if (amount > ranges.maximum) {
                warnings.push(`Amount (${this.formatAmount(amount, currencyCode)}) is above typical maximum for ${currency.name}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            formattedAmount: this.formatAmount(amount, currencyCode)
        };
    }

    /**
     * Get typical salary ranges for a currency (rough estimates)
     * @param {string} currencyCode - Currency code
     * @returns {Object} Salary range object
     */
    getTypicalSalaryRanges(currencyCode) {
        const ranges = {
            'USD': { minimum: 20000, maximum: 500000 },
            'EUR': { minimum: 18000, maximum: 400000 },
            'GBP': { minimum: 15000, maximum: 350000 },
            'INR': { minimum: 200000, maximum: 10000000 },
            'CAD': { minimum: 25000, maximum: 600000 },
            'AUD': { minimum: 30000, maximum: 700000 }
        };

        return ranges[currencyCode?.toUpperCase()] || { minimum: 0, maximum: Infinity };
    }

    /**
     * Get list of supported currencies
     * @returns {Array} Array of currency objects
     */
    getSupportedCurrencies() {
        return Object.entries(this.supportedCurrencies).map(([code, info]) => ({
            code: code,
            name: info.name,
            symbol: info.symbol
        }));
    }

    /**
     * Detect currency from a formatted string
     * @param {string} formattedAmount - Formatted amount string
     * @returns {Object} Detection result
     */
    detectCurrency(formattedAmount) {
        if (!formattedAmount || typeof formattedAmount !== 'string') {
            return { currency: null, confidence: 0 };
        }

        const cleanValue = formattedAmount.trim();
        
        // Check for currency symbols and codes
        for (const [code, info] of Object.entries(this.supportedCurrencies)) {
            // Check for symbol
            if (cleanValue.includes(info.symbol)) {
                return { currency: code, confidence: 0.9, detectedBy: 'symbol' };
            }
            
            // Check for currency code
            const codeRegex = new RegExp(`\\b${code}\\b`, 'i');
            if (codeRegex.test(cleanValue)) {
                return { currency: code, confidence: 0.8, detectedBy: 'code' };
            }
        }

        // Default to USD if no currency detected
        return { currency: 'USD', confidence: 0.3, detectedBy: 'default' };
    }

    /**
     * Parse a formatted currency string to extract amount and currency
     * @param {string} formattedAmount - Formatted amount string
     * @returns {Object} Parsed result
     */
    parseFormattedAmount(formattedAmount) {
        if (!formattedAmount || typeof formattedAmount !== 'string') {
            throw new Error('Invalid formatted amount');
        }

        const detection = this.detectCurrency(formattedAmount);
        const currency = detection.currency;
        
        // Remove currency symbols and codes
        let cleanValue = formattedAmount;
        if (currency) {
            const currencyInfo = this.getCurrencyInfo(currency);
            cleanValue = cleanValue.replace(currencyInfo.symbol, '');
            cleanValue = cleanValue.replace(new RegExp(`\\b${currency}\\b`, 'gi'), '');
        }
        
        // Remove formatting and extract number
        cleanValue = cleanValue.replace(/[,\s]/g, '').trim();
        const amount = parseFloat(cleanValue);
        
        if (isNaN(amount)) {
            throw new Error('Unable to parse amount from formatted string');
        }

        return {
            amount: amount,
            currency: currency,
            formatted: this.formatAmount(amount, currency),
            confidence: detection.confidence
        };
    }

    /**
     * Get exchange rate between two currencies
     * @param {string} fromCurrency - Source currency
     * @param {string} toCurrency - Target currency
     * @returns {number} Exchange rate
     */
    getExchangeRate(fromCurrency, toCurrency) {
        const fromCode = fromCurrency?.toUpperCase();
        const toCode = toCurrency?.toUpperCase();

        if (!this.isValidCurrency(fromCode) || !this.isValidCurrency(toCode)) {
            throw new Error('Invalid currency code');
        }

        if (fromCode === toCode) {
            return 1.0;
        }

        const fromRate = this.exchangeRates[fromCode];
        const toRate = this.exchangeRates[toCode];
        
        if (!fromRate || !toRate) {
            throw new Error('Exchange rate not available');
        }

        return toRate / fromRate;
    }

    /**
     * Update exchange rates (placeholder for real API integration)
     * @param {Object} newRates - New exchange rates object
     */
    updateExchangeRates(newRates) {
        this.exchangeRates = { ...this.exchangeRates, ...newRates };
        this.lastUpdated = new Date().toISOString();
    }
}

// Export for use in other modules
window.CurrencyUtils = CurrencyUtils; 