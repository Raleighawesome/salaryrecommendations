/**
 * Salary Distribution and Equity Visualization Component
 * 
 * Provides comprehensive salary distribution analysis including:
 * - Salary histograms with statistical overlays
 * - Box plots for distribution analysis
 * - Pay equity gap visualizations
 * - Comparative analysis across demographics
 */

class SalaryVisualization {
    constructor(container) {
        this.container = container;
        this.employees = [];
        this.charts = {};
        this.filters = {
            country: 'all',
            department: 'all',
            level: 'all',
            gender: 'all'
        };
        
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
            this.showLoadingState();
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
            script.onload = () => {
                console.log('Chart.js loaded successfully');
                this.hideLoadingState();
                if (this.employees && this.employees.length > 0) {
                    this.createCharts();
                } else {
                    this.showEmptyState();
                }
            };
            script.onerror = () => {
                console.error('Failed to load Chart.js');
                this.showErrorState('Failed to load charting library. Please check your internet connection.');
            };
            document.head.appendChild(script);
        } else {
            if (this.employees && this.employees.length > 0) {
                this.createCharts();
            } else {
                this.showEmptyState();
            }
        }
    }
    
    render() {
        this.container.innerHTML = `
            <div class="visualizations-container">
                <div class="viz-tabs">
                    <nav class="viz-tabs-nav">
                        <button class="viz-tab-button active" data-tab="salary">Salary Distribution</button>
                        <button class="viz-tab-button" data-tab="performance">Performance Analysis</button>
                    </nav>
                    
                    <div class="viz-tab-content">
                        <div id="salary-viz-tab" class="viz-tab-panel active">
                            <div class="salary-visualization">
                                <div class="viz-header">
                                    <h2>Salary Distribution & Equity Analysis</h2>
                                    <p>Comprehensive analysis of salary distributions and pay equity across your team</p>
                                </div>
                
                <div class="viz-filters">
                    <div class="filters-row">
                        <div class="filter-group">
                            <label for="viz-country-filter">Country</label>
                            <select id="viz-country-filter">
                                <option value="all">All Countries</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="viz-department-filter">Department</label>
                            <select id="viz-department-filter">
                                <option value="all">All Departments</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label for="viz-level-filter">Level</label>
                            <select id="viz-level-filter">
                                <option value="all">All Levels</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <button id="refresh-viz" class="btn btn-primary">
                                Refresh Charts
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="viz-grid">
                    <div class="viz-card">
                        <h3>Salary Distribution Histogram</h3>
                        <div class="chart-container">
                            <canvas id="salary-histogram"></canvas>
                        </div>
                        <div class="chart-stats" id="histogram-stats">
                            <!-- Statistical summary will be populated here -->
                        </div>
                    </div>
                    
                    <div class="viz-card">
                        <h3>Salary Box Plot Analysis</h3>
                        <div class="chart-container">
                            <canvas id="salary-boxplot"></canvas>
                        </div>
                        <div class="chart-stats" id="boxplot-stats">
                            <!-- Box plot statistics will be populated here -->
                        </div>
                    </div>
                    
                    <div class="viz-card">
                        <h3>Pay Equity Gap Analysis</h3>
                        <div class="chart-container">
                            <canvas id="equity-gaps"></canvas>
                        </div>
                        <div class="chart-stats" id="equity-stats">
                            <!-- Equity analysis will be populated here -->
                        </div>
                    </div>
                    
                    <div class="viz-card">
                        <h3>Salary Distribution by Demographics</h3>
                        <div class="chart-container">
                            <canvas id="demographic-distribution"></canvas>
                        </div>
                        <div class="chart-stats" id="demographic-stats">
                            <!-- Demographic analysis will be populated here -->
                        </div>
                    </div>
                    
                    <div class="viz-card full-width">
                        <h3>Comparative Salary Analysis</h3>
                        <div class="chart-container">
                            <canvas id="comparative-analysis"></canvas>
                        </div>
                        <div class="chart-stats" id="comparative-stats">
                            <!-- Comparative analysis will be populated here -->
                        </div>
                    </div>
                </div>
                
                <div class="equity-insights">
                    <h3>Pay Equity Insights</h3>
                    <div class="insights-grid">
                        <div class="insight-card">
                            <h4>Gender Pay Gap</h4>
                            <div class="insight-value" id="gender-gap-value">N/A</div>
                            <div class="insight-description" id="gender-gap-desc">
                                Analysis of salary differences between genders
                            </div>
                        </div>
                        
                        <div class="insight-card">
                            <h4>Country Pay Variance</h4>
                            <div class="insight-value" id="country-variance-value">N/A</div>
                            <div class="insight-description" id="country-variance-desc">
                                Salary variation across different countries
                            </div>
                        </div>
                        
                        <div class="insight-card">
                            <h4>Department Equity Score</h4>
                            <div class="insight-value" id="dept-equity-value">N/A</div>
                            <div class="insight-description" id="dept-equity-desc">
                                Pay equity assessment across departments
                            </div>
                        </div>
                        
                        <div class="insight-card">
                            <h4>Performance Correlation</h4>
                            <div class="insight-value" id="perf-correlation-value">N/A</div>
                            <div class="insight-description" id="perf-correlation-desc">
                                Correlation between performance and compensation
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Filter change handlers
        document.getElementById('viz-country-filter')?.addEventListener('change', () => {
            this.filters.country = document.getElementById('viz-country-filter').value;
            this.updateCharts();
        });
        
        document.getElementById('viz-department-filter')?.addEventListener('change', () => {
            this.filters.department = document.getElementById('viz-department-filter').value;
            this.updateCharts();
        });
        
        document.getElementById('viz-level-filter')?.addEventListener('change', () => {
            this.filters.level = document.getElementById('viz-level-filter').value;
            this.updateCharts();
        });
        
        // Refresh button
        document.getElementById('refresh-viz')?.addEventListener('click', () => {
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
        const countrySelect = document.getElementById('viz-country-filter');
        if (countrySelect) {
            countrySelect.innerHTML = '<option value="all">All Countries</option>';
            countries.forEach(country => {
                countrySelect.innerHTML += `<option value="${country}">${country}</option>`;
            });
        }
        
        // Populate department filter
        const departments = [...new Set(this.employees.map(emp => emp.department || emp.title).filter(Boolean))];
        const deptSelect = document.getElementById('viz-department-filter');
        if (deptSelect) {
            deptSelect.innerHTML = '<option value="all">All Departments</option>';
            departments.forEach(dept => {
                deptSelect.innerHTML += `<option value="${dept}">${dept}</option>`;
            });
        }
        
        // Populate level filter (extract from titles)
        const levels = [...new Set(this.employees.map(emp => this.extractLevel(emp.title)).filter(Boolean))];
        const levelSelect = document.getElementById('viz-level-filter');
        if (levelSelect) {
            levelSelect.innerHTML = '<option value="all">All Levels</option>';
            levels.forEach(level => {
                levelSelect.innerHTML += `<option value="${level}">${level}</option>`;
            });
        }
    }
    
    extractLevel(title) {
        if (!title) return null;
        
        const levelPatterns = [
            /senior|sr\./i,
            /junior|jr\./i,
            /lead|principal/i,
            /manager|mgr/i,
            /director/i,
            /vp|vice president/i,
            /intern/i
        ];
        
        for (const pattern of levelPatterns) {
            if (pattern.test(title)) {
                return pattern.source.split('|')[0].replace(/[^a-zA-Z]/g, '');
            }
        }
        
        return 'Individual Contributor';
    }
    
    getFilteredEmployees() {
        return this.employees.filter(emp => {
            if (this.filters.country !== 'all' && emp.country !== this.filters.country) return false;
            if (this.filters.department !== 'all' && 
                emp.department !== this.filters.department && 
                emp.title !== this.filters.department) return false;
            if (this.filters.level !== 'all' && this.extractLevel(emp.title) !== this.filters.level) return false;
            return true;
        });
    }
    
    createCharts() {
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded yet, waiting...');
            return;
        }
        
        this.createSalaryHistogram();
        this.createSalaryBoxPlot();
        this.createEquityGapChart();
        this.createDemographicDistribution();
        this.createComparativeAnalysis();
        this.updateEquityInsights();
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
    
    showLoadingState() {
        const container = this.container.querySelector('.visualizations-container') || this.container;
        container.innerHTML = `
            <div class="viz-loading-state">
                <div class="loading-spinner"></div>
                <h3>Loading Visualizations...</h3>
                <p>Please wait while we load the charting library and prepare your data visualizations.</p>
            </div>
        `;
    }
    
    hideLoadingState() {
        // Re-render the component
        this.render();
        this.attachEventListeners();
    }
    
    showErrorState(message) {
        const container = this.container.querySelector('.visualizations-container') || this.container;
        container.innerHTML = `
            <div class="viz-error-state">
                <div class="error-icon">⚠️</div>
                <h3>Visualization Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Reload Page</button>
            </div>
        `;
    }
    
    showEmptyState() {
        const container = this.container.querySelector('.visualizations-container') || this.container;
        container.innerHTML = `
            <div class="viz-empty-state">
                <div class="empty-icon">📊</div>
                <h3>No Data Available</h3>
                <p>Upload employee data to view salary visualizations and analytics.</p>
            </div>
        `;
    }
    
    createSalaryHistogram() {
        const canvas = document.getElementById('salary-histogram');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const employees = this.getFilteredEmployees();
        const salaries = employees.map(emp => emp.normalizedSalary || emp.salary || 0);
        
        // Create histogram bins
        const bins = this.createHistogramBins(salaries, 20);
        
        this.charts.histogram = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: bins.labels,
                datasets: [{
                    label: 'Employee Count',
                    data: bins.counts,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Salary Distribution Histogram'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Salary Range (USD)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Employees'
                        }
                    }
                }
            }
        });
        
        // Update statistics
        this.updateHistogramStats(salaries);
    }
    
    createHistogramBins(data, binCount) {
        if (data.length === 0) return { labels: [], counts: [] };
        
        const min = Math.min(...data);
        const max = Math.max(...data);
        const binWidth = (max - min) / binCount;
        
        const bins = Array(binCount).fill(0);
        const labels = [];
        
        // Create bin labels
        for (let i = 0; i < binCount; i++) {
            const start = min + i * binWidth;
            const end = min + (i + 1) * binWidth;
            labels.push(`$${Math.round(start/1000)}k-${Math.round(end/1000)}k`);
        }
        
        // Count data points in each bin
        data.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
            bins[binIndex]++;
        });
        
        return { labels, counts: bins };
    }
    
    updateHistogramStats(salaries) {
        const statsContainer = document.getElementById('histogram-stats');
        if (!statsContainer || salaries.length === 0) return;
        
        const mean = salaries.reduce((sum, val) => sum + val, 0) / salaries.length;
        const sorted = [...salaries].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const stdDev = Math.sqrt(salaries.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / salaries.length);
        
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Mean:</span>
                    <span class="stat-value">$${Math.round(mean).toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Median:</span>
                    <span class="stat-value">$${Math.round(median).toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Std Dev:</span>
                    <span class="stat-value">$${Math.round(stdDev).toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Range:</span>
                    <span class="stat-value">$${Math.round(Math.min(...salaries)).toLocaleString()} - $${Math.round(Math.max(...salaries)).toLocaleString()}</span>
                </div>
            </div>
        `;
    }
    
    createSalaryBoxPlot() {
        const canvas = document.getElementById('salary-boxplot');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const employees = this.getFilteredEmployees();
        
        // Group by department or country for comparison
        const groups = this.groupEmployeesForBoxPlot(employees);
        
        // Create box plot data (simplified as bar chart with error bars)
        const datasets = Object.keys(groups).map((groupName, index) => {
            const salaries = groups[groupName].map(emp => emp.normalizedSalary || emp.salary || 0);
            const stats = this.calculateBoxPlotStats(salaries);
            
            return {
                label: groupName,
                data: [stats.median],
                backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.6)`,
                borderColor: `hsla(${index * 60}, 70%, 50%, 1)`,
                borderWidth: 2,
                errorBars: {
                    plus: stats.q3 - stats.median,
                    minus: stats.median - stats.q1
                }
            };
        });
        
        this.charts.boxplot = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(groups),
                datasets: [{
                    label: 'Median Salary',
                    data: Object.values(groups).map(group => {
                        const salaries = group.map(emp => emp.normalizedSalary || emp.salary || 0);
                        return this.calculateBoxPlotStats(salaries).median;
                    }),
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
                        text: 'Salary Distribution by Group'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Salary (USD)'
                        }
                    }
                }
            }
        });
        
        this.updateBoxPlotStats(groups);
    }
    
    groupEmployeesForBoxPlot(employees) {
        // Group by department if available, otherwise by country
        const groupBy = this.filters.department === 'all' ? 'country' : 'department';
        
        return employees.reduce((groups, emp) => {
            const key = emp[groupBy] || emp.title || 'Unknown';
            if (!groups[key]) groups[key] = [];
            groups[key].push(emp);
            return groups;
        }, {});
    }
    
    calculateBoxPlotStats(data) {
        if (data.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };
        
        const sorted = [...data].sort((a, b) => a - b);
        const n = sorted.length;
        
        return {
            min: sorted[0],
            q1: sorted[Math.floor(n * 0.25)],
            median: sorted[Math.floor(n * 0.5)],
            q3: sorted[Math.floor(n * 0.75)],
            max: sorted[n - 1]
        };
    }
    
    updateBoxPlotStats(groups) {
        const statsContainer = document.getElementById('boxplot-stats');
        if (!statsContainer) return;
        
        let statsHtml = '<div class="group-stats">';
        
        Object.entries(groups).forEach(([groupName, employees]) => {
            const salaries = employees.map(emp => emp.normalizedSalary || emp.salary || 0);
            const stats = this.calculateBoxPlotStats(salaries);
            
            statsHtml += `
                <div class="group-stat">
                    <h5>${groupName}</h5>
                    <div class="stat-details">
                        <span>Q1: $${Math.round(stats.q1).toLocaleString()}</span>
                        <span>Median: $${Math.round(stats.median).toLocaleString()}</span>
                        <span>Q3: $${Math.round(stats.q3).toLocaleString()}</span>
                    </div>
                </div>
            `;
        });
        
        statsHtml += '</div>';
        statsContainer.innerHTML = statsHtml;
    }
    
    createEquityGapChart() {
        const canvas = document.getElementById('equity-gaps');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const employees = this.getFilteredEmployees();
        
        // Calculate pay gaps by different demographics
        const genderGap = this.calculateGenderPayGap(employees);
        const countryGaps = this.calculateCountryPayGaps(employees);
        const levelGaps = this.calculateLevelPayGaps(employees);
        
        // Create gap visualization
        const labels = ['Gender Gap', ...Object.keys(countryGaps), ...Object.keys(levelGaps)];
        const data = [genderGap.gap, ...Object.values(countryGaps), ...Object.values(levelGaps)];
        
        this.charts.equity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pay Gap (%)',
                    data: data,
                    backgroundColor: data.map(gap => gap > 10 ? 'rgba(255, 99, 132, 0.6)' : 
                                                   gap > 5 ? 'rgba(255, 206, 86, 0.6)' : 
                                                   'rgba(75, 192, 192, 0.6)'),
                    borderColor: data.map(gap => gap > 10 ? 'rgba(255, 99, 132, 1)' : 
                                                 gap > 5 ? 'rgba(255, 206, 86, 1)' : 
                                                 'rgba(75, 192, 192, 1)'),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Pay Equity Gap Analysis'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Pay Gap Percentage'
                        }
                    }
                }
            }
        });
        
        this.updateEquityStats({ genderGap, countryGaps, levelGaps });
    }
    
    calculateGenderPayGap(employees) {
        // This is a simplified calculation - in reality you'd need gender data
        // For now, we'll simulate based on name patterns or use placeholder
        const maleEmployees = employees.filter(emp => this.inferGender(emp.name) === 'male');
        const femaleEmployees = employees.filter(emp => this.inferGender(emp.name) === 'female');
        
        if (maleEmployees.length === 0 || femaleEmployees.length === 0) {
            return { gap: 0, maleAvg: 0, femaleAvg: 0 };
        }
        
        const maleAvg = maleEmployees.reduce((sum, emp) => sum + (emp.normalizedSalary || emp.salary || 0), 0) / maleEmployees.length;
        const femaleAvg = femaleEmployees.reduce((sum, emp) => sum + (emp.normalizedSalary || emp.salary || 0), 0) / femaleEmployees.length;
        
        const gap = ((maleAvg - femaleAvg) / maleAvg) * 100;
        
        return { gap: Math.abs(gap), maleAvg, femaleAvg };
    }
    
    inferGender(name) {
        // Simple gender inference based on common names (placeholder)
        const maleNames = ['john', 'michael', 'david', 'james', 'robert', 'william', 'richard', 'thomas'];
        const femaleNames = ['mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica'];
        
        const firstName = name.toLowerCase().split(' ')[0];
        
        if (maleNames.includes(firstName)) return 'male';
        if (femaleNames.includes(firstName)) return 'female';
        return 'unknown';
    }
    
    calculateCountryPayGaps(employees) {
        const countryGroups = employees.reduce((groups, emp) => {
            const country = emp.country || 'Unknown';
            if (!groups[country]) groups[country] = [];
            groups[country].push(emp);
            return groups;
        }, {});
        
        const gaps = {};
        const countries = Object.keys(countryGroups);
        
        if (countries.length < 2) return gaps;
        
        // Calculate gaps relative to highest paying country
        const countryAverages = {};
        countries.forEach(country => {
            const salaries = countryGroups[country].map(emp => emp.normalizedSalary || emp.salary || 0);
            countryAverages[country] = salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length;
        });
        
        const maxAvg = Math.max(...Object.values(countryAverages));
        
        countries.forEach(country => {
            gaps[country] = ((maxAvg - countryAverages[country]) / maxAvg) * 100;
        });
        
        return gaps;
    }
    
    calculateLevelPayGaps(employees) {
        const levelGroups = employees.reduce((groups, emp) => {
            const level = this.extractLevel(emp.title);
            if (!groups[level]) groups[level] = [];
            groups[level].push(emp);
            return groups;
        }, {});
        
        const gaps = {};
        const levels = Object.keys(levelGroups);
        
        if (levels.length < 2) return gaps;
        
        // Calculate gaps within each level (simplified)
        levels.forEach(level => {
            const salaries = levelGroups[level].map(emp => emp.normalizedSalary || emp.salary || 0);
            if (salaries.length > 1) {
                const max = Math.max(...salaries);
                const min = Math.min(...salaries);
                gaps[level] = ((max - min) / max) * 100;
            }
        });
        
        return gaps;
    }
    
    updateEquityStats(equityData) {
        const statsContainer = document.getElementById('equity-stats');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = `
            <div class="equity-summary">
                <h5>Pay Equity Summary</h5>
                <div class="equity-metrics">
                    <div class="metric">
                        <span class="metric-label">Gender Pay Gap:</span>
                        <span class="metric-value ${equityData.genderGap.gap > 10 ? 'high-risk' : equityData.genderGap.gap > 5 ? 'medium-risk' : 'low-risk'}">
                            ${equityData.genderGap.gap.toFixed(1)}%
                        </span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Country Variations:</span>
                        <span class="metric-value">${Object.keys(equityData.countryGaps).length} countries analyzed</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Level Variations:</span>
                        <span class="metric-value">${Object.keys(equityData.levelGaps).length} levels analyzed</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    createDemographicDistribution() {
        const canvas = document.getElementById('demographic-distribution');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const employees = this.getFilteredEmployees();
        
        // Create demographic breakdown
        const countryDistribution = this.calculateDistribution(employees, 'country');
        
        this.charts.demographic = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(countryDistribution),
                datasets: [{
                    data: Object.values(countryDistribution),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
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
                        text: 'Employee Distribution by Country'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        this.updateDemographicStats(countryDistribution);
    }
    
    calculateDistribution(employees, field) {
        return employees.reduce((dist, emp) => {
            const value = emp[field] || 'Unknown';
            dist[value] = (dist[value] || 0) + 1;
            return dist;
        }, {});
    }
    
    updateDemographicStats(distribution) {
        const statsContainer = document.getElementById('demographic-stats');
        if (!statsContainer) return;
        
        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        
        let statsHtml = '<div class="distribution-stats">';
        Object.entries(distribution).forEach(([key, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            statsHtml += `
                <div class="dist-item">
                    <span class="dist-label">${key}:</span>
                    <span class="dist-value">${count} (${percentage}%)</span>
                </div>
            `;
        });
        statsHtml += '</div>';
        
        statsContainer.innerHTML = statsHtml;
    }
    
    createComparativeAnalysis() {
        const canvas = document.getElementById('comparative-analysis');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const employees = this.getFilteredEmployees();
        
        // Create comparative analysis across multiple dimensions
        const countryData = this.getCountryComparison(employees);
        
        this.charts.comparative = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Avg Salary', 'Performance', 'Tenure', 'Satisfaction', 'Growth'],
                datasets: countryData.map((country, index) => ({
                    label: country.name,
                    data: country.metrics,
                    backgroundColor: `hsla(${index * 72}, 70%, 50%, 0.2)`,
                    borderColor: `hsla(${index * 72}, 70%, 50%, 1)`,
                    borderWidth: 2
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparative Analysis by Country'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
        
        this.updateComparativeStats(countryData);
    }
    
    getCountryComparison(employees) {
        const countries = [...new Set(employees.map(emp => emp.country).filter(Boolean))];
        
        return countries.map(country => {
            const countryEmployees = employees.filter(emp => emp.country === country);
            
            // Calculate normalized metrics (0-100 scale)
            const avgSalary = countryEmployees.reduce((sum, emp) => sum + (emp.normalizedSalary || emp.salary || 0), 0) / countryEmployees.length;
            const avgPerformance = countryEmployees.reduce((sum, emp) => sum + (emp.performanceRating || 3), 0) / countryEmployees.length;
            const avgTenure = countryEmployees.reduce((sum, emp) => sum + (emp.timeInRole || 2), 0) / countryEmployees.length;
            
            // Normalize to 0-100 scale
            const maxSalary = Math.max(...employees.map(emp => emp.normalizedSalary || emp.salary || 0));
            
            return {
                name: country,
                metrics: [
                    (avgSalary / maxSalary) * 100,
                    (avgPerformance / 5) * 100,
                    Math.min((avgTenure / 5) * 100, 100),
                    75, // Placeholder for satisfaction
                    70  // Placeholder for growth
                ]
            };
        });
    }
    
    updateComparativeStats(countryData) {
        const statsContainer = document.getElementById('comparative-stats');
        if (!statsContainer) return;
        
        let statsHtml = '<div class="comparative-summary">';
        
        countryData.forEach(country => {
            statsHtml += `
                <div class="country-summary">
                    <h5>${country.name}</h5>
                    <div class="metric-scores">
                        <span>Salary: ${country.metrics[0].toFixed(0)}/100</span>
                        <span>Performance: ${country.metrics[1].toFixed(0)}/100</span>
                        <span>Tenure: ${country.metrics[2].toFixed(0)}/100</span>
                    </div>
                </div>
            `;
        });
        
        statsHtml += '</div>';
        statsContainer.innerHTML = statsHtml;
    }
    
    updateEquityInsights() {
        const employees = this.getFilteredEmployees();
        
        // Calculate key equity metrics
        const genderGap = this.calculateGenderPayGap(employees);
        const countryVariance = this.calculateCountryVariance(employees);
        const deptEquity = this.calculateDepartmentEquity(employees);
        const perfCorrelation = this.calculatePerformanceCorrelation(employees);
        
        // Update insight cards
        this.updateInsightCard('gender-gap', genderGap.gap, '%', this.getGapDescription(genderGap.gap));
        this.updateInsightCard('country-variance', countryVariance, '%', 'Salary variation across countries');
        this.updateInsightCard('dept-equity', deptEquity, '/100', 'Department pay equity score');
        this.updateInsightCard('perf-correlation', perfCorrelation, '', 'Performance-pay correlation strength');
    }
    
    calculateCountryVariance(employees) {
        const countryGroups = employees.reduce((groups, emp) => {
            const country = emp.country || 'Unknown';
            if (!groups[country]) groups[country] = [];
            groups[country].push(emp);
            return groups;
        }, {});
        
        const countryAverages = Object.values(countryGroups).map(group => {
            return group.reduce((sum, emp) => sum + (emp.normalizedSalary || emp.salary || 0), 0) / group.length;
        });
        
        if (countryAverages.length < 2) return 0;
        
        const mean = countryAverages.reduce((sum, avg) => sum + avg, 0) / countryAverages.length;
        const variance = countryAverages.reduce((sum, avg) => sum + Math.pow(avg - mean, 2), 0) / countryAverages.length;
        
        return (Math.sqrt(variance) / mean) * 100;
    }
    
    calculateDepartmentEquity(employees) {
        // Simplified equity score based on salary distribution within departments
        const deptGroups = employees.reduce((groups, emp) => {
            const dept = emp.department || emp.title || 'Unknown';
            if (!groups[dept]) groups[dept] = [];
            groups[dept].push(emp);
            return groups;
        }, {});
        
        let totalEquityScore = 0;
        let deptCount = 0;
        
        Object.values(deptGroups).forEach(group => {
            if (group.length > 1) {
                const salaries = group.map(emp => emp.normalizedSalary || emp.salary || 0);
                const mean = salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length;
                const variance = salaries.reduce((sum, sal) => sum + Math.pow(sal - mean, 2), 0) / salaries.length;
                const cv = Math.sqrt(variance) / mean; // Coefficient of variation
                
                // Lower CV = higher equity (inverted and scaled to 0-100)
                const equityScore = Math.max(0, 100 - (cv * 100));
                totalEquityScore += equityScore;
                deptCount++;
            }
        });
        
        return deptCount > 0 ? totalEquityScore / deptCount : 0;
    }
    
    calculatePerformanceCorrelation(employees) {
        const validEmployees = employees.filter(emp => 
            emp.performanceRating && (emp.normalizedSalary || emp.salary)
        );
        
        if (validEmployees.length < 2) return 0;
        
        const performance = validEmployees.map(emp => emp.performanceRating);
        const salaries = validEmployees.map(emp => emp.normalizedSalary || emp.salary);
        
        return this.calculatePearsonCorrelation(performance, salaries);
    }
    
    calculatePearsonCorrelation(x, y) {
        const n = x.length;
        if (n === 0) return 0;
        
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
        const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }
    
    updateInsightCard(cardId, value, unit, description) {
        const valueElement = document.getElementById(`${cardId}-value`);
        const descElement = document.getElementById(`${cardId}-desc`);
        
        if (valueElement) {
            valueElement.textContent = `${value.toFixed(1)}${unit}`;
            valueElement.className = `insight-value ${this.getValueClass(cardId, value)}`;
        }
        
        if (descElement) {
            descElement.textContent = description;
        }
    }
    
    getValueClass(cardId, value) {
        if (cardId === 'gender-gap' || cardId === 'country-variance') {
            return value > 15 ? 'high-risk' : value > 8 ? 'medium-risk' : 'low-risk';
        } else if (cardId === 'dept-equity') {
            return value > 80 ? 'low-risk' : value > 60 ? 'medium-risk' : 'high-risk';
        } else if (cardId === 'perf-correlation') {
            return Math.abs(value) > 0.7 ? 'low-risk' : Math.abs(value) > 0.4 ? 'medium-risk' : 'high-risk';
        }
        return '';
    }
    
    getGapDescription(gap) {
        if (gap < 5) return 'Minimal pay gap detected';
        if (gap < 10) return 'Moderate pay gap - monitor closely';
        if (gap < 20) return 'Significant pay gap - action recommended';
        return 'Large pay gap - immediate attention required';
    }
    
    exportVisualizationData() {
        const employees = this.getFilteredEmployees();
        
        return {
            summary: {
                totalEmployees: employees.length,
                filters: this.filters,
                timestamp: new Date().toISOString()
            },
            salaryDistribution: this.createHistogramBins(
                employees.map(emp => emp.normalizedSalary || emp.salary || 0), 
                20
            ),
            equityMetrics: {
                genderGap: this.calculateGenderPayGap(employees),
                countryVariance: this.calculateCountryVariance(employees),
                departmentEquity: this.calculateDepartmentEquity(employees),
                performanceCorrelation: this.calculatePerformanceCorrelation(employees)
            },
            demographics: this.calculateDistribution(employees, 'country')
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SalaryVisualization;
} else if (typeof window !== 'undefined') {
    window.SalaryVisualization = SalaryVisualization;
} 