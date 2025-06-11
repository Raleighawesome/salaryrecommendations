/**
 * Analytics Dashboard Component
 * 
 * Provides comprehensive team analytics with key metrics, visualizations,
 * and insights for salary analysis and decision making.
 */

class AnalyticsDashboard {
    constructor(container) {
        this.container = container;
        this.employees = [];
        this.analytics = {};
        this.charts = {};
        this.filters = {
            country: 'all',
            department: 'all',
            performance: 'all',
            timeframe: '12months'
        };
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="analytics-dashboard">
                <div class="dashboard-header">
                    <h2>Team Analytics Dashboard</h2>
                    <p>Comprehensive insights and metrics for your team's compensation and performance</p>
                </div>
                
                <div class="dashboard-filters">
                    <div class="filters-row">
                        <div class="filter-group">
                            <label for="country-filter">Country</label>
                            <select id="country-filter">
                                <option value="all">All Countries</option>
                                <option value="US">United States</option>
                                <option value="India">India</option>
                                <option value="UK">United Kingdom</option>
                                <option value="Canada">Canada</option>
                                <option value="Germany">Germany</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="department-filter">Department</label>
                            <select id="department-filter">
                                <option value="all">All Departments</option>
                                <!-- Will be populated dynamically -->
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="performance-filter">Performance</label>
                            <select id="performance-filter">
                                <option value="all">All Ratings</option>
                                <option value="5">5 - Far Exceeds</option>
                                <option value="4">4 - Exceeds</option>
                                <option value="3">3 - Meets</option>
                                <option value="2">2 - Meets Some</option>
                                <option value="1">1 - Below</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <button id="refresh-analytics" class="btn btn-primary">
                                Refresh Analytics
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="key-metrics">
                    <h3>Key Metrics</h3>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <h4>Total Employees</h4>
                            <span class="metric-value" id="total-employees">0</span>
                            <span class="metric-change" id="employee-change">+0%</span>
                        </div>
                        
                        <div class="metric-card">
                            <h4>Average Salary</h4>
                            <span class="metric-value" id="average-salary">$0</span>
                            <span class="metric-change" id="salary-change">+0%</span>
                        </div>
                        
                        <div class="metric-card">
                            <h4>Median Salary</h4>
                            <span class="metric-value" id="median-salary">$0</span>
                            <span class="metric-change" id="median-change">+0%</span>
                        </div>
                        
                        <div class="metric-card">
                            <h4>Total Payroll</h4>
                            <span class="metric-value" id="total-payroll">$0</span>
                            <span class="metric-change" id="payroll-change">+0%</span>
                        </div>
                        
                        <div class="metric-card">
                            <h4>Avg Performance</h4>
                            <span class="metric-value" id="average-performance">0.0</span>
                            <span class="metric-change" id="performance-change">+0%</span>
                        </div>
                        
                        <div class="metric-card">
                            <h4>Flight Risk</h4>
                            <span class="metric-value" id="flight-risk-count">0</span>
                            <span class="metric-change" id="risk-change">+0%</span>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-sections">
                    <div class="analytics-row">
                        <div class="analytics-card">
                            <h4>Salary Distribution</h4>
                            <div class="chart-container">
                                <canvas id="salary-distribution-chart"></canvas>
                            </div>
                            <div class="chart-insights" id="salary-insights">
                                <!-- Insights will be populated here -->
                            </div>
                        </div>
                        
                        <div class="analytics-card">
                            <h4>Performance Distribution</h4>
                            <div class="chart-container">
                                <canvas id="performance-distribution-chart"></canvas>
                            </div>
                            <div class="chart-insights" id="performance-insights">
                                <!-- Insights will be populated here -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-row">
                        <div class="analytics-card">
                            <h4>Salary vs Performance</h4>
                            <div class="chart-container">
                                <canvas id="salary-performance-chart"></canvas>
                            </div>
                            <div class="chart-insights" id="correlation-insights">
                                <!-- Insights will be populated here -->
                            </div>
                        </div>
                        
                        <div class="analytics-card">
                            <h4>Country Comparison</h4>
                            <div class="chart-container">
                                <canvas id="country-comparison-chart"></canvas>
                            </div>
                            <div class="chart-insights" id="country-insights">
                                <!-- Insights will be populated here -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="analytics-row">
                        <div class="analytics-card full-width">
                            <h4>Tenure vs Compensation Analysis</h4>
                            <div class="chart-container">
                                <canvas id="tenure-compensation-chart"></canvas>
                            </div>
                            <div class="chart-insights" id="tenure-insights">
                                <!-- Insights will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="detailed-analytics">
                    <h3>Detailed Analysis</h3>
                    
                    <div class="analysis-tabs">
                        <button class="tab-button active" data-tab="equity">Pay Equity</button>
                        <button class="tab-button" data-tab="performance">Performance Analysis</button>
                        <button class="tab-button" data-tab="risk">Risk Assessment</button>
                        <button class="tab-button" data-tab="trends">Trends & Patterns</button>
                    </div>
                    
                    <div class="tab-content">
                        <div class="tab-panel active" id="equity-panel">
                            <div class="equity-analysis">
                                <h4>Pay Equity Analysis</h4>
                                <div class="equity-metrics">
                                    <div class="equity-card">
                                        <h5>Gender Pay Gap</h5>
                                        <span class="equity-value" id="gender-gap">N/A</span>
                                    </div>
                                    <div class="equity-card">
                                        <h5>Performance Pay Correlation</h5>
                                        <span class="equity-value" id="performance-correlation">N/A</span>
                                    </div>
                                    <div class="equity-card">
                                        <h5>Country Pay Variance</h5>
                                        <span class="equity-value" id="country-variance">N/A</span>
                                    </div>
                                </div>
                                <div class="equity-recommendations" id="equity-recommendations">
                                    <!-- Recommendations will be populated here -->
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-panel" id="performance-panel">
                            <div class="performance-analysis">
                                <h4>Performance Analysis</h4>
                                <div class="performance-breakdown" id="performance-breakdown">
                                    <!-- Performance breakdown will be populated here -->
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-panel" id="risk-panel">
                            <div class="risk-analysis">
                                <h4>Risk Assessment</h4>
                                <div class="risk-breakdown" id="risk-breakdown">
                                    <!-- Risk breakdown will be populated here -->
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-panel" id="trends-panel">
                            <div class="trends-analysis">
                                <h4>Trends & Patterns</h4>
                                <div class="trends-content" id="trends-content">
                                    <!-- Trends content will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-actions">
                    <button id="export-analytics" class="btn btn-secondary">
                        Export Analytics Report
                    </button>
                    <button id="schedule-report" class="btn btn-primary">
                        Schedule Regular Report
                    </button>
                    <button id="share-insights" class="btn btn-outline">
                        Share Insights
                    </button>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Filter controls
        ['country-filter', 'department-filter', 'performance-filter'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.applyFilters();
            });
        });
        
        // Refresh analytics
        document.getElementById('refresh-analytics').addEventListener('click', () => {
            this.refreshAnalytics();
        });
        
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Action buttons
        document.getElementById('export-analytics').addEventListener('click', () => {
            this.exportAnalyticsReport();
        });
        
        document.getElementById('schedule-report').addEventListener('click', () => {
            this.scheduleReport();
        });
        
        document.getElementById('share-insights').addEventListener('click', () => {
            this.shareInsights();
        });
    }
    
    setEmployees(employees) {
        this.employees = employees;
        this.populateDepartmentFilter();
        this.calculateAnalytics();
        this.updateDashboard();
        console.log(`Analytics dashboard loaded ${employees.length} employees`);
    }
    
    populateDepartmentFilter() {
        const departments = [...new Set(this.employees.map(emp => emp.department).filter(Boolean))];
        const select = document.getElementById('department-filter');
        
        // Clear existing options except "All Departments"
        select.innerHTML = '<option value="all">All Departments</option>';
        
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            select.appendChild(option);
        });
    }
    
    calculateAnalytics() {
        const filtered = this.getFilteredEmployees();
        
        this.analytics = {
            basic: this.calculateBasicMetrics(filtered),
            distribution: this.calculateDistributions(filtered),
            correlation: this.calculateCorrelations(filtered),
            equity: this.calculateEquityMetrics(filtered),
            risk: this.calculateRiskMetrics(filtered),
            trends: this.calculateTrends(filtered)
        };
    }
    
    calculateBasicMetrics(employees) {
        if (employees.length === 0) {
            return {
                totalEmployees: 0,
                averageSalary: 0,
                medianSalary: 0,
                totalPayroll: 0,
                averagePerformance: 0,
                flightRiskCount: 0
            };
        }
        
        const salaries = employees.map(emp => emp.currentSalary).sort((a, b) => a - b);
        const performances = employees.map(emp => emp.performance).filter(p => p);
        
        return {
            totalEmployees: employees.length,
            averageSalary: salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length,
            medianSalary: salaries[Math.floor(salaries.length / 2)],
            totalPayroll: salaries.reduce((sum, sal) => sum + sal, 0),
            averagePerformance: performances.length > 0 
                ? performances.reduce((sum, perf) => sum + perf, 0) / performances.length 
                : 0,
            flightRiskCount: employees.filter(emp => 
                emp.riskIndicators && emp.riskIndicators.includes('flight_risk')
            ).length
        };
    }
    
    calculateDistributions(employees) {
        // Salary distribution by ranges
        const salaryRanges = {
            '0-50k': 0,
            '50k-75k': 0,
            '75k-100k': 0,
            '100k-150k': 0,
            '150k+': 0
        };
        
        employees.forEach(emp => {
            const salary = emp.currentSalary;
            if (salary < 50000) salaryRanges['0-50k']++;
            else if (salary < 75000) salaryRanges['50k-75k']++;
            else if (salary < 100000) salaryRanges['75k-100k']++;
            else if (salary < 150000) salaryRanges['100k-150k']++;
            else salaryRanges['150k+']++;
        });
        
        // Performance distribution
        const performanceDistribution = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
        
        employees.forEach(emp => {
            if (emp.performance) {
                performanceDistribution[emp.performance]++;
            }
        });
        
        return {
            salary: salaryRanges,
            performance: performanceDistribution
        };
    }
    
    calculateCorrelations(employees) {
        // Calculate correlation between salary and performance
        const validData = employees.filter(emp => emp.performance && emp.currentSalary);
        
        if (validData.length < 2) {
            return { salaryPerformance: 0 };
        }
        
        const salaries = validData.map(emp => emp.currentSalary);
        const performances = validData.map(emp => emp.performance);
        
        const correlation = this.calculatePearsonCorrelation(salaries, performances);
        
        return {
            salaryPerformance: correlation
        };
    }
    
    calculateEquityMetrics(employees) {
        // Gender pay gap (if gender data available)
        const genderGap = this.calculateGenderPayGap(employees);
        
        // Performance-pay correlation
        const performanceCorrelation = this.analytics.correlation?.salaryPerformance || 0;
        
        // Country pay variance
        const countryVariance = this.calculateCountryPayVariance(employees);
        
        return {
            genderGap,
            performanceCorrelation,
            countryVariance
        };
    }
    
    calculateRiskMetrics(employees) {
        const flightRisk = employees.filter(emp => 
            emp.riskIndicators && emp.riskIndicators.includes('flight_risk')
        ).length;
        
        const lowPerformers = employees.filter(emp => emp.performance && emp.performance <= 2).length;
        
        const underpaid = employees.filter(emp => 
            emp.comparatio && emp.comparatio < 0.9
        ).length;
        
        return {
            flightRisk,
            lowPerformers,
            underpaid,
            totalRisk: flightRisk + lowPerformers + underpaid
        };
    }
    
    calculateTrends(employees) {
        // This would typically involve historical data
        // For now, we'll calculate current state trends
        
        const tenureGroups = {
            '0-1 years': 0,
            '1-3 years': 0,
            '3-5 years': 0,
            '5+ years': 0
        };
        
        employees.forEach(emp => {
            const tenure = emp.tenure || 0;
            if (tenure < 1) tenureGroups['0-1 years']++;
            else if (tenure < 3) tenureGroups['1-3 years']++;
            else if (tenure < 5) tenureGroups['3-5 years']++;
            else tenureGroups['5+ years']++;
        });
        
        return {
            tenureDistribution: tenureGroups
        };
    }
    
    calculatePearsonCorrelation(x, y) {
        const n = x.length;
        if (n === 0) return 0;
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    calculateGenderPayGap(employees) {
        // This would require gender data in the employee records
        // For now, return N/A
        return 'N/A';
    }
    
    calculateCountryPayVariance(employees) {
        const countryGroups = {};
        
        employees.forEach(emp => {
            const country = emp.country || 'Unknown';
            if (!countryGroups[country]) {
                countryGroups[country] = [];
            }
            countryGroups[country].push(emp.currentSalary);
        });
        
        const countryAverages = Object.entries(countryGroups).map(([country, salaries]) => ({
            country,
            average: salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length
        }));
        
        if (countryAverages.length < 2) return 0;
        
        const overallAverage = countryAverages.reduce((sum, item) => sum + item.average, 0) / countryAverages.length;
        const variance = countryAverages.reduce((sum, item) => sum + Math.pow(item.average - overallAverage, 2), 0) / countryAverages.length;
        
        return Math.sqrt(variance) / overallAverage; // Coefficient of variation
    }
    
    getFilteredEmployees() {
        return this.employees.filter(emp => {
            if (this.filters.country !== 'all' && emp.country !== this.filters.country) {
                return false;
            }
            if (this.filters.department !== 'all' && emp.department !== this.filters.department) {
                return false;
            }
            if (this.filters.performance !== 'all' && emp.performance?.toString() !== this.filters.performance) {
                return false;
            }
            return true;
        });
    }
    
    updateDashboard() {
        this.updateKeyMetrics();
        this.createCharts();
        this.updateDetailedAnalysis();
    }
    
    updateKeyMetrics() {
        const metrics = this.analytics.basic;
        
        document.getElementById('total-employees').textContent = metrics.totalEmployees;
        document.getElementById('average-salary').textContent = this.formatCurrency(metrics.averageSalary);
        document.getElementById('median-salary').textContent = this.formatCurrency(metrics.medianSalary);
        document.getElementById('total-payroll').textContent = this.formatCurrency(metrics.totalPayroll);
        document.getElementById('average-performance').textContent = metrics.averagePerformance.toFixed(1);
        document.getElementById('flight-risk-count').textContent = metrics.flightRiskCount;
        
        // For now, show neutral changes since we don't have historical data
        document.querySelectorAll('.metric-change').forEach(el => {
            el.textContent = '+0%';
            el.className = 'metric-change neutral';
        });
    }
    
    createCharts() {
        this.createSalaryDistributionChart();
        this.createPerformanceDistributionChart();
        this.createSalaryPerformanceChart();
        this.createCountryComparisonChart();
        this.createTenureCompensationChart();
    }
    
    createSalaryDistributionChart() {
        const ctx = document.getElementById('salary-distribution-chart').getContext('2d');
        const data = this.analytics.distribution.salary;
        
        // Simple bar chart implementation (would use Chart.js in production)
        this.drawBarChart(ctx, {
            labels: Object.keys(data),
            values: Object.values(data),
            title: 'Salary Distribution'
        });
        
        // Update insights
        const insights = this.generateSalaryInsights(data);
        document.getElementById('salary-insights').innerHTML = insights;
    }
    
    createPerformanceDistributionChart() {
        const ctx = document.getElementById('performance-distribution-chart').getContext('2d');
        const data = this.analytics.distribution.performance;
        
        this.drawBarChart(ctx, {
            labels: Object.keys(data).map(k => `Rating ${k}`),
            values: Object.values(data),
            title: 'Performance Distribution'
        });
        
        const insights = this.generatePerformanceInsights(data);
        document.getElementById('performance-insights').innerHTML = insights;
    }
    
    createSalaryPerformanceChart() {
        const ctx = document.getElementById('salary-performance-chart').getContext('2d');
        const filtered = this.getFilteredEmployees();
        
        this.drawScatterPlot(ctx, {
            data: filtered.map(emp => ({
                x: emp.performance || 0,
                y: emp.currentSalary
            })),
            title: 'Salary vs Performance'
        });
        
        const correlation = this.analytics.correlation.salaryPerformance;
        const insights = this.generateCorrelationInsights(correlation);
        document.getElementById('correlation-insights').innerHTML = insights;
    }
    
    createCountryComparisonChart() {
        const ctx = document.getElementById('country-comparison-chart').getContext('2d');
        const filtered = this.getFilteredEmployees();
        
        const countryData = {};
        filtered.forEach(emp => {
            const country = emp.country || 'Unknown';
            if (!countryData[country]) {
                countryData[country] = [];
            }
            countryData[country].push(emp.currentSalary);
        });
        
        const countryAverages = Object.entries(countryData).map(([country, salaries]) => ({
            country,
            average: salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length
        }));
        
        this.drawBarChart(ctx, {
            labels: countryAverages.map(item => item.country),
            values: countryAverages.map(item => item.average),
            title: 'Average Salary by Country'
        });
        
        const insights = this.generateCountryInsights(countryAverages);
        document.getElementById('country-insights').innerHTML = insights;
    }
    
    createTenureCompensationChart() {
        const ctx = document.getElementById('tenure-compensation-chart').getContext('2d');
        const filtered = this.getFilteredEmployees();
        
        this.drawScatterPlot(ctx, {
            data: filtered.map(emp => ({
                x: emp.tenure || 0,
                y: emp.currentSalary
            })),
            title: 'Tenure vs Compensation'
        });
        
        const insights = this.generateTenureInsights(filtered);
        document.getElementById('tenure-insights').innerHTML = insights;
    }
    
    drawBarChart(ctx, config) {
        const { labels, values, title } = config;
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Simple bar chart implementation
        const maxValue = Math.max(...values);
        const barWidth = width / labels.length * 0.8;
        const barSpacing = width / labels.length * 0.2;
        
        ctx.fillStyle = '#3498db';
        
        values.forEach((value, index) => {
            const barHeight = (value / maxValue) * (height * 0.8);
            const x = index * (barWidth + barSpacing) + barSpacing / 2;
            const y = height - barHeight - 20;
            
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw labels
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index], x + barWidth / 2, height - 5);
            ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
            
            ctx.fillStyle = '#3498db';
        });
    }
    
    drawScatterPlot(ctx, config) {
        const { data, title } = config;
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        if (data.length === 0) return;
        
        const maxX = Math.max(...data.map(d => d.x));
        const maxY = Math.max(...data.map(d => d.y));
        const minX = Math.min(...data.map(d => d.x));
        const minY = Math.min(...data.map(d => d.y));
        
        ctx.fillStyle = '#e74c3c';
        
        data.forEach(point => {
            const x = ((point.x - minX) / (maxX - minX)) * (width * 0.8) + width * 0.1;
            const y = height - (((point.y - minY) / (maxY - minY)) * (height * 0.8) + height * 0.1);
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
    
    generateSalaryInsights(data) {
        const total = Object.values(data).reduce((sum, val) => sum + val, 0);
        const highEarners = data['150k+'];
        const lowEarners = data['0-50k'];
        
        return `
            <div class="insight">
                <strong>${((highEarners / total) * 100).toFixed(1)}%</strong> of employees earn $150k+
            </div>
            <div class="insight">
                <strong>${((lowEarners / total) * 100).toFixed(1)}%</strong> of employees earn under $50k
            </div>
        `;
    }
    
    generatePerformanceInsights(data) {
        const total = Object.values(data).reduce((sum, val) => sum + val, 0);
        const highPerformers = (data[4] || 0) + (data[5] || 0);
        const lowPerformers = (data[1] || 0) + (data[2] || 0);
        
        return `
            <div class="insight">
                <strong>${((highPerformers / total) * 100).toFixed(1)}%</strong> are high performers (4-5 rating)
            </div>
            <div class="insight">
                <strong>${((lowPerformers / total) * 100).toFixed(1)}%</strong> need performance improvement
            </div>
        `;
    }
    
    generateCorrelationInsights(correlation) {
        let strength = 'weak';
        if (Math.abs(correlation) > 0.7) strength = 'strong';
        else if (Math.abs(correlation) > 0.4) strength = 'moderate';
        
        return `
            <div class="insight">
                <strong>${strength}</strong> correlation between salary and performance
            </div>
            <div class="insight">
                Correlation coefficient: <strong>${correlation.toFixed(3)}</strong>
            </div>
        `;
    }
    
    generateCountryInsights(countryAverages) {
        if (countryAverages.length === 0) return '<div class="insight">No country data available</div>';
        
        const highest = countryAverages.reduce((max, item) => item.average > max.average ? item : max);
        const lowest = countryAverages.reduce((min, item) => item.average < min.average ? item : min);
        
        return `
            <div class="insight">
                Highest avg: <strong>${highest.country}</strong> (${this.formatCurrency(highest.average)})
            </div>
            <div class="insight">
                Lowest avg: <strong>${lowest.country}</strong> (${this.formatCurrency(lowest.average)})
            </div>
        `;
    }
    
    generateTenureInsights(employees) {
        const avgTenure = employees.reduce((sum, emp) => sum + (emp.tenure || 0), 0) / employees.length;
        const newHires = employees.filter(emp => (emp.tenure || 0) < 1).length;
        
        return `
            <div class="insight">
                Average tenure: <strong>${avgTenure.toFixed(1)} years</strong>
            </div>
            <div class="insight">
                New hires (&lt;1 year): <strong>${newHires}</strong> employees
            </div>
        `;
    }
    
    updateDetailedAnalysis() {
        this.updateEquityPanel();
        this.updatePerformancePanel();
        this.updateRiskPanel();
        this.updateTrendsPanel();
    }
    
    updateEquityPanel() {
        const equity = this.analytics.equity;
        
        document.getElementById('gender-gap').textContent = equity.genderGap;
        document.getElementById('performance-correlation').textContent = equity.performanceCorrelation.toFixed(3);
        document.getElementById('country-variance').textContent = (equity.countryVariance * 100).toFixed(1) + '%';
        
        // Generate equity recommendations
        const recommendations = this.generateEquityRecommendations(equity);
        document.getElementById('equity-recommendations').innerHTML = recommendations;
    }
    
    updatePerformancePanel() {
        const breakdown = this.generatePerformanceBreakdown();
        document.getElementById('performance-breakdown').innerHTML = breakdown;
    }
    
    updateRiskPanel() {
        const breakdown = this.generateRiskBreakdown();
        document.getElementById('risk-breakdown').innerHTML = breakdown;
    }
    
    updateTrendsPanel() {
        const trends = this.generateTrendsContent();
        document.getElementById('trends-content').innerHTML = trends;
    }
    
    generateEquityRecommendations(equity) {
        const recommendations = [];
        
        if (equity.performanceCorrelation < 0.3) {
            recommendations.push('Consider reviewing salary alignment with performance ratings');
        }
        
        if (equity.countryVariance > 0.2) {
            recommendations.push('High variance in country compensation - review for consistency');
        }
        
        return recommendations.length > 0 
            ? recommendations.map(rec => `<div class="recommendation">• ${rec}</div>`).join('')
            : '<div class="recommendation">No specific equity concerns identified</div>';
    }
    
    generatePerformanceBreakdown() {
        const risk = this.analytics.risk;
        const basic = this.analytics.basic;
        
        return `
            <div class="breakdown-item">
                <h5>High Performers (4-5 rating)</h5>
                <p>${basic.totalEmployees - risk.lowPerformers} employees performing well</p>
            </div>
            <div class="breakdown-item">
                <h5>Low Performers (1-2 rating)</h5>
                <p>${risk.lowPerformers} employees need development support</p>
            </div>
            <div class="breakdown-item">
                <h5>Performance Distribution</h5>
                <p>Average rating: ${basic.averagePerformance.toFixed(1)}/5</p>
            </div>
        `;
    }
    
    generateRiskBreakdown() {
        const risk = this.analytics.risk;
        
        return `
            <div class="risk-item high-risk">
                <h5>Flight Risk</h5>
                <p>${risk.flightRisk} employees at risk of leaving</p>
            </div>
            <div class="risk-item medium-risk">
                <h5>Underpaid</h5>
                <p>${risk.underpaid} employees below market rate</p>
            </div>
            <div class="risk-item low-risk">
                <h5>Low Performers</h5>
                <p>${risk.lowPerformers} employees with performance concerns</p>
            </div>
        `;
    }
    
    generateTrendsContent() {
        const trends = this.analytics.trends;
        
        return `
            <div class="trend-item">
                <h5>Tenure Distribution</h5>
                ${Object.entries(trends.tenureDistribution).map(([range, count]) => 
                    `<p>${range}: ${count} employees</p>`
                ).join('')}
            </div>
        `;
    }
    
    applyFilters() {
        this.filters.country = document.getElementById('country-filter').value;
        this.filters.department = document.getElementById('department-filter').value;
        this.filters.performance = document.getElementById('performance-filter').value;
        
        this.calculateAnalytics();
        this.updateDashboard();
    }
    
    refreshAnalytics() {
        this.calculateAnalytics();
        this.updateDashboard();
        this.showNotification('Analytics refreshed', 'success');
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-panel`).classList.add('active');
    }
    
    exportAnalyticsReport() {
        const report = this.generateAnalyticsReport();
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Analytics report exported', 'success');
    }
    
    generateAnalyticsReport() {
        const basic = this.analytics.basic;
        const equity = this.analytics.equity;
        const risk = this.analytics.risk;
        
        return `
TEAM ANALYTICS REPORT
Generated: ${new Date().toLocaleString()}

KEY METRICS
===========
Total Employees: ${basic.totalEmployees}
Average Salary: ${this.formatCurrency(basic.averageSalary)}
Median Salary: ${this.formatCurrency(basic.medianSalary)}
Total Payroll: ${this.formatCurrency(basic.totalPayroll)}
Average Performance: ${basic.averagePerformance.toFixed(1)}/5
Flight Risk Count: ${basic.flightRiskCount}

EQUITY ANALYSIS
===============
Performance Correlation: ${equity.performanceCorrelation.toFixed(3)}
Country Pay Variance: ${(equity.countryVariance * 100).toFixed(1)}%

RISK ASSESSMENT
===============
Flight Risk: ${risk.flightRisk} employees
Low Performers: ${risk.lowPerformers} employees
Underpaid: ${risk.underpaid} employees
Total Risk Score: ${risk.totalRisk}

RECOMMENDATIONS
===============
${this.generateEquityRecommendations(equity).replace(/<[^>]*>/g, '')}
        `;
    }
    
    scheduleReport() {
        this.showNotification('Report scheduling feature would be implemented here', 'info');
    }
    
    shareInsights() {
        this.showNotification('Insight sharing feature would be implemented here', 'info');
    }
    
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    showNotification(message, type = 'info') {
        // Use the main app's notification system
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsDashboard;
} else {
    window.AnalyticsDashboard = AnalyticsDashboard;
} 