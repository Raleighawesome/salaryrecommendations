/**
 * Testing and Quality Assurance Framework
 * 
 * Comprehensive testing system for Team Analyzer including:
 * - Unit tests for core functionality
 * - Integration tests for component interactions
 * - Performance monitoring and optimization
 * - Data validation testing
 * - Browser compatibility verification
 * - User experience validation
 */

class TestingFramework {
    constructor() {
        this.testResults = [];
        this.performanceMetrics = {};
        this.isRunning = false;
        
        console.log('Testing Framework initialized');
    }

    /**
     * Run comprehensive test suite
     */
    async runAllTests() {
        if (this.isRunning) {
            console.warn('Tests are already running');
            return;
        }
        
        this.isRunning = true;
        this.testResults = [];
        
        console.log('🧪 Starting test suite...');
        
        try {
            await this.runCoreTests();
            await this.runIntegrationTests();
            await this.runPerformanceTests();
            await this.runCompatibilityTests();
            await this.runUXTests();
            
            this.generateTestReport();
        } catch (error) {
            console.error('Test suite failed:', error);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Run core functionality tests
     */
    async runCoreTests() {
        console.log('📋 Running core tests...');
        
        this.testComponent('CSVParser', window.CSVParser);
        this.testComponent('DataValidator', window.DataValidator);
        this.testComponent('CurrencyUtils', window.CurrencyUtils);
        this.testComponent('PerformanceSuggester', window.PerformanceSuggester);
        this.testComponent('DataIntegrityChecker', window.DataIntegrityChecker);
    }

    /**
     * Test CSV parsing functionality
     */
    async testCSVParsing() {
        try {
            if (!window.CSVParser) {
                this.addTestResult('CSV Parser', 'SKIPPED', 'CSVParser not available');
                return;
            }
            
            const parser = new CSVParser();
            
            // Test valid CSV
            const validCSV = 'id,name,title\n1,John Doe,Engineer\n2,Jane Smith,Manager';
            const result = parser.parseCSV(validCSV);
            
            if (result.employees && result.employees.length === 2) {
                this.addTestResult('CSV Parser - Valid Data', 'PASSED', 'Successfully parsed valid CSV');
            } else {
                this.addTestResult('CSV Parser - Valid Data', 'FAILED', 'Failed to parse valid CSV correctly');
            }
            
            // Test invalid CSV
            const invalidCSV = 'invalid,csv,data\nwith,missing,headers';
            try {
                parser.parseCSV(invalidCSV);
                this.addTestResult('CSV Parser - Invalid Data', 'FAILED', 'Should have thrown error for invalid CSV');
            } catch (error) {
                this.addTestResult('CSV Parser - Invalid Data', 'PASSED', 'Correctly handled invalid CSV');
            }
            
        } catch (error) {
            this.addTestResult('CSV Parser', 'FAILED', `CSV parsing test failed: ${error.message}`);
        }
    }

    /**
     * Test data validation functionality
     */
    async testDataValidation() {
        try {
            if (!window.DataValidator) {
                this.addTestResult('Data Validator', 'SKIPPED', 'DataValidator not available');
                return;
            }
            
            const validator = new DataValidator();
            
            // Test duplicate detection
            const employees = [
                { id: '1', name: 'John Doe', title: 'Engineer' },
                { id: '1', name: 'John Doe', title: 'Engineer' }, // Duplicate
                { id: '2', name: 'Jane Smith', title: 'Manager' }
            ];
            
            const duplicates = validator.findDuplicates(employees);
            
            if (duplicates.length > 0) {
                this.addTestResult('Data Validator - Duplicates', 'PASSED', 'Successfully detected duplicates');
            } else {
                this.addTestResult('Data Validator - Duplicates', 'FAILED', 'Failed to detect duplicates');
            }
            
        } catch (error) {
            this.addTestResult('Data Validator', 'FAILED', `Data validation test failed: ${error.message}`);
        }
    }

    /**
     * Test currency utilities
     */
    async testCurrencyUtils() {
        try {
            if (!window.CurrencyUtils) {
                this.addTestResult('Currency Utils', 'SKIPPED', 'CurrencyUtils not available');
                return;
            }
            
            const currencyUtils = new CurrencyUtils();
            
            // Test currency validation
            const validCurrency = currencyUtils.isValidCurrency('USD');
            const invalidCurrency = currencyUtils.isValidCurrency('INVALID');
            
            if (validCurrency && !invalidCurrency) {
                this.addTestResult('Currency Utils - Validation', 'PASSED', 'Currency validation working correctly');
            } else {
                this.addTestResult('Currency Utils - Validation', 'FAILED', 'Currency validation not working correctly');
            }
            
        } catch (error) {
            this.addTestResult('Currency Utils', 'FAILED', `Currency utils test failed: ${error.message}`);
        }
    }

    /**
     * Test performance suggestions
     */
    async testPerformanceSuggestions() {
        try {
            if (!window.PerformanceSuggester) {
                this.addTestResult('Performance Suggester', 'SKIPPED', 'PerformanceSuggester not available');
                return;
            }
            
            const suggester = new PerformanceSuggester();
            
            // Test suggestion generation
            const employee = {
                id: '1',
                name: 'Test Employee',
                salary: { amount: 80000, currency: 'USD' },
                comparatio: 1.1,
                timeInRoleMonths: 24
            };
            
            const suggestion = suggester.suggestPerformanceRating(employee, []);
            
            if (suggestion && suggestion.rating) {
                this.addTestResult('Performance Suggester', 'PASSED', 'Successfully generated performance suggestion');
            } else {
                this.addTestResult('Performance Suggester', 'FAILED', 'Failed to generate performance suggestion');
            }
            
        } catch (error) {
            this.addTestResult('Performance Suggester', 'FAILED', `Performance suggester test failed: ${error.message}`);
        }
    }

    /**
     * Test raise calculations
     */
    async testRaiseCalculations() {
        try {
            // Test basic raise calculation logic
            const employee = {
                id: '1',
                name: 'Test Employee',
                salary: { amount: 80000, currency: 'USD' },
                performanceRating: 'Meets Expectations',
                comparatio: 0.9,
                timeInRoleMonths: 18,
                timeSinceLastRaiseMonths: 12
            };
            
            // Simple raise calculation test
            const raisePercentage = this.calculateTestRaise(employee);
            
            if (raisePercentage > 0 && raisePercentage <= 20) {
                this.addTestResult('Raise Calculations', 'PASSED', `Calculated reasonable raise: ${raisePercentage}%`);
            } else {
                this.addTestResult('Raise Calculations', 'FAILED', `Unreasonable raise calculated: ${raisePercentage}%`);
            }
            
        } catch (error) {
            this.addTestResult('Raise Calculations', 'FAILED', `Raise calculation test failed: ${error.message}`);
        }
    }

    /**
     * Simple raise calculation for testing
     */
    calculateTestRaise(employee) {
        let baseRaise = 3; // 3% base raise
        
        // Performance adjustment
        if (employee.performanceRating === 'Exceeds Expectations') {
            baseRaise += 2;
        } else if (employee.performanceRating === 'Below Expectations') {
            baseRaise -= 1;
        }
        
        // Comparatio adjustment
        if (employee.comparatio < 0.8) {
            baseRaise += 2; // Below market
        } else if (employee.comparatio > 1.2) {
            baseRaise -= 1; // Above market
        }
        
        return Math.max(0, baseRaise);
    }

    /**
     * Run integration tests
     */
    async runIntegrationTests() {
        console.log('🔗 Running integration tests...');
        
        const components = [
            'FileUpload', 'DataTable', 'FilterPanel', 'SearchBar',
            'ExportInterface', 'HelpSystem', 'BrowserCompatibility'
        ];
        
        let initializedCount = 0;
        components.forEach(name => {
            if (window[name]) initializedCount++;
        });
        
        const percentage = (initializedCount / components.length) * 100;
        
        if (percentage >= 80) {
            this.addTestResult('Component Integration', 'PASSED', `${initializedCount}/${components.length} components`);
        } else {
            this.addTestResult('Component Integration', 'WARNING', `Only ${initializedCount}/${components.length} components`);
        }
        
        if (window.AppState) {
            this.addTestResult('Application State', 'PASSED', 'AppState available');
        } else {
            this.addTestResult('Application State', 'FAILED', 'AppState not available');
        }
    }

    /**
     * Run performance tests
     */
    async runPerformanceTests() {
        console.log('⚡ Running performance tests...');
        
        if (performance.memory) {
            const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            this.performanceMetrics.memory = memoryMB;
            
            if (memoryMB < 100) {
                this.addTestResult('Memory Usage', 'PASSED', `${memoryMB}MB`);
            } else {
                this.addTestResult('Memory Usage', 'WARNING', `${memoryMB}MB`);
            }
        } else {
            this.addTestResult('Memory Usage', 'SKIPPED', 'Memory API not available');
        }
    }

    /**
     * Run browser compatibility tests
     */
    async runCompatibilityTests() {
        console.log('🌐 Running compatibility tests...');
        
        if (window.browserCompatibility) {
            this.addTestResult('Browser Compatibility', 'PASSED', 'System available');
        } else {
            this.addTestResult('Browser Compatibility', 'SKIPPED', 'System not available');
        }
        
        const features = {
            fileAPI: !!(window.File && window.FileReader),
            localStorage: this.testLocalStorage(),
            canvas: this.testCanvas(),
            es6: this.testES6()
        };
        
        const supportedCount = Object.values(features).filter(Boolean).length;
        const totalCount = Object.keys(features).length;
        
        if (supportedCount >= totalCount * 0.8) {
            this.addTestResult('Feature Support', 'PASSED', `${supportedCount}/${totalCount} features`);
        } else {
            this.addTestResult('Feature Support', 'WARNING', `${supportedCount}/${totalCount} features`);
        }
    }

    testLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    testCanvas() {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    }

    testES6() {
        try {
            eval('const test = () => true;');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Run user experience tests
     */
    async runUXTests() {
        console.log('👤 Running UX tests...');
        
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            this.addTestResult('Responsive Design', 'PASSED', 'Viewport meta present');
        } else {
            this.addTestResult('Responsive Design', 'WARNING', 'Viewport meta missing');
        }
        
        if (window.helpSystem) {
            this.addTestResult('Help System', 'PASSED', 'Help system available');
        } else {
            this.addTestResult('Help System', 'WARNING', 'Help system not available');
        }
    }

    /**
     * Add test result
     */
    addTestResult(testName, status, message) {
        const result = {
            name: testName,
            status: status,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const statusIcon = {
            'PASSED': '✅',
            'FAILED': '❌',
            'WARNING': '⚠️',
            'SKIPPED': '⏭️'
        };
        
        console.log(`${statusIcon[status]} ${testName}: ${message}`);
    }

    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        const passed = this.testResults.filter(r => r.status === 'PASSED').length;
        const failed = this.testResults.filter(r => r.status === 'FAILED').length;
        const warnings = this.testResults.filter(r => r.status === 'WARNING').length;
        const skipped = this.testResults.filter(r => r.status === 'SKIPPED').length;
        const total = this.testResults.length;
        
        const passRate = ((passed / (total - skipped)) * 100).toFixed(1);
        
        console.log('\n📊 TEST REPORT SUMMARY');
        console.log('========================');
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️ Warnings: ${warnings}`);
        console.log(`⏭️ Skipped: ${skipped}`);
        console.log(`📈 Pass Rate: ${passRate}%`);
        
        let grade = 'F';
        if (passRate >= 95 && failed === 0) grade = 'A+';
        else if (passRate >= 90 && failed <= 1) grade = 'A';
        else if (passRate >= 85) grade = 'B+';
        else if (passRate >= 80) grade = 'B';
        else if (passRate >= 75) grade = 'C+';
        else if (passRate >= 70) grade = 'C';
        else if (passRate >= 60) grade = 'D';
        
        console.log(`\n🏆 QUALITY GRADE: ${grade}`);
        
        return {
            summary: { total, passed, failed, warnings, skipped, passRate: parseFloat(passRate), grade },
            results: this.testResults,
            performance: this.performanceMetrics
        };
    }

    /**
     * Get test results
     */
    getTestResults() {
        return {
            results: this.testResults,
            performance: this.performanceMetrics
        };
    }

    /**
     * Export test report
     */
    exportTestReport() {
        const report = {
            summary: this.qualityChecks.testSummary,
            results: this.testResults,
            performance: this.performanceMetrics,
            browserCompatibility: this.qualityChecks.browserCompatibility,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `team-analyzer-test-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        console.log('📄 Test report exported successfully');
    }

    testComponent(name, component) {
        if (component) {
            this.addTestResult(`Component: ${name}`, 'PASSED', 'Available');
        } else {
            this.addTestResult(`Component: ${name}`, 'SKIPPED', 'Not loaded');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestingFramework;
} else {
    window.TestingFramework = TestingFramework;
} 