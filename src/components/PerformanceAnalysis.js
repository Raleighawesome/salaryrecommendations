/**
 * Performance vs Compensation Analysis Component
 * 
 * Provides detailed analysis of the relationship between performance ratings
 * and compensation including scatter plots, correlation analysis, and insights.
 */

class PerformanceAnalysis {
    constructor(container) {
        this.container = container;
        this.employees = [];
        this.charts = {};
        this.correlationData = {};
        
        this.init();
    }
    
    init() {
        this.loadChartJS();
        this.render();
        this.attachEventListeners();
    }
    
    loadChartJS() {
        // Load Chart.js from CDN if not already loaded
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
            script.onload = () => {
                console.log('Chart.js loaded for performance analysis');
                this.createCharts();
            };
            document.head.appendChild(script);
        } else {
            this.createCharts();
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="performance-analysis">
                <div class="analysis-header">
                    <h2>Performance vs Compensation Analysis</h2>
                    <p>Analyze the relationship between employee performance ratings and compensation</p>
                </div>
                
                <div class="analysis-controls">
                    <div class="controls-row">
                        <div class="control-group">
                            <label for="perf-country-filter">Country</label>
                            <select id="perf-country-filter">
                                <option value="all">All Countries</option>
                            </select>
                        </div>
                        
                        <div class="control-group">
                            <label for="perf-department-filter">Department</label>
                            <select id="perf-department-filter">
                                <option value="all">All Departments</option>
                            </select>
                        </div>
                        
                        <div class="control-group">
                            <label for="salary-type">Salary Type</label>
                            <select id="salary-type">
                                <option value="normalized">Normalized (USD)</option>
                                <option value="original">Original Currency</option>
                            </select>
                        </div>
                        
                        <div class="control-group">
                            <button id="refresh-perf-analysis" class="btn btn-primary">
                                Refresh Analysis
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="correlation-summary">
                    <h3>Correlation Summary</h3>
                    <div class="correlation-cards">
                        <div class="correlation-card">
                            <h4>Overall Correlation</h4>
                            <div class="correlation-value" id="overall-correlation">N/A</div>
                            <div class="correlation-strength" id="overall-strength">No data</div>
                        </div>
                        
                        <div class="correlation-card">
                            <h4>R-Squared</h4>
                            <div class="correlation-value" id="r-squared">N/A</div>
                            <div class="correlation-strength" id="r-squared-desc">Variance explained</div>
                        </div>
                        
                        <div class="correlation-card">
                            <h4>P-Value</h4>
                            <div class="correlation-value" id="p-value">N/A</div>
                            <div class="correlation-strength" id="significance">Statistical significance</div>
                        </div>
                        
                        <div class="correlation-card">
                            <h4>Sample Size</h4>
                            <div class="correlation-value" id="sample-size">0</div>
                            <div class="correlation-strength">Valid data points</div>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-charts">
                    <div class="chart-row">
                        <div class="chart-card">
                            <h3>Performance vs Salary Scatter Plot</h3>
                            <div class="chart-container">
                                <canvas id="performance-salary-scatter"></canvas>
                            </div>
                            <div class="chart-insights" id="scatter-insights">
                                <!-- Insights will be populated here -->
                            </div>
                        </div>
                        
                        <div class="chart-card">
                            <h3>Performance Distribution</h3>
                            <div class="chart-container">
                                <canvas id="performance-distribution"></canvas>
                            </div>
                            <div class="chart-insights" id="perf-dist-insights">
                                <!-- Insights will be populated here -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="chart-row">
                        <div class="chart-card">
                            <h3>Salary by Performance Rating</h3>
                            <div class="chart-container">
                                <canvas id="salary-by-performance"></canvas>
                            </div>
                            <div class="chart-insights" id="salary-perf-insights">
                                <!-- Insights will be populated here -->
                            </div>
                        </div>
                        
                        <div class="chart-card">
                            <h3>Performance Trend Analysis</h3>
                            <div class="chart-container">
                                <canvas id="performance-trend"></canvas>
                            </div>
                            <div class="chart-insights" id="trend-insights">
                                <!-- Insights will be populated here -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="chart-row full-width">
                        <div class="chart-card">
                            <h3>Detailed Correlation Analysis</h3>
                            <div class="correlation-details">
                                <div class="correlation-table" id="correlation-table">
                                    <!-- Correlation table will be populated here -->
                                </div>
                                <div class="outlier-analysis" id="outlier-analysis">
                                    <!-- Outlier analysis will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="performance-insights">
                    <h3>Key Insights & Recommendations</h3>
                    <div class="insights-container" id="performance-recommendations">
                        <!-- Recommendations will be populated here -->
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Filter change handlers
        document.getElementById('perf-country-filter')?.addEventListener('change', () => {
            this.updateCharts();
        });
        
        document.getElementById('perf-department-filter')?.addEventListener('change', () => {
            this.updateCharts();
        });
        
        document.getElementById('salary-type')?.addEventListener('change', () => {
            this.updateCharts();
        });
        
        // Refresh button
        document.getElementById('refresh-perf-analysis')?.addEventListener('click', () => {
            this.updateCharts();
        });
    }
    
    setEmployees(employees) {
        this.employees = employees || [];
        this.populateFilters();
        this.updateCharts();
    }
    
    populateFilters() {
        // Populate country filter
        const countries = [...new Set(this.employees.map(emp => emp.country).filter(Boolean))];
        const countrySelect = document.getElementById('perf-country-filter');
        if (countrySelect) {
            countrySelect.innerHTML = '<option value="all">All Countries</option>';
            countries.forEach(country => {
                countrySelect.innerHTML += `<option value="${country}">${country}</option>`;
            });
        }
        
        // Populate department filter
        const departments = [...new Set(this.employees.map(emp => emp.department || emp.title).filter(Boolean))];
        const deptSelect = document.getElementById('perf-department-filter');
        if (deptSelect) {
            deptSelect.innerHTML = '<option value="all">All Departments</option>';
            departments.forEach(dept => {
                deptSelect.innerHTML += `<option value="${dept}">${dept}</option>`;
            });
        }
    }
    
    getFilteredEmployees() {
        const countryFilter = document.getElementById('perf-country-filter')?.value || 'all';
        const deptFilter = document.getElementById('perf-department-filter')?.value || 'all';
        
        return this.employees.filter(emp => {
            if (countryFilter !== 'all' && emp.country !== countryFilter) return false;
            if (deptFilter !== 'all' && 
                emp.department !== deptFilter && 
                emp.title !== deptFilter) return false;
            
            // Only include employees with both performance rating and salary data
            return emp.performanceRating && (emp.normalizedSalary || emp.salary);
        });
    }
    
    createCharts() {
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded yet, waiting...');
            return;
        }
        
        this.createScatterPlot();
        this.createPerformanceDistribution();
        this.createSalaryByPerformance();
        this.createPerformanceTrend();
        this.updateCorrelationSummary();
        this.updateCorrelationTable();
        this.generateRecommendations();
    }
    
    updateCharts() {
        if (typeof Chart === 'undefined') return;
        
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
        
        // Recreate charts with filtered data
        this.createCharts();
    }
    
    createScatterPlot() {
        const canvas = document.getElementById('performance-salary-scatter');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const employees = this.getFilteredEmployees();
        const salaryType = document.getElementById('salary-type')?.value || 'normalized';
        
        // Prepare scatter plot data
        const scatterData = employees.map(emp => ({
            x: emp.performanceRating,
            y: salaryType === 'normalized' ? (emp.normalizedSalary || emp.salary) : emp.salary,
            employee: emp
        }));
        
        // Calculate trend line
        const trendLine = this.calculateTrendLine(scatterData);
        
        this.charts.scatter = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Employees',
                    data: scatterData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }, {
                    label: 'Trend Line',
                    data: trendLine,
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance Rating vs Salary'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    const emp = context.raw.employee;
                                    return `${emp.name}: Performance ${context.raw.x}, Salary $${Math.round(context.raw.y).toLocaleString()}`;
                                }
                                return context.dataset.label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Performance Rating'
                        },
                        min: 0.5,
                        max: 5.5
                    },
                    y: {
                        title: {
                            display: true,
                            text: `Salary (${salaryType === 'normalized' ? 'USD' : 'Original Currency'})`
                        }
                    }
                }
            }
        });
        
        this.updateScatterInsights(scatterData, trendLine);
    }
    
    calculateTrendLine(data) {
        if (data.length < 2) return [];
        
        const n = data.length;
        const sumX = data.reduce((sum, point) => sum + point.x, 0);
        const sumY = data.reduce((sum, point) => sum + point.y, 0);
        const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
        const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const minX = Math.min(...data.map(p => p.x));
        const maxX = Math.max(...data.map(p => p.x));
        
        return [
            { x: minX, y: slope * minX + intercept },
            { x: maxX, y: slope * maxX + intercept }
        ];
    }
    
    updateScatterInsights(data, trendLine) {
        const insightsContainer = document.getElementById('scatter-insights');
        if (!insightsContainer) return;
        
        const correlation = this.calculateCorrelation(data);
        const slope = trendLine.length > 1 ? 
            (trendLine[1].y - trendLine[0].y) / (trendLine[1].x - trendLine[0].x) : 0;
        
        insightsContainer.innerHTML = `
            <div class="insights-summary">
                <div class="insight-item">
                    <span class="insight-label">Correlation:</span>
                    <span class="insight-value ${this.getCorrelationClass(correlation)}">${correlation.toFixed(3)}</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Trend:</span>
                    <span class="insight-value">$${Math.round(slope).toLocaleString()} per rating point</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Data Points:</span>
                    <span class="insight-value">${data.length} employees</span>
                </div>
            </div>
        `;
    }
    
    calculateCorrelation(data) {
        if (data.length < 2) return 0;
        
        const n = data.length;
        const sumX = data.reduce((sum, point) => sum + point.x, 0);
        const sumY = data.reduce((sum, point) => sum + point.y, 0);
        const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
        const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0);
        const sumY2 = data.reduce((sum, point) => sum + point.y * point.y, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    getCorrelationClass(correlation) {
        const abs = Math.abs(correlation);
        if (abs > 0.7) return 'strong-correlation';
        if (abs > 0.4) return 'moderate-correlation';
        return 'weak-correlation';
    }
    
    createPerformanceDistribution() {
        const canvas = document.getElementById('performance-distribution');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const employees = this.getFilteredEmployees();
        
        // Count performance ratings
        const ratingCounts = [1, 2, 3, 4, 5].map(rating => {
            return employees.filter(emp => emp.performanceRating === rating).length;
        });
        
        this.charts.perfDist = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 - Below', '2 - Meets Some', '3 - Meets', '4 - Exceeds', '5 - Far Exceeds'],
                datasets: [{
                    label: 'Employee Count',
                    data: ratingCounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(54, 162, 235, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance Rating Distribution'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Employees'
                        }
                    }
                }
            }
        });
        
        this.updatePerfDistInsights(ratingCounts, employees.length);
    }
    
    updatePerfDistInsights(ratingCounts, total) {
        const insightsContainer = document.getElementById('perf-dist-insights');
        if (!insightsContainer) return;
        
        const avgRating = ratingCounts.reduce((sum, count, index) => sum + count * (index + 1), 0) / total;
        const highPerformers = (ratingCounts[3] + ratingCounts[4]) / total * 100;
        const lowPerformers = (ratingCounts[0] + ratingCounts[1]) / total * 100;
        
        insightsContainer.innerHTML = `
            <div class="insights-summary">
                <div class="insight-item">
                    <span class="insight-label">Average Rating:</span>
                    <span class="insight-value">${avgRating.toFixed(2)}</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">High Performers:</span>
                    <span class="insight-value">${highPerformers.toFixed(1)}%</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Low Performers:</span>
                    <span class="insight-value">${lowPerformers.toFixed(1)}%</span>
                </div>
            </div>
        `;
    }
    
    createSalaryByPerformance() {
        const canvas = document.getElementById('salary-by-performance');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const employees = this.getFilteredEmployees();
        const salaryType = document.getElementById('salary-type')?.value || 'normalized';
        
        // Calculate average salary by performance rating
        const salaryByRating = [1, 2, 3, 4, 5].map(rating => {
            const ratingEmployees = employees.filter(emp => emp.performanceRating === rating);
            if (ratingEmployees.length === 0) return 0;
            
            const totalSalary = ratingEmployees.reduce((sum, emp) => {
                return sum + (salaryType === 'normalized' ? (emp.normalizedSalary || emp.salary) : emp.salary);
            }, 0);
            
            return totalSalary / ratingEmployees.length;
        });
        
        this.charts.salaryPerf = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 - Below', '2 - Meets Some', '3 - Meets', '4 - Exceeds', '5 - Far Exceeds'],
                datasets: [{
                    label: 'Average Salary',
                    data: salaryByRating,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Salary by Performance Rating'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: `Average Salary (${salaryType === 'normalized' ? 'USD' : 'Original Currency'})`
                        }
                    }
                }
            }
        });
        
        this.updateSalaryPerfInsights(salaryByRating);
    }
    
    updateSalaryPerfInsights(salaryByRating) {
        const insightsContainer = document.getElementById('salary-perf-insights');
        if (!insightsContainer) return;
        
        const validSalaries = salaryByRating.filter(salary => salary > 0);
        if (validSalaries.length === 0) return;
        
        const maxSalary = Math.max(...validSalaries);
        const minSalary = Math.min(...validSalaries);
        const salaryRange = maxSalary - minSalary;
        const salaryGrowth = validSalaries.length > 1 ? 
            ((validSalaries[validSalaries.length - 1] - validSalaries[0]) / validSalaries[0] * 100) : 0;
        
        insightsContainer.innerHTML = `
            <div class="insights-summary">
                <div class="insight-item">
                    <span class="insight-label">Salary Range:</span>
                    <span class="insight-value">$${Math.round(salaryRange).toLocaleString()}</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Top vs Bottom:</span>
                    <span class="insight-value">${salaryGrowth.toFixed(1)}%</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Highest Avg:</span>
                    <span class="insight-value">$${Math.round(maxSalary).toLocaleString()}</span>
                </div>
            </div>
        `;
    }
    
    createPerformanceTrend() {
        const canvas = document.getElementById('performance-trend');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const employees = this.getFilteredEmployees();
        
        // Group by tenure and calculate average performance
        const tenureGroups = this.groupByTenure(employees);
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(tenureGroups),
                datasets: [{
                    label: 'Average Performance',
                    data: Object.values(tenureGroups).map(group => {
                        return group.reduce((sum, emp) => sum + emp.performanceRating, 0) / group.length;
                    }),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance by Tenure'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years in Role'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Average Performance Rating'
                        },
                        min: 1,
                        max: 5
                    }
                }
            }
        });
        
        this.updateTrendInsights(tenureGroups);
    }
    
    groupByTenure(employees) {
        const groups = {};
        
        employees.forEach(emp => {
            const tenure = emp.timeInRole || 1;
            const tenureGroup = Math.floor(tenure);
            const groupKey = tenureGroup === 0 ? '< 1 year' : 
                           tenureGroup === 1 ? '1 year' : 
                           `${tenureGroup} years`;
            
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(emp);
        });
        
        return groups;
    }
    
    updateTrendInsights(tenureGroups) {
        const insightsContainer = document.getElementById('trend-insights');
        if (!insightsContainer) return;
        
        const groupKeys = Object.keys(tenureGroups);
        const avgPerformances = Object.values(tenureGroups).map(group => {
            return group.reduce((sum, emp) => sum + emp.performanceRating, 0) / group.length;
        });
        
        const trend = avgPerformances.length > 1 ? 
            avgPerformances[avgPerformances.length - 1] - avgPerformances[0] : 0;
        
        insightsContainer.innerHTML = `
            <div class="insights-summary">
                <div class="insight-item">
                    <span class="insight-label">Tenure Groups:</span>
                    <span class="insight-value">${groupKeys.length}</span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Performance Trend:</span>
                    <span class="insight-value ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'}">
                        ${trend > 0 ? '+' : ''}${trend.toFixed(2)}
                    </span>
                </div>
                <div class="insight-item">
                    <span class="insight-label">Best Group:</span>
                    <span class="insight-value">${groupKeys[avgPerformances.indexOf(Math.max(...avgPerformances))]}</span>
                </div>
            </div>
        `;
    }
    
    updateCorrelationSummary() {
        const employees = this.getFilteredEmployees();
        const salaryType = document.getElementById('salary-type')?.value || 'normalized';
        
        if (employees.length < 2) {
            this.showNoDataMessage();
            return;
        }
        
        const data = employees.map(emp => ({
            x: emp.performanceRating,
            y: salaryType === 'normalized' ? (emp.normalizedSalary || emp.salary) : emp.salary
        }));
        
        const correlation = this.calculateCorrelation(data);
        const rSquared = correlation * correlation;
        const pValue = this.calculatePValue(correlation, employees.length);
        
        // Update correlation cards
        document.getElementById('overall-correlation').textContent = correlation.toFixed(3);
        document.getElementById('overall-strength').textContent = this.getCorrelationStrength(correlation);
        document.getElementById('r-squared').textContent = (rSquared * 100).toFixed(1) + '%';
        document.getElementById('r-squared-desc').textContent = 'Variance explained';
        document.getElementById('p-value').textContent = pValue.toFixed(4);
        document.getElementById('significance').textContent = pValue < 0.05 ? 'Significant' : 'Not significant';
        document.getElementById('sample-size').textContent = employees.length.toString();
        
        // Apply styling based on correlation strength
        const correlationElement = document.getElementById('overall-correlation');
        correlationElement.className = `correlation-value ${this.getCorrelationClass(correlation)}`;
    }
    
    calculatePValue(correlation, n) {
        // Simplified p-value calculation for correlation
        if (n < 3) return 1;
        
        const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
        const df = n - 2;
        
        // Approximate p-value using t-distribution
        // This is a simplified calculation
        return Math.max(0.001, 2 * (1 - this.tCDF(Math.abs(t), df)));
    }
    
    tCDF(t, df) {
        // Simplified t-distribution CDF approximation
        return 0.5 + 0.5 * Math.sign(t) * Math.sqrt(1 - Math.exp(-2 * t * t / Math.PI));
    }
    
    getCorrelationStrength(correlation) {
        const abs = Math.abs(correlation);
        if (abs > 0.8) return 'Very Strong';
        if (abs > 0.6) return 'Strong';
        if (abs > 0.4) return 'Moderate';
        if (abs > 0.2) return 'Weak';
        return 'Very Weak';
    }
    
    updateCorrelationTable() {
        const tableContainer = document.getElementById('correlation-table');
        if (!tableContainer) return;
        
        const employees = this.getFilteredEmployees();
        
        // Calculate correlations by different segments
        const correlations = this.calculateSegmentCorrelations(employees);
        
        let tableHTML = `
            <h4>Correlation by Segment</h4>
            <table class="correlation-data-table">
                <thead>
                    <tr>
                        <th>Segment</th>
                        <th>Sample Size</th>
                        <th>Correlation</th>
                        <th>Strength</th>
                        <th>R²</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        correlations.forEach(corr => {
            tableHTML += `
                <tr>
                    <td>${corr.segment}</td>
                    <td>${corr.sampleSize}</td>
                    <td class="${this.getCorrelationClass(corr.correlation)}">${corr.correlation.toFixed(3)}</td>
                    <td>${this.getCorrelationStrength(corr.correlation)}</td>
                    <td>${(corr.correlation * corr.correlation * 100).toFixed(1)}%</td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
        tableContainer.innerHTML = tableHTML;
        
        // Update outlier analysis
        this.updateOutlierAnalysis(employees);
    }
    
    calculateSegmentCorrelations(employees) {
        const correlations = [];
        const salaryType = document.getElementById('salary-type')?.value || 'normalized';
        
        // Overall correlation
        const overallData = employees.map(emp => ({
            x: emp.performanceRating,
            y: salaryType === 'normalized' ? (emp.normalizedSalary || emp.salary) : emp.salary
        }));
        correlations.push({
            segment: 'Overall',
            sampleSize: employees.length,
            correlation: this.calculateCorrelation(overallData)
        });
        
        // By country
        const countries = [...new Set(employees.map(emp => emp.country).filter(Boolean))];
        countries.forEach(country => {
            const countryEmployees = employees.filter(emp => emp.country === country);
            if (countryEmployees.length > 2) {
                const data = countryEmployees.map(emp => ({
                    x: emp.performanceRating,
                    y: salaryType === 'normalized' ? (emp.normalizedSalary || emp.salary) : emp.salary
                }));
                correlations.push({
                    segment: country,
                    sampleSize: countryEmployees.length,
                    correlation: this.calculateCorrelation(data)
                });
            }
        });
        
        return correlations;
    }
    
    updateOutlierAnalysis(employees) {
        const outlierContainer = document.getElementById('outlier-analysis');
        if (!outlierContainer) return;
        
        const outliers = this.detectOutliers(employees);
        
        let outlierHTML = `
            <h4>Outlier Analysis</h4>
            <div class="outlier-summary">
                <p>Found ${outliers.length} potential outliers (employees with unusual performance-salary relationships)</p>
            </div>
        `;
        
        if (outliers.length > 0) {
            outlierHTML += `
                <div class="outlier-list">
                    ${outliers.slice(0, 5).map(outlier => `
                        <div class="outlier-item">
                            <span class="outlier-name">${outlier.name}</span>
                            <span class="outlier-details">Performance: ${outlier.performanceRating}, Salary: $${Math.round(outlier.salary).toLocaleString()}</span>
                            <span class="outlier-reason">${outlier.reason}</span>
                        </div>
                    `).join('')}
                    ${outliers.length > 5 ? `<p class="outlier-more">... and ${outliers.length - 5} more</p>` : ''}
                </div>
            `;
        }
        
        outlierContainer.innerHTML = outlierHTML;
    }
    
    detectOutliers(employees) {
        const salaryType = document.getElementById('salary-type')?.value || 'normalized';
        const outliers = [];
        
        // Calculate expected salary for each performance rating
        const performanceGroups = {};
        employees.forEach(emp => {
            const rating = emp.performanceRating;
            if (!performanceGroups[rating]) performanceGroups[rating] = [];
            performanceGroups[rating].push(salaryType === 'normalized' ? (emp.normalizedSalary || emp.salary) : emp.salary);
        });
        
        // Calculate median and IQR for each performance group
        Object.keys(performanceGroups).forEach(rating => {
            const salaries = performanceGroups[rating].sort((a, b) => a - b);
            const q1 = salaries[Math.floor(salaries.length * 0.25)];
            const q3 = salaries[Math.floor(salaries.length * 0.75)];
            const iqr = q3 - q1;
            const lowerBound = q1 - 1.5 * iqr;
            const upperBound = q3 + 1.5 * iqr;
            
            employees.forEach(emp => {
                if (emp.performanceRating == rating) {
                    const salary = salaryType === 'normalized' ? (emp.normalizedSalary || emp.salary) : emp.salary;
                    if (salary < lowerBound) {
                        outliers.push({
                            ...emp,
                            salary,
                            reason: 'Salary significantly below peers with same performance'
                        });
                    } else if (salary > upperBound) {
                        outliers.push({
                            ...emp,
                            salary,
                            reason: 'Salary significantly above peers with same performance'
                        });
                    }
                }
            });
        });
        
        return outliers;
    }
    
    generateRecommendations() {
        const recommendationsContainer = document.getElementById('performance-recommendations');
        if (!recommendationsContainer) return;
        
        const employees = this.getFilteredEmployees();
        const correlation = this.calculateCorrelation(employees.map(emp => ({
            x: emp.performanceRating,
            y: emp.normalizedSalary || emp.salary
        })));
        
        const recommendations = [];
        
        // Correlation-based recommendations
        if (Math.abs(correlation) < 0.3) {
            recommendations.push({
                type: 'warning',
                title: 'Weak Performance-Pay Correlation',
                description: 'The correlation between performance ratings and compensation is weak. Consider reviewing your compensation strategy to better align pay with performance.',
                action: 'Review compensation bands and performance criteria'
            });
        } else if (correlation > 0.7) {
            recommendations.push({
                type: 'success',
                title: 'Strong Performance-Pay Alignment',
                description: 'Your compensation strategy shows strong alignment with performance ratings. This is excellent for motivation and retention.',
                action: 'Maintain current compensation strategy'
            });
        }
        
        // Outlier-based recommendations
        const outliers = this.detectOutliers(employees);
        if (outliers.length > employees.length * 0.1) {
            recommendations.push({
                type: 'warning',
                title: 'High Number of Compensation Outliers',
                description: `${outliers.length} employees have compensation that doesn't align with their performance rating. This may indicate inconsistent compensation practices.`,
                action: 'Review outlier cases and adjust compensation as needed'
            });
        }
        
        // Performance distribution recommendations
        const highPerformers = employees.filter(emp => emp.performanceRating >= 4).length;
        const lowPerformers = employees.filter(emp => emp.performanceRating <= 2).length;
        
        if (lowPerformers > employees.length * 0.2) {
            recommendations.push({
                type: 'info',
                title: 'High Percentage of Low Performers',
                description: `${(lowPerformers / employees.length * 100).toFixed(1)}% of employees have performance ratings of 2 or below. Consider performance improvement programs.`,
                action: 'Implement performance improvement initiatives'
            });
        }
        
        if (highPerformers > employees.length * 0.8) {
            recommendations.push({
                type: 'info',
                title: 'Grade Inflation Possible',
                description: `${(highPerformers / employees.length * 100).toFixed(1)}% of employees have high performance ratings. Ensure rating standards are appropriately calibrated.`,
                action: 'Review performance rating calibration'
            });
        }
        
        // Render recommendations
        let recommendationsHTML = '';
        recommendations.forEach(rec => {
            recommendationsHTML += `
                <div class="recommendation-card ${rec.type}">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <div class="recommendation-action">
                        <strong>Recommended Action:</strong> ${rec.action}
                    </div>
                </div>
            `;
        });
        
        if (recommendations.length === 0) {
            recommendationsHTML = `
                <div class="recommendation-card success">
                    <h4>Performance-Compensation Alignment Looks Good</h4>
                    <p>Your performance ratings and compensation show healthy alignment with no major issues detected.</p>
                    <div class="recommendation-action">
                        <strong>Recommended Action:</strong> Continue monitoring and maintain current practices
                    </div>
                </div>
            `;
        }
        
        recommendationsContainer.innerHTML = recommendationsHTML;
    }
    
    showNoDataMessage() {
        const summaryCards = document.querySelectorAll('.correlation-value');
        summaryCards.forEach(card => {
            card.textContent = 'N/A';
        });
        
        const strengthElements = document.querySelectorAll('.correlation-strength');
        strengthElements.forEach(element => {
            element.textContent = 'Insufficient data';
        });
    }
    
    exportAnalysisData() {
        const employees = this.getFilteredEmployees();
        const salaryType = document.getElementById('salary-type')?.value || 'normalized';
        
        const data = employees.map(emp => ({
            x: emp.performanceRating,
            y: salaryType === 'normalized' ? (emp.normalizedSalary || emp.salary) : emp.salary
        }));
        
        const correlation = this.calculateCorrelation(data);
        const outliers = this.detectOutliers(employees);
        
        return {
            summary: {
                totalEmployees: employees.length,
                correlation: correlation,
                rSquared: correlation * correlation,
                outlierCount: outliers.length,
                timestamp: new Date().toISOString()
            },
            data: data,
            outliers: outliers,
            segmentCorrelations: this.calculateSegmentCorrelations(employees)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceAnalysis;
} else if (typeof window !== 'undefined') {
    window.PerformanceAnalysis = PerformanceAnalysis;
} 