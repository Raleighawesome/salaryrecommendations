/**
 * Performance vs Compensation Analysis Component
 * 
 * Provides scatter plots and correlation analysis between performance ratings
 * and compensation levels to identify pay equity issues and performance alignment.
 * 
 * Features:
 * - Interactive scatter plots with performance vs salary
 * - Correlation coefficient calculations
 * - Trend line visualization
 * - Outlier detection and highlighting
 * - Country and role-based filtering
 * - Pay equity gap analysis
 * - Performance band analysis
 */

class PerformanceCompensationAnalysis {
    constructor() {
        this.container = null;
        this.data = [];
        this.filteredData = [];
        this.correlationData = {};
        this.outliers = [];
        this.trendLines = {};
        
        // Chart configuration
        this.chartConfig = {
            width: 800,
            height: 500,
            margin: { top: 20, right: 80, bottom: 60, left: 80 },
            colors: {
                primary: '#2563eb',
                secondary: '#dc2626',
                success: '#16a34a',
                warning: '#d97706',
                neutral: '#6b7280',
                outlier: '#ef4444'
            }
        };
        
        // Performance rating mappings
        this.performanceMap = {
            'Exceeds Expectations': 5,
            'Meets Expectations': 4,
            'Below Expectations': 3,
            'Needs Improvement': 2,
            'Unsatisfactory': 1,
            '5': 5, '4': 4, '3': 3, '2': 2, '1': 1
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
        this.data = employees.filter(emp => 
            emp.salary && emp.performanceRating && 
            !isNaN(parseFloat(emp.salary)) && 
            this.performanceMap[emp.performanceRating]
        );
        
        this.filteredData = [...this.data];
        this.calculateCorrelations();
        this.detectOutliers();
        this.updateCharts();
    }

    /**
     * Apply filters to the data
     */
    applyFilters(filters) {
        this.filteredData = this.data.filter(emp => {
            // Country filter
            if (filters.countries && filters.countries.length > 0) {
                if (!filters.countries.includes(emp.country)) return false;
            }
            
            // Role filter
            if (filters.roles && filters.roles.length > 0) {
                if (!filters.roles.includes(emp.jobTitle)) return false;
            }
            
            // Salary range filter
            if (filters.salaryRange) {
                const salary = parseFloat(emp.salary);
                if (salary < filters.salaryRange.min || salary > filters.salaryRange.max) {
                    return false;
                }
            }
            
            // Performance filter
            if (filters.performance && filters.performance.length > 0) {
                if (!filters.performance.includes(emp.performanceRating)) return false;
            }
            
            return true;
        });
        
        this.calculateCorrelations();
        this.detectOutliers();
        this.updateCharts();
    }

    /**
     * Calculate correlation coefficients
     */
    calculateCorrelations() {
        if (this.filteredData.length < 2) {
            this.correlationData = {};
            return;
        }
        
        // Overall correlation
        this.correlationData.overall = this.calculatePearsonCorrelation(
            this.filteredData.map(emp => this.performanceMap[emp.performanceRating]),
            this.filteredData.map(emp => parseFloat(emp.salary))
        );
        
        // By country
        this.correlationData.byCountry = {};
        const countries = [...new Set(this.filteredData.map(emp => emp.country))];
        countries.forEach(country => {
            const countryData = this.filteredData.filter(emp => emp.country === country);
            if (countryData.length >= 2) {
                this.correlationData.byCountry[country] = this.calculatePearsonCorrelation(
                    countryData.map(emp => this.performanceMap[emp.performanceRating]),
                    countryData.map(emp => parseFloat(emp.salary))
                );
            }
        });
        
        // By role
        this.correlationData.byRole = {};
        const roles = [...new Set(this.filteredData.map(emp => emp.jobTitle))];
        roles.forEach(role => {
            const roleData = this.filteredData.filter(emp => emp.jobTitle === role);
            if (roleData.length >= 2) {
                this.correlationData.byRole[role] = this.calculatePearsonCorrelation(
                    roleData.map(emp => this.performanceMap[emp.performanceRating]),
                    roleData.map(emp => parseFloat(emp.salary))
                );
            }
        });
    }

    /**
     * Calculate Pearson correlation coefficient
     */
    calculatePearsonCorrelation(x, y) {
        if (x.length !== y.length || x.length === 0) return 0;
        
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }

    /**
     * Detect outliers using IQR method
     */
    detectOutliers() {
        if (this.filteredData.length < 4) {
            this.outliers = [];
            return;
        }
        
        // Calculate salary quartiles for each performance level
        const performanceLevels = [1, 2, 3, 4, 5];
        this.outliers = [];
        
        performanceLevels.forEach(level => {
            const levelData = this.filteredData.filter(emp => 
                this.performanceMap[emp.performanceRating] === level
            );
            
            if (levelData.length < 4) return;
            
            const salaries = levelData.map(emp => parseFloat(emp.salary)).sort((a, b) => a - b);
            const q1 = this.calculateQuartile(salaries, 0.25);
            const q3 = this.calculateQuartile(salaries, 0.75);
            const iqr = q3 - q1;
            const lowerBound = q1 - 1.5 * iqr;
            const upperBound = q3 + 1.5 * iqr;
            
            levelData.forEach(emp => {
                const salary = parseFloat(emp.salary);
                if (salary < lowerBound || salary > upperBound) {
                    this.outliers.push({
                        ...emp,
                        outlierType: salary < lowerBound ? 'low' : 'high',
                        expectedRange: { min: lowerBound, max: upperBound },
                        deviation: salary < lowerBound ? 
                            ((lowerBound - salary) / lowerBound * 100) :
                            ((salary - upperBound) / upperBound * 100)
                    });
                }
            });
        });
    }

    /**
     * Calculate quartile value
     */
    calculateQuartile(sortedArray, percentile) {
        const index = percentile * (sortedArray.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;
        
        if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
        return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
    }

    /**
     * Render the main component structure
     */
    render() {
        this.container.innerHTML = `
            <div class="performance-compensation-analysis">
                <div class="analysis-header">
                    <h3>Performance vs Compensation Analysis</h3>
                    <div class="analysis-controls">
                        <select id="analysisView" class="form-select">
                            <option value="scatter">Scatter Plot</option>
                            <option value="correlation">Correlation Analysis</option>
                            <option value="outliers">Outlier Analysis</option>
                            <option value="bands">Performance Bands</option>
                        </select>
                        <select id="groupBy" class="form-select">
                            <option value="overall">Overall</option>
                            <option value="country">By Country</option>
                            <option value="role">By Role</option>
                        </select>
                    </div>
                </div>
                
                <div class="analysis-content">
                    <div class="chart-container">
                        <canvas id="performanceChart" width="800" height="500"></canvas>
                    </div>
                    
                    <div class="analysis-sidebar">
                        <div class="correlation-summary">
                            <h4>Correlation Summary</h4>
                            <div id="correlationStats"></div>
                        </div>
                        
                        <div class="outlier-summary">
                            <h4>Outlier Analysis</h4>
                            <div id="outlierStats"></div>
                        </div>
                        
                        <div class="insights-panel">
                            <h4>Key Insights</h4>
                            <div id="insightsContent"></div>
                        </div>
                    </div>
                </div>
                
                <div class="detailed-analysis">
                    <div class="tabs">
                        <button class="tab-button active" data-tab="scatter-details">Scatter Analysis</button>
                        <button class="tab-button" data-tab="correlation-details">Correlation Details</button>
                        <button class="tab-button" data-tab="outlier-details">Outlier Details</button>
                        <button class="tab-button" data-tab="recommendations">Recommendations</button>
                    </div>
                    
                    <div class="tab-content">
                        <div id="scatter-details" class="tab-panel active">
                            <div id="scatterAnalysis"></div>
                        </div>
                        <div id="correlation-details" class="tab-panel">
                            <div id="correlationAnalysis"></div>
                        </div>
                        <div id="outlier-details" class="tab-panel">
                            <div id="outlierAnalysis"></div>
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
        // View selection
        const analysisView = this.container.querySelector('#analysisView');
        analysisView?.addEventListener('change', (e) => {
            this.updateChartView(e.target.value);
        });
        
        // Group by selection
        const groupBy = this.container.querySelector('#groupBy');
        groupBy?.addEventListener('change', (e) => {
            this.updateGrouping(e.target.value);
        });
        
        // Tab navigation
        const tabButtons = this.container.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    /**
     * Initialize the chart canvas
     */
    initializeChart() {
        const canvas = this.container.querySelector('#performanceChart');
        if (!canvas) return;
        
        this.ctx = canvas.getContext('2d');
        this.setupCanvasInteraction(canvas);
    }

    /**
     * Setup canvas interaction (hover, click)
     */
    setupCanvasInteraction(canvas) {
        let tooltip = null;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const hoveredPoint = this.findPointAtPosition(x, y);
            
            if (hoveredPoint) {
                this.showTooltip(e, hoveredPoint);
                canvas.style.cursor = 'pointer';
            } else {
                this.hideTooltip();
                canvas.style.cursor = 'default';
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.hideTooltip();
            canvas.style.cursor = 'default';
        });
        
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const clickedPoint = this.findPointAtPosition(x, y);
            if (clickedPoint) {
                this.showEmployeeDetails(clickedPoint);
            }
        });
    }

    /**
     * Update chart view based on selection
     */
    updateChartView(view) {
        switch (view) {
            case 'scatter':
                this.renderScatterPlot();
                break;
            case 'correlation':
                this.renderCorrelationChart();
                break;
            case 'outliers':
                this.renderOutlierChart();
                break;
            case 'bands':
                this.renderPerformanceBands();
                break;
        }
    }

    /**
     * Update grouping and refresh charts
     */
    updateGrouping(groupBy) {
        this.currentGrouping = groupBy;
        this.updateCharts();
    }

    /**
     * Update all charts and statistics
     */
    updateCharts() {
        const view = this.container.querySelector('#analysisView')?.value || 'scatter';
        this.updateChartView(view);
        this.updateCorrelationStats();
        this.updateOutlierStats();
        this.updateInsights();
        this.updateDetailedAnalysis();
    }

    /**
     * Render scatter plot
     */
    renderScatterPlot() {
        if (!this.ctx || this.filteredData.length === 0) return;
        
        const { width, height, margin } = this.chartConfig;
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Calculate scales
        const performanceValues = this.filteredData.map(emp => this.performanceMap[emp.performanceRating]);
        const salaryValues = this.filteredData.map(emp => parseFloat(emp.salary));
        
        const xScale = {
            min: Math.min(...performanceValues) - 0.5,
            max: Math.max(...performanceValues) + 0.5,
            range: plotWidth
        };
        
        const yScale = {
            min: Math.min(...salaryValues) * 0.9,
            max: Math.max(...salaryValues) * 1.1,
            range: plotHeight
        };
        
        // Draw axes
        this.drawAxes(xScale, yScale, margin);
        
        // Draw trend line
        this.drawTrendLine(xScale, yScale, margin);
        
        // Draw data points
        this.drawDataPoints(xScale, yScale, margin);
        
        // Draw outliers
        this.drawOutliers(xScale, yScale, margin);
    }

    /**
     * Draw chart axes
     */
    drawAxes(xScale, yScale, margin) {
        const { ctx } = this;
        
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top + yScale.range);
        ctx.lineTo(margin.left + xScale.range, margin.top + yScale.range);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + yScale.range);
        ctx.stroke();
        
        // X-axis labels (Performance ratings)
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        for (let i = 1; i <= 5; i++) {
            const x = margin.left + ((i - xScale.min) / (xScale.max - xScale.min)) * xScale.range;
            ctx.fillText(i.toString(), x, margin.top + yScale.range + 20);
        }
        
        // Y-axis labels (Salary)
        ctx.textAlign = 'right';
        const yTicks = 5;
        for (let i = 0; i <= yTicks; i++) {
            const value = yScale.min + (yScale.max - yScale.min) * (i / yTicks);
            const y = margin.top + yScale.range - (i / yTicks) * yScale.range;
            ctx.fillText(this.formatCurrency(value), margin.left - 10, y + 4);
        }
        
        // Axis titles
        ctx.textAlign = 'center';
        ctx.font = '14px Arial';
        ctx.fillText('Performance Rating', margin.left + xScale.range / 2, margin.top + yScale.range + 50);
        
        ctx.save();
        ctx.translate(20, margin.top + yScale.range / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Salary', 0, 0);
        ctx.restore();
    }

    /**
     * Draw trend line
     */
    drawTrendLine(xScale, yScale, margin) {
        if (this.filteredData.length < 2) return;
        
        const performanceValues = this.filteredData.map(emp => this.performanceMap[emp.performanceRating]);
        const salaryValues = this.filteredData.map(emp => parseFloat(emp.salary));
        
        // Calculate linear regression
        const regression = this.calculateLinearRegression(performanceValues, salaryValues);
        
        this.ctx.strokeStyle = this.chartConfig.colors.primary;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        
        const x1 = margin.left;
        const y1 = margin.top + yScale.range - 
            ((regression.slope * xScale.min + regression.intercept - yScale.min) / (yScale.max - yScale.min)) * yScale.range;
        
        const x2 = margin.left + xScale.range;
        const y2 = margin.top + yScale.range - 
            ((regression.slope * xScale.max + regression.intercept - yScale.min) / (yScale.max - yScale.min)) * yScale.range;
        
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }

    /**
     * Calculate linear regression
     */
    calculateLinearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    }

    /**
     * Draw data points
     */
    drawDataPoints(xScale, yScale, margin) {
        this.dataPoints = []; // Store for interaction
        
        this.filteredData.forEach(emp => {
            const performance = this.performanceMap[emp.performanceRating];
            const salary = parseFloat(emp.salary);
            
            const x = margin.left + ((performance - xScale.min) / (xScale.max - xScale.min)) * xScale.range;
            const y = margin.top + yScale.range - ((salary - yScale.min) / (yScale.max - yScale.min)) * yScale.range;
            
            // Store point for interaction
            this.dataPoints.push({ x, y, employee: emp });
            
            // Determine color based on country or role
            let color = this.chartConfig.colors.primary;
            if (this.currentGrouping === 'country') {
                color = this.getCountryColor(emp.country);
            } else if (this.currentGrouping === 'role') {
                color = this.getRoleColor(emp.jobTitle);
            }
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Add border for better visibility
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    /**
     * Draw outliers with special highlighting
     */
    drawOutliers(xScale, yScale, margin) {
        this.outliers.forEach(outlier => {
            const performance = this.performanceMap[outlier.performanceRating];
            const salary = parseFloat(outlier.salary);
            
            const x = margin.left + ((performance - xScale.min) / (xScale.max - xScale.min)) * xScale.range;
            const y = margin.top + yScale.range - ((salary - yScale.min) / (yScale.max - yScale.min)) * yScale.range;
            
            // Draw outlier ring
            this.ctx.strokeStyle = this.chartConfig.colors.outlier;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
            this.ctx.stroke();
        });
    }

    /**
     * Get color for country grouping
     */
    getCountryColor(country) {
        const colors = [
            '#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2'
        ];
        const countries = [...new Set(this.filteredData.map(emp => emp.country))];
        const index = countries.indexOf(country) % colors.length;
        return colors[index];
    }

    /**
     * Get color for role grouping
     */
    getRoleColor(role) {
        const colors = [
            '#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2',
            '#be185d', '#059669', '#ea580c', '#4338ca'
        ];
        const roles = [...new Set(this.filteredData.map(emp => emp.jobTitle))];
        const index = roles.indexOf(role) % colors.length;
        return colors[index];
    }

    /**
     * Update correlation statistics display
     */
    updateCorrelationStats() {
        const container = this.container.querySelector('#correlationStats');
        if (!container) return;
        
        let html = '';
        
        if (this.correlationData.overall !== undefined) {
            const strength = this.getCorrelationStrength(this.correlationData.overall);
            html += `
                <div class="stat-item">
                    <span class="stat-label">Overall Correlation:</span>
                    <span class="stat-value ${strength.class}">${this.correlationData.overall.toFixed(3)}</span>
                    <span class="stat-description">${strength.description}</span>
                </div>
            `;
        }
        
        // By country correlations
        if (Object.keys(this.correlationData.byCountry || {}).length > 0) {
            html += '<div class="stat-group"><h5>By Country:</h5>';
            Object.entries(this.correlationData.byCountry).forEach(([country, correlation]) => {
                const strength = this.getCorrelationStrength(correlation);
                html += `
                    <div class="stat-item">
                        <span class="stat-label">${country}:</span>
                        <span class="stat-value ${strength.class}">${correlation.toFixed(3)}</span>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        container.innerHTML = html;
    }

    /**
     * Get correlation strength description
     */
    getCorrelationStrength(correlation) {
        const abs = Math.abs(correlation);
        if (abs >= 0.7) return { class: 'strong', description: 'Strong correlation' };
        if (abs >= 0.5) return { class: 'moderate', description: 'Moderate correlation' };
        if (abs >= 0.3) return { class: 'weak', description: 'Weak correlation' };
        return { class: 'none', description: 'No correlation' };
    }

    /**
     * Update outlier statistics display
     */
    updateOutlierStats() {
        const container = this.container.querySelector('#outlierStats');
        if (!container) return;
        
        const totalOutliers = this.outliers.length;
        const highOutliers = this.outliers.filter(o => o.outlierType === 'high').length;
        const lowOutliers = this.outliers.filter(o => o.outlierType === 'low').length;
        
        container.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Outliers:</span>
                <span class="stat-value">${totalOutliers}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">High Outliers:</span>
                <span class="stat-value warning">${highOutliers}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Low Outliers:</span>
                <span class="stat-value error">${lowOutliers}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Outlier Rate:</span>
                <span class="stat-value">${((totalOutliers / this.filteredData.length) * 100).toFixed(1)}%</span>
            </div>
        `;
    }

    /**
     * Update insights panel
     */
    updateInsights() {
        const container = this.container.querySelector('#insightsContent');
        if (!container) return;
        
        const insights = this.generateInsights();
        
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
     * Generate insights based on analysis
     */
    generateInsights() {
        const insights = [];
        
        // Correlation insights
        if (this.correlationData.overall !== undefined) {
            const correlation = this.correlationData.overall;
            if (correlation < 0.3) {
                insights.push({
                    type: 'warning',
                    icon: '⚠️',
                    title: 'Weak Performance-Pay Alignment',
                    description: `Low correlation (${correlation.toFixed(2)}) suggests performance may not be well reflected in compensation.`
                });
            } else if (correlation > 0.7) {
                insights.push({
                    type: 'success',
                    icon: '✅',
                    title: 'Strong Performance-Pay Alignment',
                    description: `High correlation (${correlation.toFixed(2)}) indicates good alignment between performance and compensation.`
                });
            }
        }
        
        // Outlier insights
        if (this.outliers.length > 0) {
            const outlierRate = (this.outliers.length / this.filteredData.length) * 100;
            if (outlierRate > 10) {
                insights.push({
                    type: 'error',
                    icon: '🚨',
                    title: 'High Outlier Rate',
                    description: `${outlierRate.toFixed(1)}% of employees are compensation outliers, suggesting potential pay equity issues.`
                });
            }
            
            const highOutliers = this.outliers.filter(o => o.outlierType === 'high');
            if (highOutliers.length > 0) {
                insights.push({
                    type: 'info',
                    icon: '💰',
                    title: 'High Compensation Outliers',
                    description: `${highOutliers.length} employees may be overcompensated relative to their performance level.`
                });
            }
            
            const lowOutliers = this.outliers.filter(o => o.outlierType === 'low');
            if (lowOutliers.length > 0) {
                insights.push({
                    type: 'warning',
                    icon: '📉',
                    title: 'Low Compensation Outliers',
                    description: `${lowOutliers.length} employees may be undercompensated relative to their performance level.`
                });
            }
        }
        
        return insights;
    }

    /**
     * Update detailed analysis tabs
     */
    updateDetailedAnalysis() {
        this.updateScatterAnalysis();
        this.updateCorrelationAnalysis();
        this.updateOutlierAnalysis();
        this.updateRecommendations();
    }

    /**
     * Update scatter analysis tab
     */
    updateScatterAnalysis() {
        const container = this.container.querySelector('#scatterAnalysis');
        if (!container) return;
        
        const performanceDistribution = this.calculatePerformanceDistribution();
        const salaryStats = this.calculateSalaryStatistics();
        
        container.innerHTML = `
            <div class="analysis-section">
                <h4>Performance Distribution</h4>
                <div class="distribution-chart">
                    ${Object.entries(performanceDistribution).map(([rating, count]) => `
                        <div class="distribution-bar">
                            <span class="bar-label">${rating}</span>
                            <div class="bar-container">
                                <div class="bar-fill" style="width: ${(count / this.filteredData.length) * 100}%"></div>
                            </div>
                            <span class="bar-value">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="analysis-section">
                <h4>Salary Statistics by Performance</h4>
                <div class="stats-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Performance</th>
                                <th>Count</th>
                                <th>Avg Salary</th>
                                <th>Median</th>
                                <th>Min</th>
                                <th>Max</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(salaryStats).map(([rating, stats]) => `
                                <tr>
                                    <td>${rating}</td>
                                    <td>${stats.count}</td>
                                    <td>${this.formatCurrency(stats.average)}</td>
                                    <td>${this.formatCurrency(stats.median)}</td>
                                    <td>${this.formatCurrency(stats.min)}</td>
                                    <td>${this.formatCurrency(stats.max)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Calculate performance distribution
     */
    calculatePerformanceDistribution() {
        const distribution = {};
        this.filteredData.forEach(emp => {
            const rating = emp.performanceRating;
            distribution[rating] = (distribution[rating] || 0) + 1;
        });
        return distribution;
    }

    /**
     * Calculate salary statistics by performance
     */
    calculateSalaryStatistics() {
        const stats = {};
        
        const performanceRatings = [...new Set(this.filteredData.map(emp => emp.performanceRating))];
        
        performanceRatings.forEach(rating => {
            const ratingData = this.filteredData.filter(emp => emp.performanceRating === rating);
            const salaries = ratingData.map(emp => parseFloat(emp.salary)).sort((a, b) => a - b);
            
            if (salaries.length > 0) {
                stats[rating] = {
                    count: salaries.length,
                    average: salaries.reduce((a, b) => a + b, 0) / salaries.length,
                    median: this.calculateQuartile(salaries, 0.5),
                    min: Math.min(...salaries),
                    max: Math.max(...salaries)
                };
            }
        });
        
        return stats;
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
     * Switch between tabs
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
     * Find point at canvas position
     */
    findPointAtPosition(x, y) {
        if (!this.dataPoints) return null;
        
        return this.dataPoints.find(point => {
            const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
            return distance <= 6; // 6px tolerance
        });
    }

    /**
     * Show tooltip for hovered point
     */
    showTooltip(event, point) {
        let tooltip = document.querySelector('.chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'chart-tooltip';
            document.body.appendChild(tooltip);
        }
        
        const emp = point.employee;
        tooltip.innerHTML = `
            <div class="tooltip-header">${emp.name}</div>
            <div class="tooltip-content">
                <div>Role: ${emp.jobTitle}</div>
                <div>Performance: ${emp.performanceRating}</div>
                <div>Salary: ${this.formatCurrency(emp.salary)}</div>
                <div>Country: ${emp.country}</div>
            </div>
        `;
        
        tooltip.style.display = 'block';
        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY - 10 + 'px';
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.querySelector('.chart-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    /**
     * Show detailed employee information
     */
    showEmployeeDetails(point) {
        const emp = point.employee;
        const isOutlier = this.outliers.find(o => o.name === emp.name);
        
        // Create modal or detailed view
        console.log('Employee details:', emp, isOutlier);
        // Implementation would show a detailed modal
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceCompensationAnalysis;
} else if (typeof window !== 'undefined') {
    window.PerformanceCompensationAnalysis = PerformanceCompensationAnalysis;
}