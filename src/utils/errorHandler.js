/**
 * Enhanced Error Handler
 * 
 * Comprehensive error handling system for Team Analyzer.
 * Provides centralized error management, logging, recovery strategies,
 * and user-friendly error reporting.
 * 
 * Features:
 * - Centralized error logging and tracking
 * - User-friendly error messages
 * - Error recovery strategies
 * - Performance monitoring
 * - Error categorization and severity levels
 * - Automatic error reporting
 */

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.errorCounts = {};
        this.performanceMetrics = {};
        this.isInitialized = false;
        
        // Error severity levels
        this.severity = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        };
        
        // Error categories
        this.categories = {
            FILE_PROCESSING: 'file_processing',
            DATA_VALIDATION: 'data_validation',
            NETWORK: 'network',
            MEMORY: 'memory',
            PERMISSION: 'permission',
            CALCULATION: 'calculation',
            EXPORT: 'export',
            UI: 'ui',
            UNKNOWN: 'unknown'
        };
        
        // Recovery strategies
        this.recoveryStrategies = {
            RETRY: 'retry',
            FALLBACK: 'fallback',
            SKIP: 'skip',
            RELOAD: 'reload',
            MANUAL: 'manual'
        };
        
        this.init();
    }

    /**
     * Initialize the error handler
     */
    init() {
        if (this.isInitialized) return;
        
        // Set up global error handlers
        this.setupGlobalErrorHandlers();
        
        // Set up performance monitoring
        this.setupPerformanceMonitoring();
        
        // Initialize error tracking
        this.initializeErrorTracking();
        
        this.isInitialized = true;
        console.log('Enhanced Error Handler initialized');
    }

    /**
     * Set up global error handlers for unhandled errors
     */
    setupGlobalErrorHandlers() {
        // Handle unhandled JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'Global JavaScript Error', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                severity: this.severity.HIGH,
                category: this.categories.UNKNOWN
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled Promise Rejection', {
                severity: this.severity.HIGH,
                category: this.categories.UNKNOWN
            });
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError(
                    new Error(`Failed to load resource: ${event.target.src || event.target.href}`),
                    'Resource Loading Error',
                    {
                        severity: this.severity.MEDIUM,
                        category: this.categories.NETWORK,
                        element: event.target.tagName
                    }
                );
            }
        }, true);
    }

    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.performanceMetrics.memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
                
                // Check for memory issues
                const memoryUsagePercent = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
                if (memoryUsagePercent > 80) {
                    this.handleError(
                        new Error(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`),
                        'Performance Warning',
                        {
                            severity: this.severity.MEDIUM,
                            category: this.categories.MEMORY,
                            recoveryStrategy: this.recoveryStrategies.MANUAL
                        }
                    );
                }
            }, 30000); // Check every 30 seconds
        }

        // Monitor long-running operations
        this.performanceMetrics.operations = {};
    }

    /**
     * Initialize error tracking
     */
    initializeErrorTracking() {
        // Load previous error data from localStorage if available
        try {
            const savedErrors = localStorage.getItem('teamAnalyzer_errorLog');
            if (savedErrors) {
                this.errorLog = JSON.parse(savedErrors).slice(-100); // Keep last 100 errors
            }
        } catch (e) {
            console.warn('Could not load previous error log:', e);
        }

        // Save error log periodically
        setInterval(() => {
            this.saveErrorLog();
        }, 60000); // Save every minute
    }

    /**
     * Main error handling method
     * @param {Error|string} error - The error object or message
     * @param {string} context - Context where the error occurred
     * @param {Object} options - Additional error options
     */
    handleError(error, context = 'Unknown', options = {}) {
        const errorInfo = this.processError(error, context, options);
        
        // Log the error
        this.logError(errorInfo);
        
        // Show user notification if appropriate
        if (options.showNotification !== false) {
            this.showUserNotification(errorInfo);
        }
        
        // Attempt recovery if strategy is provided
        if (options.recoveryStrategy) {
            this.attemptRecovery(errorInfo, options.recoveryStrategy, options.recoveryData);
        }
        
        // Update error counts
        this.updateErrorCounts(errorInfo);
        
        return errorInfo;
    }

    /**
     * Process and categorize an error
     * @param {Error|string} error - The error
     * @param {string} context - Error context
     * @param {Object} options - Error options
     * @returns {Object} Processed error information
     */
    processError(error, context, options) {
        const timestamp = new Date().toISOString();
        const errorMessage = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : null;
        
        // Categorize the error
        const category = options.category || this.categorizeError(errorMessage, context);
        const severity = options.severity || this.determineSeverity(errorMessage, context, category);
        
        return {
            id: this.generateErrorId(),
            timestamp,
            message: errorMessage,
            context,
            category,
            severity,
            stack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...options
        };
    }

    /**
     * Categorize an error based on its message and context
     * @param {string} message - Error message
     * @param {string} context - Error context
     * @returns {string} Error category
     */
    categorizeError(message, context) {
        const lowerMessage = message.toLowerCase();
        const lowerContext = context.toLowerCase();
        
        if (lowerMessage.includes('csv') || lowerMessage.includes('file') || lowerContext.includes('file')) {
            return this.categories.FILE_PROCESSING;
        }
        if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerContext.includes('validation')) {
            return this.categories.DATA_VALIDATION;
        }
        if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
            return this.categories.NETWORK;
        }
        if (lowerMessage.includes('memory') || lowerMessage.includes('heap')) {
            return this.categories.MEMORY;
        }
        if (lowerMessage.includes('permission') || lowerMessage.includes('denied')) {
            return this.categories.PERMISSION;
        }
        if (lowerMessage.includes('calculation') || lowerMessage.includes('math') || lowerContext.includes('calculation')) {
            return this.categories.CALCULATION;
        }
        if (lowerMessage.includes('export') || lowerContext.includes('export')) {
            return this.categories.EXPORT;
        }
        if (lowerMessage.includes('element') || lowerMessage.includes('dom') || lowerContext.includes('ui')) {
            return this.categories.UI;
        }
        
        return this.categories.UNKNOWN;
    }

    /**
     * Determine error severity
     * @param {string} message - Error message
     * @param {string} context - Error context
     * @param {string} category - Error category
     * @returns {string} Error severity
     */
    determineSeverity(message, context, category) {
        const lowerMessage = message.toLowerCase();
        
        // Critical errors
        if (lowerMessage.includes('critical') || lowerMessage.includes('fatal') || 
            category === this.categories.MEMORY && lowerMessage.includes('limit')) {
            return this.severity.CRITICAL;
        }
        
        // High severity errors
        if (lowerMessage.includes('failed') || lowerMessage.includes('error') ||
            category === this.categories.FILE_PROCESSING || category === this.categories.PERMISSION) {
            return this.severity.HIGH;
        }
        
        // Medium severity errors
        if (lowerMessage.includes('warning') || category === this.categories.DATA_VALIDATION ||
            category === this.categories.NETWORK) {
            return this.severity.MEDIUM;
        }
        
        // Default to low severity
        return this.severity.LOW;
    }

    /**
     * Log an error to the error log
     * @param {Object} errorInfo - Processed error information
     */
    logError(errorInfo) {
        this.errorLog.push(errorInfo);
        
        // Keep only the last 1000 errors to prevent memory issues
        if (this.errorLog.length > 1000) {
            this.errorLog = this.errorLog.slice(-1000);
        }
        
        // Console logging based on severity
        switch (errorInfo.severity) {
            case this.severity.CRITICAL:
                console.error('CRITICAL ERROR:', errorInfo);
                break;
            case this.severity.HIGH:
                console.error('HIGH SEVERITY ERROR:', errorInfo);
                break;
            case this.severity.MEDIUM:
                console.warn('MEDIUM SEVERITY ERROR:', errorInfo);
                break;
            default:
                console.log('LOW SEVERITY ERROR:', errorInfo);
        }
    }

    /**
     * Show user-friendly notification
     * @param {Object} errorInfo - Error information
     */
    showUserNotification(errorInfo) {
        const userMessage = this.getUserFriendlyMessage(errorInfo);
        const notificationType = this.getNotificationType(errorInfo.severity);
        const duration = this.getNotificationDuration(errorInfo.severity);
        
        // Use global notification system if available
        if (window.showNotification) {
            window.showNotification(userMessage, notificationType, duration);
        } else {
            // Fallback to console
            console.log(`${notificationType.toUpperCase()}: ${userMessage}`);
        }
    }

    /**
     * Get user-friendly error message
     * @param {Object} errorInfo - Error information
     * @returns {string} User-friendly message
     */
    getUserFriendlyMessage(errorInfo) {
        const categoryMessages = {
            [this.categories.FILE_PROCESSING]: 'There was an issue processing your file. Please check the format and try again.',
            [this.categories.DATA_VALIDATION]: 'Some data validation issues were found. Please review your data.',
            [this.categories.NETWORK]: 'Connection issue detected. Please check your internet connection.',
            [this.categories.MEMORY]: 'The application is using a lot of memory. Consider refreshing the page.',
            [this.categories.PERMISSION]: 'Permission denied. Please check file access permissions.',
            [this.categories.CALCULATION]: 'There was an issue with calculations. Please verify your data.',
            [this.categories.EXPORT]: 'Export failed. Please try again or choose a different format.',
            [this.categories.UI]: 'Interface issue detected. Please refresh the page if problems persist.',
            [this.categories.UNKNOWN]: 'An unexpected error occurred. Please try again.'
        };
        
        let baseMessage = categoryMessages[errorInfo.category] || categoryMessages[this.categories.UNKNOWN];
        
        // Add context-specific information
        if (errorInfo.context && errorInfo.context !== 'Unknown') {
            baseMessage += ` (Context: ${errorInfo.context})`;
        }
        
        // Add recovery suggestion if available
        if (errorInfo.recoveryStrategy) {
            const recoverySuggestions = {
                [this.recoveryStrategies.RETRY]: ' You can try again.',
                [this.recoveryStrategies.FALLBACK]: ' A fallback option is available.',
                [this.recoveryStrategies.RELOAD]: ' Please refresh the page.',
                [this.recoveryStrategies.MANUAL]: ' Please check the help documentation.'
            };
            
            baseMessage += recoverySuggestions[errorInfo.recoveryStrategy] || '';
        }
        
        return baseMessage;
    }

    /**
     * Get notification type based on severity
     * @param {string} severity - Error severity
     * @returns {string} Notification type
     */
    getNotificationType(severity) {
        switch (severity) {
            case this.severity.CRITICAL:
            case this.severity.HIGH:
                return 'error';
            case this.severity.MEDIUM:
                return 'warning';
            default:
                return 'info';
        }
    }

    /**
     * Get notification duration based on severity
     * @param {string} severity - Error severity
     * @returns {number} Duration in milliseconds
     */
    getNotificationDuration(severity) {
        switch (severity) {
            case this.severity.CRITICAL:
                return 15000; // 15 seconds
            case this.severity.HIGH:
                return 10000; // 10 seconds
            case this.severity.MEDIUM:
                return 7000;  // 7 seconds
            default:
                return 5000;  // 5 seconds
        }
    }

    /**
     * Attempt error recovery
     * @param {Object} errorInfo - Error information
     * @param {string} strategy - Recovery strategy
     * @param {Object} recoveryData - Data needed for recovery
     */
    attemptRecovery(errorInfo, strategy, recoveryData = {}) {
        console.log(`Attempting recovery for error ${errorInfo.id} using strategy: ${strategy}`);
        
        switch (strategy) {
            case this.recoveryStrategies.RETRY:
                this.retryOperation(errorInfo, recoveryData);
                break;
            case this.recoveryStrategies.FALLBACK:
                this.useFallback(errorInfo, recoveryData);
                break;
            case this.recoveryStrategies.RELOAD:
                this.suggestReload(errorInfo);
                break;
            case this.recoveryStrategies.SKIP:
                this.skipOperation(errorInfo, recoveryData);
                break;
            default:
                console.log('No automatic recovery available for this error');
        }
    }

    /**
     * Retry a failed operation
     * @param {Object} errorInfo - Error information
     * @param {Object} recoveryData - Recovery data
     */
    retryOperation(errorInfo, recoveryData) {
        if (recoveryData.retryFunction && typeof recoveryData.retryFunction === 'function') {
            const maxRetries = recoveryData.maxRetries || 3;
            const currentRetries = recoveryData.currentRetries || 0;
            
            if (currentRetries < maxRetries) {
                setTimeout(() => {
                    recoveryData.retryFunction({
                        ...recoveryData,
                        currentRetries: currentRetries + 1
                    });
                }, 1000 * (currentRetries + 1)); // Exponential backoff
            } else {
                this.handleError(
                    new Error('Maximum retry attempts exceeded'),
                    'Recovery Failed',
                    { severity: this.severity.HIGH, showNotification: true }
                );
            }
        }
    }

    /**
     * Use fallback option
     * @param {Object} errorInfo - Error information
     * @param {Object} recoveryData - Recovery data
     */
    useFallback(errorInfo, recoveryData) {
        if (recoveryData.fallbackFunction && typeof recoveryData.fallbackFunction === 'function') {
            recoveryData.fallbackFunction(recoveryData);
        }
    }

    /**
     * Suggest page reload
     * @param {Object} errorInfo - Error information
     */
    suggestReload(errorInfo) {
        if (window.showNotification) {
            window.showNotification(
                'A critical error occurred. Please refresh the page to continue.',
                'error',
                10000
            );
        }
    }

    /**
     * Skip failed operation
     * @param {Object} errorInfo - Error information
     * @param {Object} recoveryData - Recovery data
     */
    skipOperation(errorInfo, recoveryData) {
        if (recoveryData.skipCallback && typeof recoveryData.skipCallback === 'function') {
            recoveryData.skipCallback(recoveryData);
        }
    }

    /**
     * Update error counts for tracking
     * @param {Object} errorInfo - Error information
     */
    updateErrorCounts(errorInfo) {
        const key = `${errorInfo.category}_${errorInfo.severity}`;
        this.errorCounts[key] = (this.errorCounts[key] || 0) + 1;
    }

    /**
     * Generate unique error ID
     * @returns {string} Unique error ID
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Save error log to localStorage
     */
    saveErrorLog() {
        try {
            localStorage.setItem('teamAnalyzer_errorLog', JSON.stringify(this.errorLog));
        } catch (e) {
            console.warn('Could not save error log:', e);
        }
    }

    /**
     * Get error statistics
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
        const recentErrors = this.errorLog.filter(error => 
            new Date(error.timestamp).getTime() > last24Hours
        );
        
        const categoryStats = {};
        const severityStats = {};
        
        recentErrors.forEach(error => {
            categoryStats[error.category] = (categoryStats[error.category] || 0) + 1;
            severityStats[error.severity] = (severityStats[error.severity] || 0) + 1;
        });
        
        return {
            totalErrors: this.errorLog.length,
            recentErrors: recentErrors.length,
            categoryStats,
            severityStats,
            errorCounts: this.errorCounts,
            performanceMetrics: this.performanceMetrics
        };
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        this.errorCounts = {};
        this.saveErrorLog();
    }

    /**
     * Export error log for debugging
     * @returns {string} JSON string of error log
     */
    exportErrorLog() {
        return JSON.stringify({
            errorLog: this.errorLog,
            errorCounts: this.errorCounts,
            performanceMetrics: this.performanceMetrics,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }
}

// Create global instance
const errorHandler = new ErrorHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
} else {
    window.ErrorHandler = ErrorHandler;
    window.errorHandler = errorHandler;
}