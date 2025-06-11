/**
 * Risk Assessment and Retention Analysis Component
 * 
 * Provides comprehensive risk assessment and retention insights
 * to identify flight risk employees and predict retention probability.
 * 
 * Features:
 * - Flight risk scoring algorithm
 * - Retention probability modeling
 * - Risk factor analysis
 * - Intervention recommendations
 * - Retention cost analysis
 * - Predictive analytics
 * - Risk mitigation strategies
 */

class RiskRetentionAnalysis {
    constructor() {
        this.container = null;
        this.data = [];
        this.riskScores = [];
        this.retentionProbabilities = [];
        this.riskFactors = {};
        this.interventionCosts = {};
        
        // Risk scoring weights
        this.riskWeights = {
            performanceRating: 0.25,
            salaryComparison: 0.20,
            tenure: 0.15,
            lastRaise: 0.15,
            marketComparison: 0.10,
            roleLevel: 0.10,
            departmentTurnover: 0.05
        };
        
        // Chart configuration
        this.chartConfig = {
            width: 800,
            height: 400,
            margin: { top: 20, right: 80, bottom: 60, left: 80 },
            colors: {
                lowRisk: '#16a34a',
                mediumRisk: '#d97706',
                highRisk: '#dc2626',
                criticalRisk: '#7f1d1d',
                neutral: '#6b7280'
            }
        };
        
        // Risk thresholds
        this.riskThresholds = {
            low: 25,
            medium: 50,
            high: 75,
            critical: 90
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
        this.calculateRiskScores();
        this.calculateRetentionProbabilities();
        this.analyzeRiskFactors();
        this.updateCharts();
    }

    /**
     * Calculate flight risk scores for all employees
     */
    calculateRiskScores() {
        this.riskScores = this.data.map(emp => {
            const scores = {
                employeeId: emp.id,
                name: emp.name,
                department: emp.department,
                role: emp.jobTitle,
                factors: {},
                totalScore: 0,
                riskLevel: 'low'
            };
            
            // Performance rating factor (lower performance = higher risk)
            scores.factors.performance = this.calculatePerformanceRisk(emp.performanceRating);
            
            // Salary comparison factor (underpaid = higher risk)
            scores.factors.salary = this.calculateSalaryRisk(emp);
            
            // Tenure factor (very new or very long = higher risk)
            scores.factors.tenure = this.calculateTenureRisk(emp.tenure);
            
            // Last raise factor (no recent raise = higher risk)
            scores.factors.lastRaise = this.calculateLastRaiseRisk(emp.lastRaiseDate);
            
            // Market comparison factor (below market = higher risk)
            scores.factors.market = this.calculateMarketRisk(emp);
            
            // Role level factor (senior roles = higher impact)
            scores.factors.roleLevel = this.calculateRoleLevelRisk(emp.jobTitle);
            
            // Department turnover factor
            scores.factors.departmentTurnover = this.calculateDepartmentTurnoverRisk(emp.department);
            
            // Calculate weighted total score
            scores.totalScore = Object.keys(this.riskWeights).reduce((total, factor) => {
                const factorKey = factor === 'performanceRating' ? 'performance' :
                                factor === 'salaryComparison' ? 'salary' :
                                factor === 'lastRaise' ? 'lastRaise' :
                                factor === 'marketComparison' ? 'market' :
                                factor === 'departmentTurnover' ? 'departmentTurnover' :
                                factor;
                
                return total + (scores.factors[factorKey] || 0) * this.riskWeights[factor];
            }, 0);
            
            // Determine risk level
            scores.riskLevel = this.determineRiskLevel(scores.totalScore);
            
            return scores;
        });
    }

    /**
     * Calculate performance-based risk
     */
    calculatePerformanceRisk(performanceRating) {
        const performanceMap = {
            'Exceeds Expectations': 10,
            'Meets Expectations': 30,
            'Below Expectations': 70,
            'Needs Improvement': 85,
            'Unsatisfactory': 95,
            '5': 10, '4': 30, '3': 50, '2': 70, '1': 90
        };
        
        return performanceMap[performanceRating] || 50;
    }

    /**
     * Calculate salary-based risk
     */
    calculateSalaryRisk(employee) {
        // Compare to department/role average
        const similarEmployees = this.data.filter(emp => 
            emp.department === employee.department && 
            emp.jobTitle === employee.jobTitle &&
            emp.id !== employee.id
        );
        
        if (similarEmployees.length === 0) return 30; // Default moderate risk
        
        const avgSalary = similarEmployees.reduce((sum, emp) => sum + parseFloat(emp.salary), 0) / similarEmployees.length;
        const empSalary = parseFloat(employee.salary);
        const salaryRatio = empSalary / avgSalary;
        
        // Lower salary relative to peers = higher risk
        if (salaryRatio < 0.85) return 80;
        if (salaryRatio < 0.95) return 60;
        if (salaryRatio < 1.05) return 30;
        if (salaryRatio < 1.15) return 20;
        return 15; // Well compensated
    }

    /**
     * Calculate tenure-based risk
     */
    calculateTenureRisk(tenure) {
        if (!tenure) return 40;
        
        const years = parseFloat(tenure);
        
        // U-shaped curve: very new and very long tenure have higher risk
        if (years < 0.5) return 70; // Very new
        if (years < 1) return 50;   // New
        if (years < 2) return 30;   // Settling in
        if (years < 5) return 20;   // Stable
        if (years < 10) return 25;  // Experienced
        if (years < 15) return 35;  // Long tenure
        return 50; // Very long tenure (retirement risk)
    }

    /**
     * Calculate last raise risk
     */
    calculateLastRaiseRisk(lastRaiseDate) {
        if (!lastRaiseDate) return 60; // No raise data
        
        const lastRaise = new Date(lastRaiseDate);
        const now = new Date();
        const monthsSinceRaise = (now - lastRaise) / (1000 * 60 * 60 * 24 * 30);
        
        if (monthsSinceRaise < 6) return 15;  // Recent raise
        if (monthsSinceRaise < 12) return 25; // Within a year
        if (monthsSinceRaise < 18) return 45; // Over a year
        if (monthsSinceRaise < 24) return 65; // Over 18 months
        return 80; // Over 2 years
    }

    /**
     * Calculate market comparison risk
     */
    calculateMarketRisk(employee) {
        // Simplified market comparison based on role and location
        const marketData = this.getMarketData(employee.jobTitle, employee.country);
        const empSalary = parseFloat(employee.salary);
        
        if (!marketData) return 40; // No market data
        
        const marketRatio = empSalary / marketData.median;
        
        if (marketRatio < 0.8) return 85;  // Significantly below market
        if (marketRatio < 0.9) return 65;  // Below market
        if (marketRatio < 1.0) return 45;  // Slightly below market
        if (marketRatio < 1.1) return 25;  // At market
        return 15; // Above market
    }

    /**
     * Get market data for role and location
     */
    getMarketData(role, country) {
        // Simplified market data - in real implementation, this would come from external sources
        const marketRanges = {
            'Software Engineer': { US: 95000, India: 25000, UK: 65000 },
            'Senior Software Engineer': { US: 130000, India: 40000, UK: 85000 },
            'Engineering Manager': { US: 160000, India: 60000, UK: 110000 },
            'Product Manager': { US: 140000, India: 35000, UK: 90000 },
            'Data Scientist': { US: 120000, India: 30000, UK: 75000 }
        };
        
        const roleData = marketRanges[role];
        if (!roleData || !roleData[country]) return null;
        
        return {
            median: roleData[country],
            p25: roleData[country] * 0.85,
            p75: roleData[country] * 1.15
        };
    }

    /**
     * Calculate role level risk
     */
    calculateRoleLevelRisk(jobTitle) {
        // Senior roles have higher impact when they leave
        const seniorityMap = {
            'intern': 20,
            'junior': 25,
            'engineer': 30,
            'senior': 45,
            'staff': 55,
            'principal': 65,
            'manager': 60,
            'director': 75,
            'vp': 85,
            'cto': 90,
            'ceo': 95
        };
        
        const title = jobTitle.toLowerCase();
        for (const [level, risk] of Object.entries(seniorityMap)) {
            if (title.includes(level)) {
                return risk;
            }
        }
        
        return 35; // Default mid-level risk
    }

    /**
     * Calculate department turnover risk
     */
    calculateDepartmentTurnoverRisk(department) {
        // Simplified department risk - in real implementation, use historical turnover data
        const departmentRisk = {
            'Engineering': 40,
            'Sales': 55,
            'Marketing': 50,
            'Customer Success': 45,
            'HR': 35,
            'Finance': 30,
            'Operations': 35
        };
        
        return departmentRisk[department] || 40;
    }

    /**
     * Determine risk level from score
     */
    determineRiskLevel(score) {
        if (score >= this.riskThresholds.critical) return 'critical';
        if (score >= this.riskThresholds.high) return 'high';
        if (score >= this.riskThresholds.medium) return 'medium';
        return 'low';
    }

    /**
     * Calculate retention probabilities
     */
    calculateRetentionProbabilities() {
        this.retentionProbabilities = this.riskScores.map(riskData => {
            // Convert risk score to retention probability (inverse relationship)
            const retentionScore = 100 - riskData.totalScore;
            
            // Calculate probabilities for different time horizons
            const probabilities = {
                employeeId: riskData.employeeId,
                name: riskData.name,
                sixMonths: Math.max(0, Math.min(100, retentionScore + 10)),
                oneYear: Math.max(0, Math.min(100, retentionScore)),
                twoYears: Math.max(0, Math.min(100, retentionScore - 15)),
                threeYears: Math.max(0, Math.min(100, retentionScore - 25))
            };
            
            return probabilities;
        });
    }

    /**
     * Analyze risk factors across the organization
     */
    analyzeRiskFactors() {
        this.riskFactors = {
            byDepartment: {},
            byRole: {},
            byTenure: {},
            byPerformance: {},
            topFactors: []
        };
        
        // Analyze by department
        const departments = [...new Set(this.data.map(emp => emp.department))];
        departments.forEach(dept => {
            const deptEmployees = this.riskScores.filter(emp => emp.department === dept);
            this.riskFactors.byDepartment[dept] = {
                totalEmployees: deptEmployees.length,
                avgRiskScore: deptEmployees.reduce((sum, emp) => sum + emp.totalScore, 0) / deptEmployees.length,
                highRiskCount: deptEmployees.filter(emp => emp.riskLevel === 'high' || emp.riskLevel === 'critical').length,
                criticalRiskCount: deptEmployees.filter(emp => emp.riskLevel === 'critical').length
            };
        });
        
        // Analyze by role
        const roles = [...new Set(this.data.map(emp => emp.jobTitle))];
        roles.forEach(role => {
            const roleEmployees = this.riskScores.filter(emp => emp.role === role);
            this.riskFactors.byRole[role] = {
                totalEmployees: roleEmployees.length,
                avgRiskScore: roleEmployees.reduce((sum, emp) => sum + emp.totalScore, 0) / roleEmployees.length,
                highRiskCount: roleEmployees.filter(emp => emp.riskLevel === 'high' || emp.riskLevel === 'critical').length
            };
        });
        
        // Identify top risk factors
        const factorAverages = {};
        Object.keys(this.riskWeights).forEach(factor => {
            const factorKey = factor === 'performanceRating' ? 'performance' :
                            factor === 'salaryComparison' ? 'salary' :
                            factor === 'lastRaise' ? 'lastRaise' :
                            factor === 'marketComparison' ? 'market' :
                            factor === 'departmentTurnover' ? 'departmentTurnover' :
                            factor;
            
            factorAverages[factor] = this.riskScores.reduce((sum, emp) => 
                sum + (emp.factors[factorKey] || 0), 0) / this.riskScores.length;
        });
        
        this.riskFactors.topFactors = Object.entries(factorAverages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
    }

    /**
     * Render the main component structure
     */
    render() {
        this.container.innerHTML = `
            <div class="risk-retention-analysis">
                <div class="analysis-header">
                    <h3>Risk Assessment & Retention Analysis</h3>
                    <div class="analysis-controls">
                        <select id="riskView" class="form-select">
                            <option value="overview">Risk Overview</option>
                            <option value="individual">Individual Risk Scores</option>
                            <option value="retention">Retention Probabilities</option>
                            <option value="factors">Risk Factor Analysis</option>
                        </select>
                        <select id="timeHorizon" class="form-select">
                            <option value="sixMonths">6 Months</option>
                            <option value="oneYear">1 Year</option>
                            <option value="twoYears">2 Years</option>
                            <option value="threeYears">3 Years</option>
                        </select>
                        <button id="exportRiskReport" class="btn btn-secondary">Export Report</button>
                    </div>
                </div>
                
                <div class="risk-summary">
                    <div class="summary-cards">
                        <div class="summary-card critical-risk">
                            <h4>Critical Risk</h4>
                            <div class="card-value" id="criticalRiskCount">0</div>
                            <div class="card-subtitle">employees</div>
                        </div>
                        <div class="summary-card high-risk">
                            <h4>High Risk</h4>
                            <div class="card-value" id="highRiskCount">0</div>
                            <div class="card-subtitle">employees</div>
                        </div>
                        <div class="summary-card medium-risk">
                            <h4>Medium Risk</h4>
                            <div class="card-value" id="mediumRiskCount">0</div>
                            <div class="card-subtitle">employees</div>
                        </div>
                        <div class="summary-card avg-retention">
                            <h4>Avg Retention Probability</h4>
                            <div class="card-value" id="avgRetention">0%</div>
                            <div class="card-subtitle">next 12 months</div>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-content">
                    <div class="chart-section">
                        <div class="chart-container">
                            <canvas id="riskChart" width="800" height="400"></canvas>
                        </div>
                        
                        <div class="chart-controls">
                            <div class="chart-tabs">
                                <button class="chart-tab active" data-chart="distribution">Risk Distribution</button>
                                <button class="chart-tab" data-chart="retention">Retention Curves</button>
                                <button class="chart-tab" data-chart="factors">Risk Factors</button>
                                <button class="chart-tab" data-chart="departments">By Department</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="analysis-sidebar">
                        <div class="high-risk-panel">
                            <h4>High Risk Employees</h4>
                            <div id="highRiskList"></div>
                        </div>
                        
                        <div class="interventions-panel">
                            <h4>Recommended Interventions</h4>
                            <div id="interventionsList"></div>
                        </div>
                        
                        <div class="insights-panel">
                            <h4>Key Insights</h4>
                            <div id="riskInsights"></div>
                        </div>
                    </div>
                </div>
                
                <div class="detailed-analysis">
                    <div class="tabs">
                        <button class="tab-button active" data-tab="individual-scores">Individual Scores</button>
                        <button class="tab-button" data-tab="factor-analysis">Factor Analysis</button>
                        <button class="tab-button" data-tab="retention-modeling">Retention Modeling</button>
                        <button class="tab-button" data-tab="action-plan">Action Plan</button>
                    </div>
                    
                    <div class="tab-content">
                        <div id="individual-scores" class="tab-panel active">
                            <div id="individualScoresContent"></div>
                        </div>
                        <div id="factor-analysis" class="tab-panel">
                            <div id="factorAnalysisContent"></div>
                        </div>
                        <div id="retention-modeling" class="tab-panel">
                            <div id="retentionModelingContent"></div>
                        </div>
                        <div id="action-plan" class="tab-panel">
                            <div id="actionPlanContent"></div>
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
        const riskView = this.container.querySelector('#riskView');
        riskView?.addEventListener('change', (e) => {
            this.updateView(e.target.value);
        });
        
        // Time horizon selection
        const timeHorizon = this.container.querySelector('#timeHorizon');
        timeHorizon?.addEventListener('change', (e) => {
            this.updateTimeHorizon(e.target.value);
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
        const exportBtn = this.container.querySelector('#exportRiskReport');
        exportBtn?.addEventListener('click', () => {
            this.exportRiskReport();
        });
    }

    /**
     * Initialize the chart canvas
     */
    initializeChart() {
        const canvas = this.container.querySelector('#riskChart');
        if (!canvas) return;
        
        this.ctx = canvas.getContext('2d');
    }

    /**
     * Update all charts and displays
     */
    updateCharts() {
        this.updateSummaryCards();
        this.updateRiskChart();
        this.updateHighRiskList();
        this.updateInterventions();
        this.updateInsights();
        this.updateDetailedAnalysis();
    }

    /**
     * Update summary cards
     */
    updateSummaryCards() {
        const riskCounts = {
            critical: this.riskScores.filter(emp => emp.riskLevel === 'critical').length,
            high: this.riskScores.filter(emp => emp.riskLevel === 'high').length,
            medium: this.riskScores.filter(emp => emp.riskLevel === 'medium').length,
            low: this.riskScores.filter(emp => emp.riskLevel === 'low').length
        };
        
        this.container.querySelector('#criticalRiskCount').textContent = riskCounts.critical;
        this.container.querySelector('#highRiskCount').textContent = riskCounts.high;
        this.container.querySelector('#mediumRiskCount').textContent = riskCounts.medium;
        
        // Calculate average retention probability
        const avgRetention = this.retentionProbabilities.reduce((sum, emp) => 
            sum + emp.oneYear, 0) / this.retentionProbabilities.length;
        this.container.querySelector('#avgRetention').textContent = `${avgRetention.toFixed(1)}%`;
    }

    /**
     * Update risk chart
     */
    updateRiskChart() {
        const activeTab = this.container.querySelector('.chart-tab.active')?.dataset.chart || 'distribution';
        
        switch (activeTab) {
            case 'distribution':
                this.renderRiskDistribution();
                break;
            case 'retention':
                this.renderRetentionCurves();
                break;
            case 'factors':
                this.renderRiskFactors();
                break;
            case 'departments':
                this.renderDepartmentRisk();
                break;
        }
    }

    /**
     * Render risk distribution chart
     */
    renderRiskDistribution() {
        if (!this.ctx || this.riskScores.length === 0) return;
        
        const { width, height, margin } = this.chartConfig;
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Count employees by risk level
        const riskCounts = {
            low: this.riskScores.filter(emp => emp.riskLevel === 'low').length,
            medium: this.riskScores.filter(emp => emp.riskLevel === 'medium').length,
            high: this.riskScores.filter(emp => emp.riskLevel === 'high').length,
            critical: this.riskScores.filter(emp => emp.riskLevel === 'critical').length
        };
        
        const categories = Object.keys(riskCounts);
        const values = Object.values(riskCounts);
        const maxValue = Math.max(...values);
        
        // Draw bars
        const barWidth = plotWidth / (categories.length * 1.5);
        const spacing = barWidth * 0.5;
        
        categories.forEach((category, i) => {
            const x = margin.left + i * (barWidth + spacing);
            const barHeight = (values[i] / maxValue) * plotHeight;
            const y = margin.top + plotHeight - barHeight;
            
            // Set color based on risk level
            this.ctx.fillStyle = this.chartConfig.colors[category + 'Risk'] || this.chartConfig.colors.neutral;
            this.ctx.fillRect(x, y, barWidth, barHeight);
            
            // Add value label on top of bar
            this.ctx.fillStyle = '#374151';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(values[i].toString(), x + barWidth / 2, y - 5);
            
            // Add category label
            this.ctx.fillText(category.charAt(0).toUpperCase() + category.slice(1), 
                            x + barWidth / 2, margin.top + plotHeight + 20);
        });
        
        // Add title
        this.ctx.fillStyle = '#1f2937';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Employee Risk Distribution', width / 2, 20);
    }

    /**
     * Update high risk employees list
     */
    updateHighRiskList() {
        const container = this.container.querySelector('#highRiskList');
        if (!container) return;
        
        const highRiskEmployees = this.riskScores
            .filter(emp => emp.riskLevel === 'high' || emp.riskLevel === 'critical')
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10);
        
        if (highRiskEmployees.length === 0) {
            container.innerHTML = '<div class="no-risk-message">No high-risk employees identified</div>';
            return;
        }
        
        container.innerHTML = highRiskEmployees.map(emp => `
            <div class="risk-employee-item ${emp.riskLevel}">
                <div class="employee-info">
                    <div class="employee-name">${emp.name}</div>
                    <div class="employee-details">${emp.role} • ${emp.department}</div>
                </div>
                <div class="risk-score">
                    <div class="score-value">${emp.totalScore.toFixed(0)}</div>
                    <div class="risk-level">${emp.riskLevel}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update interventions recommendations
     */
    updateInterventions() {
        const container = this.container.querySelector('#interventionsList');
        if (!container) return;
        
        const interventions = this.generateInterventions();
        
        container.innerHTML = interventions.map(intervention => `
            <div class="intervention-item ${intervention.priority}">
                <div class="intervention-header">
                    <div class="intervention-title">${intervention.title}</div>
                    <div class="intervention-priority">${intervention.priority}</div>
                </div>
                <div class="intervention-description">${intervention.description}</div>
                <div class="intervention-impact">Expected Impact: ${intervention.impact}</div>
            </div>
        `).join('');
    }

    /**
     * Generate intervention recommendations
     */
    generateInterventions() {
        const interventions = [];
        
        // Analyze top risk factors
        const topFactors = this.riskFactors.topFactors || [];
        
        topFactors.forEach(([factor, avgScore]) => {
            if (avgScore > 50) {
                let intervention = null;
                
                switch (factor) {
                    case 'salaryComparison':
                        intervention = {
                            title: 'Salary Equity Review',
                            description: 'Conduct comprehensive salary review to address compensation gaps',
                            priority: 'high',
                            impact: 'High - directly addresses compensation concerns'
                        };
                        break;
                    case 'performanceRating':
                        intervention = {
                            title: 'Performance Improvement Program',
                            description: 'Implement targeted performance coaching and development plans',
                            priority: 'medium',
                            impact: 'Medium - improves performance and engagement'
                        };
                        break;
                    case 'lastRaise':
                        intervention = {
                            title: 'Raise Cycle Review',
                            description: 'Accelerate raise cycles for employees without recent increases',
                            priority: 'high',
                            impact: 'High - shows recognition and career progression'
                        };
                        break;
                    case 'marketComparison':
                        intervention = {
                            title: 'Market Benchmarking',
                            description: 'Update compensation bands to match current market rates',
                            priority: 'high',
                            impact: 'High - ensures competitive positioning'
                        };
                        break;
                }
                
                if (intervention) {
                    interventions.push(intervention);
                }
            }
        });
        
        // Add general interventions
        const criticalRiskCount = this.riskScores.filter(emp => emp.riskLevel === 'critical').length;
        if (criticalRiskCount > 0) {
            interventions.push({
                title: 'Immediate Retention Meetings',
                description: `Schedule one-on-one meetings with ${criticalRiskCount} critical risk employees`,
                priority: 'critical',
                impact: 'Critical - immediate action required'
            });
        }
        
        return interventions.slice(0, 5); // Top 5 interventions
    }

    /**
     * Update insights panel
     */
    updateInsights() {
        const container = this.container.querySelector('#riskInsights');
        if (!container) return;
        
        const insights = this.generateRiskInsights();
        
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
     * Generate risk insights
     */
    generateRiskInsights() {
        const insights = [];
        
        // Overall risk assessment
        const totalEmployees = this.riskScores.length;
        const highRiskCount = this.riskScores.filter(emp => 
            emp.riskLevel === 'high' || emp.riskLevel === 'critical').length;
        const riskPercentage = (highRiskCount / totalEmployees) * 100;
        
        if (riskPercentage > 20) {
            insights.push({
                type: 'error',
                icon: '🚨',
                title: 'High Organization Risk',
                description: `${riskPercentage.toFixed(1)}% of employees are at high flight risk, requiring immediate attention.`
            });
        } else if (riskPercentage > 10) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Elevated Risk Levels',
                description: `${riskPercentage.toFixed(1)}% of employees are at high flight risk, monitor closely.`
            });
        } else {
            insights.push({
                type: 'success',
                icon: '✅',
                title: 'Manageable Risk Levels',
                description: `Only ${riskPercentage.toFixed(1)}% of employees are at high flight risk.`
            });
        }
        
        // Department-specific insights
        const deptRisks = Object.entries(this.riskFactors.byDepartment || {})
            .sort(([,a], [,b]) => b.avgRiskScore - a.avgRiskScore);
        
        if (deptRisks.length > 0) {
            const [highestRiskDept, riskData] = deptRisks[0];
            if (riskData.avgRiskScore > 60) {
                insights.push({
                    type: 'warning',
                    icon: '🏢',
                    title: 'Department Risk Alert',
                    description: `${highestRiskDept} has the highest average risk score (${riskData.avgRiskScore.toFixed(1)}).`
                });
            }
        }
        
        // Retention probability insight
        const avgRetention = this.retentionProbabilities.reduce((sum, emp) => 
            sum + emp.oneYear, 0) / this.retentionProbabilities.length;
        
        if (avgRetention < 70) {
            insights.push({
                type: 'error',
                icon: '📉',
                title: 'Low Retention Probability',
                description: `Average 1-year retention probability is only ${avgRetention.toFixed(1)}%.`
            });
        } else if (avgRetention > 85) {
            insights.push({
                type: 'success',
                icon: '📈',
                title: 'Strong Retention Outlook',
                description: `High average 1-year retention probability of ${avgRetention.toFixed(1)}%.`
            });
        }
        
        return insights;
    }

    /**
     * Update detailed analysis tabs
     */
    updateDetailedAnalysis() {
        this.updateIndividualScores();
        this.updateFactorAnalysis();
        this.updateRetentionModeling();
        this.updateActionPlan();
    }

    /**
     * Update individual scores tab
     */
    updateIndividualScores() {
        const container = this.container.querySelector('#individualScoresContent');
        if (!container) return;
        
        const sortedEmployees = [...this.riskScores].sort((a, b) => b.totalScore - a.totalScore);
        
        container.innerHTML = `
            <div class="scores-table">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Risk Score</th>
                            <th>Risk Level</th>
                            <th>Top Risk Factor</th>
                            <th>Retention (1yr)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedEmployees.map(emp => {
                            const retention = this.retentionProbabilities.find(r => r.employeeId === emp.employeeId);
                            const topFactor = Object.entries(emp.factors)
                                .sort(([,a], [,b]) => b - a)[0];
                            
                            return `
                                <tr class="risk-${emp.riskLevel}">
                                    <td>${emp.name}</td>
                                    <td>${emp.department}</td>
                                    <td>${emp.role}</td>
                                    <td>${emp.totalScore.toFixed(1)}</td>
                                    <td><span class="risk-badge ${emp.riskLevel}">${emp.riskLevel}</span></td>
                                    <td>${topFactor[0]} (${topFactor[1].toFixed(0)})</td>
                                    <td>${retention ? retention.oneYear.toFixed(1) + '%' : 'N/A'}</td>
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
        this.updateRiskChart();
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
     * Export risk report
     */
    exportRiskReport() {
        const reportData = {
            summary: {
                totalEmployees: this.riskScores.length,
                riskDistribution: {
                    critical: this.riskScores.filter(emp => emp.riskLevel === 'critical').length,
                    high: this.riskScores.filter(emp => emp.riskLevel === 'high').length,
                    medium: this.riskScores.filter(emp => emp.riskLevel === 'medium').length,
                    low: this.riskScores.filter(emp => emp.riskLevel === 'low').length
                }
            },
            riskScores: this.riskScores,
            retentionProbabilities: this.retentionProbabilities,
            riskFactors: this.riskFactors,
            interventions: this.generateInterventions(),
            insights: this.generateRiskInsights(),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `risk-retention-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Placeholder methods for remaining functionality
    updateView(view) {
        // Implementation for different view types
    }

    updateTimeHorizon(horizon) {
        // Implementation for time horizon changes
    }

    renderRetentionCurves() {
        // Implementation for retention probability curves
    }

    renderRiskFactors() {
        // Implementation for risk factors visualization
    }

    renderDepartmentRisk() {
        // Implementation for department risk comparison
    }

    updateFactorAnalysis() {
        // Implementation for detailed factor analysis
    }

    updateRetentionModeling() {
        // Implementation for retention modeling details
    }

    updateActionPlan() {
        // Implementation for action plan generation
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RiskRetentionAnalysis;
} else if (typeof window !== 'undefined') {
    window.RiskRetentionAnalysis = RiskRetentionAnalysis;
}