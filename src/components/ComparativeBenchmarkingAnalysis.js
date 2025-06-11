/**
 * Comparative Analysis and Benchmarking Component
 * 
 * Provides comprehensive comparative analysis and benchmarking capabilities
 * for salary data across countries, roles, departments, and market standards.
 * 
 * Features:
 * - Country-wise salary comparisons
 * - Role benchmarking against market data
 * - Department comparative analysis
 * - Performance vs compensation benchmarks
 * - Cost of living adjustments
 * - Market positioning analysis
 * - Competitive intelligence insights
 */

class ComparativeBenchmarkingAnalysis {
    constructor() {
        this.container = null;
        this.data = [];
        this.benchmarkData = {};
        this.comparativeMetrics = {};
        this.marketData = {};
        
        // Chart configuration
        this.chartConfig = {
            width: 800,
            height: 400,
            margin: { top: 20, right: 80, bottom: 60, left: 80 },
            colors: {
                primary: '#2563eb',
                secondary: '#dc2626',
                tertiary: '#16a34a',
                quaternary: '#d97706',
                neutral: '#6b7280',
                above: '#16a34a',
                below: '#dc2626',
                atMarket: '#2563eb'
            }
        };
        
        // Market data (simplified - in real implementation, this would come from external APIs)
        this.marketBenchmarks = {
            'Software Engineer': {
                US: { p25: 85000, median: 95000, p75: 110000, avg: 98000 },
                India: { p25: 20000, median: 25000, p75: 32000, avg: 27000 },
                UK: { p25: 55000, median: 65000, p75: 75000, avg: 67000 },
                Canada: { p25: 70000, median: 80000, p75: 92000, avg: 82000 }
            },
            'Senior Software Engineer': {
                US: { p25: 115000, median: 130000, p75: 150000, avg: 135000 },
                India: { p25: 35000, median: 40000, p75: 48000, avg: 42000 },
                UK: { p25: 75000, median: 85000, p75: 98000, avg: 88000 },
                Canada: { p25: 95000, median: 110000, p75: 125000, avg: 112000 }
            },
            'Engineering Manager': {
                US: { p25: 140000, median: 160000, p75: 185000, avg: 165000 },
                India: { p25: 55000, median: 60000, p75: 70000, avg: 63000 },
                UK: { p25: 95000, median: 110000, p75: 130000, avg: 115000 },
                Canada: { p25: 120000, median: 140000, p75: 160000, avg: 145000 }
            },
            'Product Manager': {
                US: { p25: 120000, median: 140000, p75: 165000, avg: 145000 },
                India: { p25: 30000, median: 35000, p75: 42000, avg: 37000 },
                UK: { p25: 80000, median: 90000, p75: 105000, avg: 93000 },
                Canada: { p25: 100000, median: 115000, p75: 135000, avg: 118000 }
            },
            'Data Scientist': {
                US: { p25: 105000, median: 120000, p75: 140000, avg: 125000 },
                India: { p25: 25000, median: 30000, p75: 38000, avg: 32000 },
                UK: { p25: 65000, median: 75000, p75: 88000, avg: 78000 },
                Canada: { p25: 85000, median: 95000, p75: 110000, avg: 98000 }
            }
        };
        
        // Cost of living indices (base: US = 100)
        this.costOfLivingIndex = {
            US: 100,
            India: 25,
            UK: 85,
            Canada: 90,
            Germany: 80,
            Australia: 95
        };
    }

    /**
     * Initialize the component with container element
     */
    init(container) {
        this.container = container;
        this.render();
        return this;
    }

    /**
     * Update component with new employee data
     */
    updateData(employees) {
        this.data = employees.filter(emp => emp.salary && !isNaN(parseFloat(emp.salary)));
        this.calculateBenchmarks();
        this.calculateComparativeMetrics();
        this.updateCharts();
    }

    /**
     * Calculate benchmark comparisons
     */
    calculateBenchmarks() {
        this.benchmarkData = {
            byCountry: {},
            byRole: {},
            byDepartment: {},
            marketComparison: {},
            costAdjusted: {}
        };
        
        // Calculate by country
        const countries = [...new Set(this.data.map(emp => emp.country))];
        countries.forEach(country => {
            const countryEmployees = this.data.filter(emp => emp.country === country);
            this.benchmarkData.byCountry[country] = this.calculateCountryMetrics(countryEmployees);
        });
        
        // Calculate by role
        const roles = [...new Set(this.data.map(emp => emp.jobTitle))];
        roles.forEach(role => {
            const roleEmployees = this.data.filter(emp => emp.jobTitle === role);
            this.benchmarkData.byRole[role] = this.calculateRoleMetrics(roleEmployees, role);
        });
        
        // Calculate by department
        const departments = [...new Set(this.data.map(emp => emp.department))];
        departments.forEach(dept => {
            const deptEmployees = this.data.filter(emp => emp.department === dept);
            this.benchmarkData.byDepartment[dept] = this.calculateDepartmentMetrics(deptEmployees);
        });
        
        // Calculate market comparison
        this.calculateMarketComparison();
        
        // Calculate cost-adjusted salaries
        this.calculateCostAdjustedSalaries();
    }

    /**
     * Calculate country-specific metrics
     */
    calculateCountryMetrics(employees) {
        const salaries = employees.map(emp => parseFloat(emp.salary)).sort((a, b) => a - b);
        
        return {
            count: employees.length,
            min: Math.min(...salaries),
            max: Math.max(...salaries),
            median: this.calculatePercentile(salaries, 50),
            p25: this.calculatePercentile(salaries, 25),
            p75: this.calculatePercentile(salaries, 75),
            average: salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length,
            standardDeviation: this.calculateStandardDeviation(salaries),
            roles: this.getRoleDistribution(employees),
            departments: this.getDepartmentDistribution(employees)
        };
    }

    /**
     * Calculate role-specific metrics with market comparison
     */
    calculateRoleMetrics(employees, role) {
        const salaries = employees.map(emp => parseFloat(emp.salary)).sort((a, b) => a - b);
        const metrics = {
            count: employees.length,
            min: Math.min(...salaries),
            max: Math.max(...salaries),
            median: this.calculatePercentile(salaries, 50),
            p25: this.calculatePercentile(salaries, 25),
            p75: this.calculatePercentile(salaries, 75),
            average: salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length,
            byCountry: {},
            marketComparison: {}
        };
        
        // Calculate by country for this role
        const countries = [...new Set(employees.map(emp => emp.country))];
        countries.forEach(country => {
            const countryRoleEmployees = employees.filter(emp => emp.country === country);
            if (countryRoleEmployees.length > 0) {
                const countrySalaries = countryRoleEmployees.map(emp => parseFloat(emp.salary));
                metrics.byCountry[country] = {
                    count: countryRoleEmployees.length,
                    average: countrySalaries.reduce((sum, sal) => sum + sal, 0) / countrySalaries.length,
                    median: this.calculatePercentile(countrySalaries.sort((a, b) => a - b), 50)
                };
                
                // Compare to market data
                const marketData = this.marketBenchmarks[role]?.[country];
                if (marketData) {
                    metrics.marketComparison[country] = {
                        ourAverage: metrics.byCountry[country].average,
                        marketMedian: marketData.median,
                        marketAverage: marketData.avg,
                        percentilePosition: this.calculateMarketPercentile(
                            metrics.byCountry[country].average, 
                            marketData
                        ),
                        competitiveness: this.calculateCompetitiveness(
                            metrics.byCountry[country].average, 
                            marketData.median
                        )
                    };
                }
            }
        });
        
        return metrics;
    }

    /**
     * Calculate department-specific metrics
     */
    calculateDepartmentMetrics(employees) {
        const salaries = employees.map(emp => parseFloat(emp.salary)).sort((a, b) => a - b);
        
        return {
            count: employees.length,
            average: salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length,
            median: this.calculatePercentile(salaries, 50),
            roles: this.getRoleDistribution(employees),
            countries: this.getCountryDistribution(employees),
            performanceDistribution: this.getPerformanceDistribution(employees)
        };
    }

    /**
     * Calculate market comparison for all employees
     */
    calculateMarketComparison() {
        this.benchmarkData.marketComparison = {};
        
        this.data.forEach(emp => {
            const marketData = this.marketBenchmarks[emp.jobTitle]?.[emp.country];
            if (marketData) {
                const empSalary = parseFloat(emp.salary);
                const comparison = {
                    employee: emp.name,
                    role: emp.jobTitle,
                    country: emp.country,
                    currentSalary: empSalary,
                    marketMedian: marketData.median,
                    marketAverage: marketData.avg,
                    marketP25: marketData.p25,
                    marketP75: marketData.p75,
                    percentilePosition: this.calculateMarketPercentile(empSalary, marketData),
                    gapToMedian: empSalary - marketData.median,
                    gapPercentage: ((empSalary - marketData.median) / marketData.median) * 100,
                    competitiveness: this.calculateCompetitiveness(empSalary, marketData.median)
                };
                
                const key = `${emp.jobTitle}_${emp.country}`;
                if (!this.benchmarkData.marketComparison[key]) {
                    this.benchmarkData.marketComparison[key] = [];
                }
                this.benchmarkData.marketComparison[key].push(comparison);
            }
        });
    }

    /**
     * Calculate cost-adjusted salaries
     */
    calculateCostAdjustedSalaries() {
        this.benchmarkData.costAdjusted = {};
        
        const countries = [...new Set(this.data.map(emp => emp.country))];
        countries.forEach(country => {
            const countryEmployees = this.data.filter(emp => emp.country === country);
            const costIndex = this.costOfLivingIndex[country] || 100;
            
            this.benchmarkData.costAdjusted[country] = countryEmployees.map(emp => {
                const adjustedSalary = (parseFloat(emp.salary) / costIndex) * 100; // Normalize to US cost
                return {
                    ...emp,
                    originalSalary: parseFloat(emp.salary),
                    adjustedSalary: adjustedSalary,
                    costIndex: costIndex,
                    purchasingPower: adjustedSalary
                };
            });
        });
    }

    /**
     * Calculate comparative metrics across dimensions
     */
    calculateComparativeMetrics() {
        this.comparativeMetrics = {
            countryRankings: this.calculateCountryRankings(),
            roleCompetitiveness: this.calculateRoleCompetitiveness(),
            departmentEfficiency: this.calculateDepartmentEfficiency(),
            globalPositioning: this.calculateGlobalPositioning()
        };
    }

    /**
     * Calculate country rankings
     */
    calculateCountryRankings() {
        const rankings = Object.entries(this.benchmarkData.byCountry)
            .map(([country, metrics]) => ({
                country,
                averageSalary: metrics.average,
                medianSalary: metrics.median,
                employeeCount: metrics.count,
                costIndex: this.costOfLivingIndex[country] || 100,
                adjustedAverage: (metrics.average / (this.costOfLivingIndex[country] || 100)) * 100
            }))
            .sort((a, b) => b.adjustedAverage - a.adjustedAverage);
        
        return rankings;
    }

    /**
     * Calculate role competitiveness
     */
    calculateRoleCompetitiveness() {
        const competitiveness = {};
        
        Object.entries(this.benchmarkData.byRole).forEach(([role, metrics]) => {
            if (metrics.marketComparison) {
                const comparisons = Object.values(metrics.marketComparison);
                const avgCompetitiveness = comparisons.reduce((sum, comp) => 
                    sum + comp.competitiveness, 0) / comparisons.length;
                
                competitiveness[role] = {
                    averageCompetitiveness: avgCompetitiveness,
                    marketPosition: avgCompetitiveness > 0 ? 'above' : avgCompetitiveness < -10 ? 'below' : 'at',
                    countries: metrics.marketComparison
                };
            }
        });
        
        return competitiveness;
    }

    /**
     * Calculate department efficiency
     */
    calculateDepartmentEfficiency() {
        const efficiency = {};
        
        Object.entries(this.benchmarkData.byDepartment).forEach(([dept, metrics]) => {
            // Calculate efficiency as average performance rating vs average salary
            const avgPerformance = this.calculateAveragePerformance(
                this.data.filter(emp => emp.department === dept)
            );
            
            efficiency[dept] = {
                averageSalary: metrics.average,
                averagePerformance: avgPerformance,
                efficiency: avgPerformance / (metrics.average / 100000), // Performance per $100k
                employeeCount: metrics.count,
                costPerEmployee: metrics.average
            };
        });
        
        return efficiency;
    }

    /**
     * Calculate global positioning
     */
    calculateGlobalPositioning() {
        const totalEmployees = this.data.length;
        const totalPayroll = this.data.reduce((sum, emp) => sum + parseFloat(emp.salary), 0);
        const avgSalary = totalPayroll / totalEmployees;
        
        // Calculate positioning against market benchmarks
        let aboveMarket = 0;
        let atMarket = 0;
        let belowMarket = 0;
        
        this.data.forEach(emp => {
            const marketData = this.marketBenchmarks[emp.jobTitle]?.[emp.country];
            if (marketData) {
                const empSalary = parseFloat(emp.salary);
                const competitiveness = this.calculateCompetitiveness(empSalary, marketData.median);
                
                if (competitiveness > 5) aboveMarket++;
                else if (competitiveness < -5) belowMarket++;
                else atMarket++;
            }
        });
        
        return {
            totalEmployees,
            totalPayroll,
            averageSalary: avgSalary,
            marketPositioning: {
                aboveMarket: (aboveMarket / totalEmployees) * 100,
                atMarket: (atMarket / totalEmployees) * 100,
                belowMarket: (belowMarket / totalEmployees) * 100
            },
            competitivenessScore: ((aboveMarket + atMarket * 0.5) / totalEmployees) * 100
        };
    }

    /**
     * Calculate percentile
     */
    calculatePercentile(sortedArray, percentile) {
        const index = (percentile / 100) * (sortedArray.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;
        
        if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
        return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
    }

    /**
     * Calculate standard deviation
     */
    calculateStandardDeviation(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.sqrt(avgSquaredDiff);
    }

    /**
     * Calculate market percentile position
     */
    calculateMarketPercentile(salary, marketData) {
        if (salary <= marketData.p25) return 25;
        if (salary <= marketData.median) return 50;
        if (salary <= marketData.p75) return 75;
        return 90; // Above 75th percentile
    }

    /**
     * Calculate competitiveness percentage
     */
    calculateCompetitiveness(salary, marketMedian) {
        return ((salary - marketMedian) / marketMedian) * 100;
    }

    /**
     * Get role distribution
     */
    getRoleDistribution(employees) {
        const distribution = {};
        employees.forEach(emp => {
            distribution[emp.jobTitle] = (distribution[emp.jobTitle] || 0) + 1;
        });
        return distribution;
    }

    /**
     * Get department distribution
     */
    getDepartmentDistribution(employees) {
        const distribution = {};
        employees.forEach(emp => {
            distribution[emp.department] = (distribution[emp.department] || 0) + 1;
        });
        return distribution;
    }

    /**
     * Get country distribution
     */
    getCountryDistribution(employees) {
        const distribution = {};
        employees.forEach(emp => {
            distribution[emp.country] = (distribution[emp.country] || 0) + 1;
        });
        return distribution;
    }

    /**
     * Get performance distribution
     */
    getPerformanceDistribution(employees) {
        const distribution = {};
        employees.forEach(emp => {
            distribution[emp.performanceRating] = (distribution[emp.performanceRating] || 0) + 1;
        });
        return distribution;
    }

    /**
     * Calculate average performance
     */
    calculateAveragePerformance(employees) {
        const performanceMap = {
            'Exceeds Expectations': 5,
            'Meets Expectations': 4,
            'Below Expectations': 3,
            'Needs Improvement': 2,
            'Unsatisfactory': 1,
            '5': 5, '4': 4, '3': 3, '2': 2, '1': 1
        };
        
        const validRatings = employees
            .map(emp => performanceMap[emp.performanceRating])
            .filter(rating => rating !== undefined);
        
        return validRatings.length > 0 ? 
            validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length : 0;
    }

    /**
     * Render the main component structure
     */
    render() {
        this.container.innerHTML = `
            <div class="comparative-benchmarking-analysis">
                <div class="analysis-header">
                    <h3>Comparative Analysis & Benchmarking</h3>
                    <div class="analysis-controls">
                        <select id="comparisonType" class="form-select">
                            <option value="country">Country Comparison</option>
                            <option value="role">Role Benchmarking</option>
                            <option value="department">Department Analysis</option>
                            <option value="market">Market Positioning</option>
                        </select>
                        <select id="adjustmentType" class="form-select">
                            <option value="nominal">Nominal Salaries</option>
                            <option value="adjusted">Cost-Adjusted</option>
                            <option value="market">Market-Relative</option>
                        </select>
                        <button id="exportBenchmarks" class="btn btn-secondary">Export Report</button>
                    </div>
                </div>
                
                <div class="benchmark-summary">
                    <div class="summary-cards">
                        <div class="summary-card global-position">
                            <h4>Global Competitiveness</h4>
                            <div class="card-value" id="competitivenessScore">0%</div>
                            <div class="card-subtitle">market competitive</div>
                        </div>
                        <div class="summary-card above-market">
                            <h4>Above Market</h4>
                            <div class="card-value" id="aboveMarketPercent">0%</div>
                            <div class="card-subtitle">of employees</div>
                        </div>
                        <div class="summary-card below-market">
                            <h4>Below Market</h4>
                            <div class="card-value" id="belowMarketPercent">0%</div>
                            <div class="card-subtitle">of employees</div>
                        </div>
                        <div class="summary-card cost-efficiency">
                            <h4>Cost Efficiency</h4>
                            <div class="card-value" id="costEfficiency">0</div>
                            <div class="card-subtitle">performance per $100k</div>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-content">
                    <div class="chart-section">
                        <div class="chart-container">
                            <canvas id="benchmarkChart" width="800" height="400"></canvas>
                        </div>
                        
                        <div class="chart-controls">
                            <div class="chart-tabs">
                                <button class="chart-tab active" data-chart="comparison">Salary Comparison</button>
                                <button class="chart-tab" data-chart="distribution">Distribution Analysis</button>
                                <button class="chart-tab" data-chart="market">Market Positioning</button>
                                <button class="chart-tab" data-chart="trends">Trend Analysis</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analysis-sidebar">
                        <div class="rankings-panel">
                            <h4>Country Rankings</h4>
                            <div id="countryRankings"></div>
                        </div>
                        
                        <div class="competitiveness-panel">
                            <h4>Role Competitiveness</h4>
                            <div id="roleCompetitiveness"></div>
                        </div>
                        
                        <div class="insights-panel">
                            <h4>Key Insights</h4>
                            <div id="benchmarkInsights"></div>
                        </div>
                    </div>
                </div>
                
                <div class="detailed-analysis">
                    <div class="tabs">
                        <button class="tab-button active" data-tab="country-details">Country Details</button>
                        <button class="tab-button" data-tab="role-benchmarks">Role Benchmarks</button>
                        <button class="tab-button" data-tab="market-analysis">Market Analysis</button>
                        <button class="tab-button" data-tab="recommendations">Recommendations</button>
                    </div>
                    
                    <div class="tab-content">
                        <div id="country-details" class="tab-panel active">
                            <div id="countryDetailsContent"></div>
                        </div>
                        <div id="role-benchmarks" class="tab-panel">
                            <div id="roleBenchmarksContent"></div>
                        </div>
                        <div id="market-analysis" class="tab-panel">
                            <div id="marketAnalysisContent"></div>
                        </div>
                        <div id="recommendations" class="tab-panel">
                            <div id="recommendationsContent"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
        this.initializeChart();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Comparison type selection
        const comparisonType = this.container.querySelector('#comparisonType');
        comparisonType?.addEventListener('change', (e) => {
            this.updateComparisonType(e.target.value);
        });
        
        // Adjustment type selection
        const adjustmentType = this.container.querySelector('#adjustmentType');
        adjustmentType?.addEventListener('change', (e) => {
            this.updateAdjustmentType(e.target.value);
        });
        
        // Chart tabs
        const chartTabs = this.container.querySelectorAll('.chart-tab');
        chartTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchChartTab(e.target.dataset.chart);
            });
        });
        
        // Analysis tabs
        const tabButtons = this.container.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Export button
        const exportBtn = this.container.querySelector('#exportBenchmarks');
        exportBtn?.addEventListener('click', () => {
            this.exportBenchmarkReport();
        });
    }

    /**
     * Initialize the chart canvas
     */
    initializeChart() {
        const canvas = this.container.querySelector('#benchmarkChart');
        if (!canvas) return;
        
        this.ctx = canvas.getContext('2d');
    }

    /**
     * Update all charts and displays
     */
    updateCharts() {
        this.updateSummaryCards();
        this.updateBenchmarkChart();
        this.updateCountryRankings();
        this.updateRoleCompetitiveness();
        this.updateInsights();
        this.updateDetailedAnalysis();
    }

    /**
     * Update summary cards
     */
    updateSummaryCards() {
        const globalPos = this.comparativeMetrics.globalPositioning;
        if (!globalPos) return;
        
        this.container.querySelector('#competitivenessScore').textContent = 
            `${globalPos.competitivenessScore.toFixed(1)}%`;
        this.container.querySelector('#aboveMarketPercent').textContent = 
            `${globalPos.marketPositioning.aboveMarket.toFixed(1)}%`;
        this.container.querySelector('#belowMarketPercent').textContent = 
            `${globalPos.marketPositioning.belowMarket.toFixed(1)}%`;
        
        // Calculate overall cost efficiency
        const deptEfficiencies = Object.values(this.comparativeMetrics.departmentEfficiency || {});
        const avgEfficiency = deptEfficiencies.length > 0 ? 
            deptEfficiencies.reduce((sum, dept) => sum + dept.efficiency, 0) / deptEfficiencies.length : 0;
        this.container.querySelector('#costEfficiency').textContent = avgEfficiency.toFixed(2);
    }

    /**
     * Update benchmark chart
     */
    updateBenchmarkChart() {
        const activeTab = this.container.querySelector('.chart-tab.active')?.dataset.chart || 'comparison';
        
        switch (activeTab) {
            case 'comparison':
                this.renderComparisonChart();
                break;
            case 'distribution':
                this.renderDistributionChart();
                break;
            case 'market':
                this.renderMarketPositioningChart();
                break;
            case 'trends':
                this.renderTrendChart();
                break;
        }
    }

    /**
     * Render salary comparison chart
     */
    renderComparisonChart() {
        if (!this.ctx || !this.benchmarkData.byCountry) return;
        
        const { width, height, margin } = this.chartConfig;
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        const countries = Object.keys(this.benchmarkData.byCountry);
        const averages = countries.map(country => this.benchmarkData.byCountry[country].average);
        const maxValue = Math.max(...averages) * 1.1;
        
        // Draw bars
        const barWidth = plotWidth / (countries.length * 1.5);
        const spacing = barWidth * 0.5;
        
        countries.forEach((country, i) => {
            const x = margin.left + i * (barWidth + spacing);
            const barHeight = (averages[i] / maxValue) * plotHeight;
            const y = margin.top + plotHeight - barHeight;
            
            // Draw bar
            this.ctx.fillStyle = this.chartConfig.colors.primary;
            this.ctx.fillRect(x, y, barWidth, barHeight);
            
            // Add value label
            this.ctx.fillStyle = '#374151';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.formatCurrency(averages[i]), x + barWidth / 2, y - 5);
            
            // Add country label
            this.ctx.fillText(country, x + barWidth / 2, margin.top + plotHeight + 20);
        });
        
        // Add title
        this.ctx.fillStyle = '#1f2937';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Average Salary by Country', width / 2, 20);
    }

    /**
     * Update country rankings
     */
    updateCountryRankings() {
        const container = this.container.querySelector('#countryRankings');
        if (!container) return;
        
        const rankings = this.comparativeMetrics.countryRankings || [];
        
        container.innerHTML = rankings.map((country, index) => `
            <div class="ranking-item">
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-details">
                    <div class="country-name">${country.country}</div>
                    <div class="country-metrics">
                        <span class="metric">Avg: ${this.formatCurrency(country.averageSalary)}</span>
                        <span class="metric">Adjusted: ${this.formatCurrency(country.adjustedAverage)}</span>
                    </div>
                </div>
                <div class="employee-count">${country.employeeCount}</div>
            </div>
        `).join('');
    }

    /**
     * Update role competitiveness
     */
    updateRoleCompetitiveness() {
        const container = this.container.querySelector('#roleCompetitiveness');
        if (!container) return;
        
        const competitiveness = this.comparativeMetrics.roleCompetitiveness || {};
        
        container.innerHTML = Object.entries(competitiveness).map(([role, data]) => `
            <div class="competitiveness-item ${data.marketPosition}">
                <div class="role-name">${role}</div>
                <div class="competitiveness-score">${data.averageCompetitiveness.toFixed(1)}%</div>
                <div class="market-position">${data.marketPosition} market</div>
            </div>
        `).join('');
    }

    /**
     * Update insights panel
     */
    updateInsights() {
        const container = this.container.querySelector('#benchmarkInsights');
        if (!container) return;
        
        const insights = this.generateBenchmarkInsights();
        
        container.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-content">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-description">${insight.description}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Generate benchmark insights
     */
    generateBenchmarkInsights() {
        const insights = [];
        const globalPos = this.comparativeMetrics.globalPositioning;
        
        if (!globalPos) return insights;
        
        // Market positioning insight
        if (globalPos.marketPositioning.belowMarket > 30) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Below Market Risk',
                description: `${globalPos.marketPositioning.belowMarket.toFixed(1)}% of employees are below market rates, risking retention.`
            });
        } else if (globalPos.marketPositioning.aboveMarket > 60) {
            insights.push({
                type: 'info',
                icon: '💰',
                title: 'Premium Positioning',
                description: `${globalPos.marketPositioning.aboveMarket.toFixed(1)}% of employees are above market, indicating premium compensation strategy.`
            });
        }
        
        // Country competitiveness
        const rankings = this.comparativeMetrics.countryRankings || [];
        if (rankings.length > 1) {
            const topCountry = rankings[0];
            const bottomCountry = rankings[rankings.length - 1];
            const gap = ((topCountry.adjustedAverage - bottomCountry.adjustedAverage) / bottomCountry.adjustedAverage) * 100;
            
            if (gap > 50) {
                insights.push({
                    type: 'warning',
                    icon: '🌍',
                    title: 'Large Country Gap',
                    description: `${gap.toFixed(1)}% salary gap between ${topCountry.country} and ${bottomCountry.country} may create equity concerns.`
                });
            }
        }
        
        // Role competitiveness
        const roleComp = this.comparativeMetrics.roleCompetitiveness || {};
        const belowMarketRoles = Object.entries(roleComp)
            .filter(([, data]) => data.marketPosition === 'below').length;
        
        if (belowMarketRoles > 0) {
            insights.push({
                type: 'error',
                icon: '📉',
                title: 'Role Competitiveness Risk',
                description: `${belowMarketRoles} role(s) are below market rates, requiring immediate attention.`
            });
        }
        
        return insights;
    }

    /**
     * Update detailed analysis tabs
     */
    updateDetailedAnalysis() {
        this.updateCountryDetails();
        this.updateRoleBenchmarks();
        this.updateMarketAnalysis();
        this.updateRecommendations();
    }

    /**
     * Update country details tab
     */
    updateCountryDetails() {
        const container = this.container.querySelector('#countryDetailsContent');
        if (!container) return;
        
        const countries = Object.entries(this.benchmarkData.byCountry || {});
        
        container.innerHTML = `
            <div class="country-details-table">
                <table>
                    <thead>
                        <tr>
                            <th>Country</th>
                            <th>Employees</th>
                            <th>Avg Salary</th>
                            <th>Median</th>
                            <th>Cost Index</th>
                            <th>Adjusted Avg</th>
                            <th>Std Dev</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${countries.map(([country, metrics]) => {
                            const costIndex = this.costOfLivingIndex[country] || 100;
                            const adjustedAvg = (metrics.average / costIndex) * 100;
                            
                            return `
                                <tr>
                                    <td>${country}</td>
                                    <td>${metrics.count}</td>
                                    <td>${this.formatCurrency(metrics.average)}</td>
                                    <td>${this.formatCurrency(metrics.median)}</td>
                                    <td>${costIndex}</td>
                                    <td>${this.formatCurrency(adjustedAvg)}</td>
                                    <td>${this.formatCurrency(metrics.standardDeviation)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Switch chart tab
     */
    switchChartTab(chartType) {
        // Update tab buttons
        this.container.querySelectorAll('.chart-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        this.container.querySelector(`[data-chart="${chartType}"]`)?.classList.add('active');
        
        // Update chart
        this.updateBenchmarkChart();
    }

    /**
     * Switch analysis tab
     */
    switchTab(tabId) {
        // Update tab buttons
        this.container.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        this.container.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
        
        // Update tab panels
        this.container.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        this.container.querySelector(`#${tabId}`)?.classList.add('active');
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
     * Export benchmark report
     */
    exportBenchmarkReport() {
        const reportData = {
            benchmarkData: this.benchmarkData,
            comparativeMetrics: this.comparativeMetrics,
            insights: this.generateBenchmarkInsights(),
            marketData: this.marketBenchmarks,
            costOfLivingIndex: this.costOfLivingIndex,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `benchmark-analysis-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Placeholder methods for remaining functionality
    updateComparisonType(type) {
        // Implementation for different comparison types
    }

    updateAdjustmentType(type) {
        // Implementation for different adjustment types
    }

    renderDistributionChart() {
        // Implementation for distribution analysis
    }

    renderMarketPositioningChart() {
        // Implementation for market positioning visualization
    }

    renderTrendChart() {
        // Implementation for trend analysis
    }

    updateRoleBenchmarks() {
        // Implementation for detailed role benchmarks
    }

    updateMarketAnalysis() {
        // Implementation for market analysis details
    }

    updateRecommendations() {
        // Implementation for recommendations generation
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComparativeBenchmarkingAnalysis;
} else if (typeof window !== 'undefined') {
    window.ComparativeBenchmarkingAnalysis = ComparativeBenchmarkingAnalysis;
}