/**
 * Budget Optimizer Component
 * 
 * Provides intelligent budget optimization suggestions to maximize
 * impact while staying within budget constraints and maintaining fairness.
 */

// Note: This component depends on raiseCalculator.js being loaded first

class BudgetOptimizer {
    constructor(container) {
        this.container = container;
        this.employees = [];
        this.budgetConstraints = {};
        this.optimizationResults = null;
        this.selectedOptimization = null;
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="budget-optimizer">
                <div class="optimizer-header">
                    <h2>Budget Optimization Engine</h2>
                    <p>AI-powered suggestions to optimize your salary budget for maximum impact and fairness</p>
                </div>
                
                <div class="optimization-setup">
                    <div class="setup-section">
                        <h3>Optimization Parameters</h3>
                        <div class="parameters-grid">
                            <div class="parameter-group">
                                <label for="budget-amount">Available Budget</label>
                                <input type="number" id="budget-amount" placeholder="Enter budget amount" min="0" step="1000">
                                <select id="budget-currency">
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="INR">INR</option>
                                    <option value="CAD">CAD</option>
                                </select>
                            </div>
                            
                            <div class="parameter-group">
                                <label for="optimization-goal">Primary Goal</label>
                                <select id="optimization-goal">
                                    <option value="retention">Maximize Retention (Focus on Flight Risk)</option>
                                    <option value="performance">Reward Performance (Focus on High Performers)</option>
                                    <option value="equity">Improve Equity (Focus on Underpaid)</option>
                                    <option value="balanced">Balanced Approach</option>
                                </select>
                            </div>
                            
                            <div class="parameter-group">
                                <label for="min-raise">Minimum Raise %</label>
                                <input type="number" id="min-raise" value="2" min="0" max="10" step="0.5">
                                <span>%</span>
                            </div>
                            
                            <div class="parameter-group">
                                <label for="max-raise">Maximum Raise %</label>
                                <input type="number" id="max-raise" value="15" min="5" max="50" step="0.5">
                                <span>%</span>
                            </div>
                        </div>
                        
                        <div class="optimization-constraints">
                            <h4>Optimization Constraints</h4>
                            <div class="constraints-grid">
                                <label class="constraint-checkbox">
                                    <input type="checkbox" id="respect-country-limits" checked>
                                    Respect country-specific raise limits
                                </label>
                                <label class="constraint-checkbox">
                                    <input type="checkbox" id="prioritize-high-performers" checked>
                                    Prioritize high performers (4-5 rating)
                                </label>
                                <label class="constraint-checkbox">
                                    <input type="checkbox" id="address-flight-risk" checked>
                                    Address flight risk employees first
                                </label>
                                <label class="constraint-checkbox">
                                    <input type="checkbox" id="maintain-equity" checked>
                                    Maintain pay equity across similar roles
                                </label>
                            </div>
                        </div>
                        
                        <button id="run-optimization" class="btn btn-primary btn-large">
                            Run Budget Optimization
                        </button>
                    </div>
                </div>
                
                <div class="optimization-results" style="display: none;">
                    <h3>Optimization Results</h3>
                    
                    <div class="results-summary">
                        <div class="summary-cards">
                            <div class="summary-card">
                                <h4>Budget Utilization</h4>
                                <div class="utilization-display">
                                    <span class="utilization-value" id="budget-utilization">0%</span>
                                    <div class="utilization-bar">
                                        <div class="utilization-fill" id="utilization-fill"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="summary-card">
                                <h4>Employees Affected</h4>
                                <span class="summary-value" id="affected-employees">0</span>
                            </div>
                            
                            <div class="summary-card">
                                <h4>Average Raise</h4>
                                <span class="summary-value" id="average-raise">0%</span>
                            </div>
                            
                            <div class="summary-card">
                                <h4>Optimization Score</h4>
                                <span class="summary-value" id="optimization-score">0/100</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="optimization-strategies">
                        <h4>Recommended Strategies</h4>
                        <div class="strategies-grid" id="strategies-grid">
                            <!-- Optimization strategies will be populated here -->
                        </div>
                    </div>
                    
                    <div class="impact-analysis">
                        <h4>Impact Analysis</h4>
                        <div class="impact-metrics">
                            <div class="impact-card">
                                <h5>Retention Impact</h5>
                                <div class="impact-details">
                                    <div class="impact-item">
                                        <span>Flight Risk Addressed:</span>
                                        <span id="flight-risk-addressed">0</span>
                                    </div>
                                    <div class="impact-item">
                                        <span>Retention Score:</span>
                                        <span id="retention-score">0/100</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="impact-card">
                                <h5>Performance Impact</h5>
                                <div class="impact-details">
                                    <div class="impact-item">
                                        <span>High Performers Rewarded:</span>
                                        <span id="high-performers-rewarded">0</span>
                                    </div>
                                    <div class="impact-item">
                                        <span>Performance Score:</span>
                                        <span id="performance-score">0/100</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="impact-card">
                                <h5>Equity Impact</h5>
                                <div class="impact-details">
                                    <div class="impact-item">
                                        <span>Underpaid Addressed:</span>
                                        <span id="underpaid-addressed">0</span>
                                    </div>
                                    <div class="impact-item">
                                        <span>Equity Score:</span>
                                        <span id="equity-score">0/100</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="optimization-comparison">
                        <h4>Strategy Comparison</h4>
                        <div class="comparison-table-container">
                            <table class="comparison-table">
                                <thead>
                                    <tr>
                                        <th>Strategy</th>
                                        <th>Budget Used</th>
                                        <th>Employees</th>
                                        <th>Avg Raise</th>
                                        <th>Retention Score</th>
                                        <th>Performance Score</th>
                                        <th>Equity Score</th>
                                        <th>Overall Score</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="comparison-tbody">
                                    <!-- Comparison data will be populated here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="optimization-details" style="display: none;">
                    <h3>Detailed Optimization Plan</h3>
                    
                    <div class="plan-controls">
                        <button id="export-optimization" class="btn btn-secondary">
                            Export Optimization Plan
                        </button>
                        <button id="apply-optimization" class="btn btn-success">
                            Apply Selected Optimization
                        </button>
                        <button id="customize-optimization" class="btn btn-primary">
                            Customize Plan
                        </button>
                    </div>
                    
                    <div class="detailed-plan-table">
                        <table class="plan-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Current Salary</th>
                                    <th>Optimized Raise</th>
                                    <th>New Salary</th>
                                    <th>Priority Reason</th>
                                    <th>Impact Score</th>
                                </tr>
                            </thead>
                            <tbody id="plan-tbody">
                                <!-- Detailed plan will be populated here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Run optimization
        document.getElementById('run-optimization').addEventListener('click', () => {
            this.runOptimization();
        });
        
        // Export and apply actions
        document.getElementById('export-optimization').addEventListener('click', () => {
            this.exportOptimization();
        });
        
        document.getElementById('apply-optimization').addEventListener('click', () => {
            this.applyOptimization();
        });
        
        document.getElementById('customize-optimization').addEventListener('click', () => {
            this.customizeOptimization();
        });
    }
    
    setEmployees(employees) {
        this.employees = employees;
        console.log(`Budget optimizer loaded ${employees.length} employees`);
    }
    
    runOptimization() {
        if (!this.employees || this.employees.length === 0) {
            this.showNotification('Please load employee data first', 'warning');
            return;
        }
        
        // Get optimization parameters
        const budgetAmount = parseFloat(document.getElementById('budget-amount').value);
        const currency = document.getElementById('budget-currency').value;
        const goal = document.getElementById('optimization-goal').value;
        const minRaise = parseFloat(document.getElementById('min-raise').value) / 100;
        const maxRaise = parseFloat(document.getElementById('max-raise').value) / 100;
        
        if (!budgetAmount || budgetAmount <= 0) {
            this.showNotification('Please enter a valid budget amount', 'warning');
            return;
        }
        
        // Get constraints
        const constraints = {
            respectCountryLimits: document.getElementById('respect-country-limits').checked,
            prioritizeHighPerformers: document.getElementById('prioritize-high-performers').checked,
            addressFlightRisk: document.getElementById('address-flight-risk').checked,
            maintainEquity: document.getElementById('maintain-equity').checked,
            minRaise,
            maxRaise
        };
        
        this.budgetConstraints = {
            amount: budgetAmount,
            currency,
            goal,
            constraints
        };
        
        // Run optimization algorithms
        this.optimizationResults = this.generateOptimizationStrategies();
        
        // Display results
        this.displayOptimizationResults();
        
        console.log('Optimization completed:', this.optimizationResults);
    }
    
    generateOptimizationStrategies() {
        const strategies = {};
        
        // Strategy 1: Retention-focused
        strategies.retention = this.optimizeForRetention();
        
        // Strategy 2: Performance-focused
        strategies.performance = this.optimizeForPerformance();
        
        // Strategy 3: Equity-focused
        strategies.equity = this.optimizeForEquity();
        
        // Strategy 4: Balanced approach
        strategies.balanced = this.optimizeBalanced();
        
        // Strategy 5: Custom goal-based
        strategies.custom = this.optimizeForGoal(this.budgetConstraints.goal);
        
        return strategies;
    }
    
    optimizeForRetention() {
        const budget = this.budgetConstraints.amount;
        const employees = [...this.employees];
        
        // Prioritize flight risk employees
        employees.sort((a, b) => {
            const aFlightRisk = a.riskIndicators && a.riskIndicators.includes('flight_risk') ? 1 : 0;
            const bFlightRisk = b.riskIndicators && b.riskIndicators.includes('flight_risk') ? 1 : 0;
            
            if (aFlightRisk !== bFlightRisk) return bFlightRisk - aFlightRisk;
            
            // Secondary sort by performance
            return b.performance - a.performance;
        });
        
        return this.allocateBudget(employees, budget, 'retention');
    }
    
    optimizeForPerformance() {
        const budget = this.budgetConstraints.amount;
        const employees = [...this.employees];
        
        // Prioritize high performers
        employees.sort((a, b) => {
            if (a.performance !== b.performance) return b.performance - a.performance;
            
            // Secondary sort by current salary (lower first for equity)
            return a.currentSalary - b.currentSalary;
        });
        
        return this.allocateBudget(employees, budget, 'performance');
    }
    
    optimizeForEquity() {
        const budget = this.budgetConstraints.amount;
        const employees = [...this.employees];
        
        // Prioritize underpaid employees (low comparatio)
        employees.sort((a, b) => {
            const aComparatio = a.comparatio || 1.0;
            const bComparatio = b.comparatio || 1.0;
            
            if (Math.abs(aComparatio - bComparatio) > 0.1) {
                return aComparatio - bComparatio;
            }
            
            // Secondary sort by performance
            return b.performance - a.performance;
        });
        
        return this.allocateBudget(employees, budget, 'equity');
    }
    
    optimizeBalanced() {
        const budget = this.budgetConstraints.amount;
        const employees = [...this.employees];
        
        // Calculate composite score for balanced approach
        employees.forEach(emp => {
            let score = 0;
            
            // Performance component (40%)
            score += (emp.performance / 5) * 40;
            
            // Flight risk component (30%)
            if (emp.riskIndicators && emp.riskIndicators.includes('flight_risk')) {
                score += 30;
            }
            
            // Equity component (30%)
            const comparatio = emp.comparatio || 1.0;
            if (comparatio < 0.9) {
                score += 30 * (0.9 - comparatio) / 0.2; // More points for more underpaid
            }
            
            emp.optimizationScore = score;
        });
        
        employees.sort((a, b) => b.optimizationScore - a.optimizationScore);
        
        return this.allocateBudget(employees, budget, 'balanced');
    }
    
    optimizeForGoal(goal) {
        switch (goal) {
            case 'retention':
                return this.optimizeForRetention();
            case 'performance':
                return this.optimizeForPerformance();
            case 'equity':
                return this.optimizeForEquity();
            case 'balanced':
            default:
                return this.optimizeBalanced();
        }
    }
    
    allocateBudget(sortedEmployees, totalBudget, strategy) {
        const result = {
            strategy,
            employees: [],
            totalBudgetUsed: 0,
            budgetUtilization: 0,
            metrics: {
                retentionScore: 0,
                performanceScore: 0,
                equityScore: 0,
                overallScore: 0
            }
        };
        
        let remainingBudget = totalBudget;
        const { minRaise, maxRaise } = this.budgetConstraints.constraints;
        
        for (const employee of sortedEmployees) {
            if (remainingBudget <= 0) break;
            
            // Calculate optimal raise for this employee
            let optimalRaise = this.calculateOptimalRaise(employee, strategy);
            
            // Apply constraints
            optimalRaise = Math.max(optimalRaise, minRaise);
            optimalRaise = Math.min(optimalRaise, maxRaise);
            
            // Check country limits if enabled
            if (this.budgetConstraints.constraints.respectCountryLimits) {
                const countryLimit = this.getCountryLimit(employee.country);
                optimalRaise = Math.min(optimalRaise, countryLimit);
            }
            
            // Calculate cost
            const raiseCost = employee.currentSalary * optimalRaise * 1.3; // Include benefits
            
            if (raiseCost <= remainingBudget) {
                result.employees.push({
                    ...employee,
                    optimizedRaise: optimalRaise,
                    raiseCost,
                    newSalary: employee.currentSalary * (1 + optimalRaise),
                    priorityReason: this.getPriorityReason(employee, strategy),
                    impactScore: this.calculateImpactScore(employee, optimalRaise, strategy)
                });
                
                remainingBudget -= raiseCost;
                result.totalBudgetUsed += raiseCost;
            }
        }
        
        result.budgetUtilization = result.totalBudgetUsed / totalBudget;
        result.metrics = this.calculateStrategyMetrics(result.employees, strategy);
        
        return result;
    }
    
    calculateOptimalRaise(employee, strategy) {
        const baseRaise = 0.05; // 5% base
        let multiplier = 1.0;
        
        switch (strategy) {
            case 'retention':
                if (employee.riskIndicators && employee.riskIndicators.includes('flight_risk')) {
                    multiplier = 1.5;
                }
                multiplier *= (employee.performance / 5) * 0.8 + 0.6; // Performance factor
                break;
                
            case 'performance':
                multiplier = employee.performance / 3; // Heavy performance weighting
                break;
                
            case 'equity':
                const comparatio = employee.comparatio || 1.0;
                if (comparatio < 0.9) {
                    multiplier = 1.5 * (0.9 - comparatio) / 0.2 + 1.0;
                }
                multiplier *= (employee.performance / 5) * 0.5 + 0.5; // Some performance factor
                break;
                
            case 'balanced':
                multiplier = (employee.optimizationScore || 50) / 50;
                break;
        }
        
        return baseRaise * multiplier;
    }
    
    getCountryLimit(country) {
        const limits = {
            'US': 0.12,
            'India': 0.50,
            'UK': 0.15,
            'Canada': 0.12,
            'Germany': 0.10
        };
        return limits[country] || 0.12;
    }
    
    getPriorityReason(employee, strategy) {
        const reasons = [];
        
        if (employee.performance >= 4) {
            reasons.push('High performer');
        }
        
        if (employee.riskIndicators && employee.riskIndicators.includes('flight_risk')) {
            reasons.push('Flight risk');
        }
        
        if (employee.comparatio && employee.comparatio < 0.9) {
            reasons.push('Below market');
        }
        
        if (employee.riskIndicators && employee.riskIndicators.includes('promotion_ready')) {
            reasons.push('Promotion ready');
        }
        
        return reasons.length > 0 ? reasons.join(', ') : 'Standard adjustment';
    }
    
    calculateImpactScore(employee, raise, strategy) {
        let score = 0;
        
        // Base score from raise amount
        score += (raise / 0.1) * 20; // 20 points per 10% raise
        
        // Performance impact
        score += employee.performance * 10;
        
        // Flight risk impact
        if (employee.riskIndicators && employee.riskIndicators.includes('flight_risk')) {
            score += 30;
        }
        
        // Equity impact
        if (employee.comparatio && employee.comparatio < 0.9) {
            score += 25;
        }
        
        return Math.min(score, 100);
    }
    
    calculateStrategyMetrics(employees, strategy) {
        const metrics = {
            retentionScore: 0,
            performanceScore: 0,
            equityScore: 0,
            overallScore: 0
        };
        
        if (employees.length === 0) return metrics;
        
        // Retention score
        const flightRiskAddressed = employees.filter(emp => 
            emp.riskIndicators && emp.riskIndicators.includes('flight_risk')
        ).length;
        const totalFlightRisk = this.employees.filter(emp => 
            emp.riskIndicators && emp.riskIndicators.includes('flight_risk')
        ).length;
        metrics.retentionScore = totalFlightRisk > 0 ? (flightRiskAddressed / totalFlightRisk) * 100 : 100;
        
        // Performance score
        const highPerformersRewarded = employees.filter(emp => emp.performance >= 4).length;
        const totalHighPerformers = this.employees.filter(emp => emp.performance >= 4).length;
        metrics.performanceScore = totalHighPerformers > 0 ? (highPerformersRewarded / totalHighPerformers) * 100 : 100;
        
        // Equity score
        const underpaidAddressed = employees.filter(emp => emp.comparatio && emp.comparatio < 0.9).length;
        const totalUnderpaid = this.employees.filter(emp => emp.comparatio && emp.comparatio < 0.9).length;
        metrics.equityScore = totalUnderpaid > 0 ? (underpaidAddressed / totalUnderpaid) * 100 : 100;
        
        // Overall score (weighted average)
        metrics.overallScore = (
            metrics.retentionScore * 0.4 +
            metrics.performanceScore * 0.4 +
            metrics.equityScore * 0.2
        );
        
        return metrics;
    }
    
    displayOptimizationResults() {
        // Show results section
        document.querySelector('.optimization-results').style.display = 'block';
        
        // Select best strategy based on goal
        const bestStrategy = this.selectBestStrategy();
        this.selectedOptimization = bestStrategy;
        
        // Update summary
        this.updateResultsSummary(bestStrategy);
        
        // Display strategies
        this.displayStrategies();
        
        // Show comparison table
        this.displayStrategyComparison();
        
        // Show detailed plan
        this.displayDetailedPlan(bestStrategy);
    }
    
    selectBestStrategy() {
        const goal = this.budgetConstraints.goal;
        
        if (goal === 'balanced') {
            // Select strategy with highest overall score
            return Object.values(this.optimizationResults)
                .reduce((best, current) => 
                    current.metrics.overallScore > best.metrics.overallScore ? current : best
                );
        }
        
        // Return the strategy that matches the goal
        return this.optimizationResults[goal] || this.optimizationResults.balanced;
    }
    
    updateResultsSummary(strategy) {
        const utilization = (strategy.budgetUtilization * 100).toFixed(1);
        const avgRaise = strategy.employees.length > 0 
            ? (strategy.employees.reduce((sum, emp) => sum + emp.optimizedRaise, 0) / strategy.employees.length * 100).toFixed(1)
            : 0;
        
        document.getElementById('budget-utilization').textContent = `${utilization}%`;
        document.getElementById('affected-employees').textContent = strategy.employees.length;
        document.getElementById('average-raise').textContent = `${avgRaise}%`;
        document.getElementById('optimization-score').textContent = `${strategy.metrics.overallScore.toFixed(0)}/100`;
        
        // Update utilization bar
        const utilizationFill = document.getElementById('utilization-fill');
        utilizationFill.style.width = `${Math.min(parseFloat(utilization), 100)}%`;
        
        // Color coding
        utilizationFill.className = 'utilization-fill';
        if (parseFloat(utilization) > 95) {
            utilizationFill.classList.add('high-utilization');
        } else if (parseFloat(utilization) > 80) {
            utilizationFill.classList.add('medium-utilization');
        }
    }
    
    displayStrategies() {
        const strategiesGrid = document.getElementById('strategies-grid');
        const strategies = Object.entries(this.optimizationResults);
        
        strategiesGrid.innerHTML = strategies.map(([key, strategy]) => `
            <div class="strategy-card ${key === this.selectedOptimization.strategy ? 'selected' : ''}" 
                 data-strategy="${key}">
                <h5>${this.getStrategyName(key)}</h5>
                <div class="strategy-metrics">
                    <div class="metric">
                        <span>Budget Used:</span>
                        <span>${(strategy.budgetUtilization * 100).toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span>Employees:</span>
                        <span>${strategy.employees.length}</span>
                    </div>
                    <div class="metric">
                        <span>Overall Score:</span>
                        <span>${strategy.metrics.overallScore.toFixed(0)}/100</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline select-strategy" data-strategy="${key}">
                    Select This Strategy
                </button>
            </div>
        `).join('');
        
        // Add event listeners for strategy selection
        strategiesGrid.querySelectorAll('.select-strategy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const strategyKey = e.target.dataset.strategy;
                this.selectStrategy(strategyKey);
            });
        });
    }
    
    displayStrategyComparison() {
        const tbody = document.getElementById('comparison-tbody');
        const strategies = Object.entries(this.optimizationResults);
        
        tbody.innerHTML = strategies.map(([key, strategy]) => `
            <tr class="${key === this.selectedOptimization.strategy ? 'selected-row' : ''}">
                <td><strong>${this.getStrategyName(key)}</strong></td>
                <td>${this.formatCurrency(strategy.totalBudgetUsed)}</td>
                <td>${strategy.employees.length}</td>
                <td>${strategy.employees.length > 0 ? (strategy.employees.reduce((sum, emp) => sum + emp.optimizedRaise, 0) / strategy.employees.length * 100).toFixed(1) : 0}%</td>
                <td>${strategy.metrics.retentionScore.toFixed(0)}</td>
                <td>${strategy.metrics.performanceScore.toFixed(0)}</td>
                <td>${strategy.metrics.equityScore.toFixed(0)}</td>
                <td><strong>${strategy.metrics.overallScore.toFixed(0)}</strong></td>
                <td>
                    <button class="btn btn-sm btn-primary select-strategy" data-strategy="${key}">
                        Select
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners
        tbody.querySelectorAll('.select-strategy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const strategyKey = e.target.dataset.strategy;
                this.selectStrategy(strategyKey);
            });
        });
    }
    
    displayDetailedPlan(strategy) {
        document.querySelector('.optimization-details').style.display = 'block';
        
        const tbody = document.getElementById('plan-tbody');
        tbody.innerHTML = strategy.employees.map(emp => `
            <tr>
                <td>
                    <div class="employee-info">
                        <strong>${emp.name}</strong>
                        <small>${emp.title || 'N/A'}</small>
                    </div>
                </td>
                <td>${this.formatCurrency(emp.currentSalary)}</td>
                <td>
                    <div class="raise-info">
                        <strong>${(emp.optimizedRaise * 100).toFixed(1)}%</strong>
                        <small>${this.formatCurrency(emp.currentSalary * emp.optimizedRaise)}</small>
                    </div>
                </td>
                <td>${this.formatCurrency(emp.newSalary)}</td>
                <td>${emp.priorityReason}</td>
                <td>
                    <span class="impact-score score-${Math.floor(emp.impactScore / 20)}">
                        ${emp.impactScore.toFixed(0)}/100
                    </span>
                </td>
            </tr>
        `).join('');
        
        // Update impact analysis
        this.updateImpactAnalysis(strategy);
    }
    
    updateImpactAnalysis(strategy) {
        const flightRiskAddressed = strategy.employees.filter(emp => 
            emp.riskIndicators && emp.riskIndicators.includes('flight_risk')
        ).length;
        
        const highPerformersRewarded = strategy.employees.filter(emp => emp.performance >= 4).length;
        
        const underpaidAddressed = strategy.employees.filter(emp => 
            emp.comparatio && emp.comparatio < 0.9
        ).length;
        
        document.getElementById('flight-risk-addressed').textContent = flightRiskAddressed;
        document.getElementById('retention-score').textContent = `${strategy.metrics.retentionScore.toFixed(0)}/100`;
        
        document.getElementById('high-performers-rewarded').textContent = highPerformersRewarded;
        document.getElementById('performance-score').textContent = `${strategy.metrics.performanceScore.toFixed(0)}/100`;
        
        document.getElementById('underpaid-addressed').textContent = underpaidAddressed;
        document.getElementById('equity-score').textContent = `${strategy.metrics.equityScore.toFixed(0)}/100`;
    }
    
    selectStrategy(strategyKey) {
        this.selectedOptimization = this.optimizationResults[strategyKey];
        
        // Update UI
        this.updateResultsSummary(this.selectedOptimization);
        this.displayStrategies();
        this.displayStrategyComparison();
        this.displayDetailedPlan(this.selectedOptimization);
        
        this.showNotification(`Selected ${this.getStrategyName(strategyKey)} strategy`, 'success');
    }
    
    getStrategyName(key) {
        const names = {
            retention: 'Retention-Focused',
            performance: 'Performance-Focused',
            equity: 'Equity-Focused',
            balanced: 'Balanced Approach',
            custom: 'Custom Goal'
        };
        return names[key] || key;
    }
    
    exportOptimization() {
        if (!this.selectedOptimization) {
            this.showNotification('No optimization selected to export', 'warning');
            return;
        }
        
        const headers = [
            'Employee Name', 'Title', 'Country', 'Performance',
            'Current Salary', 'Optimized Raise %', 'Raise Amount',
            'New Salary', 'Priority Reason', 'Impact Score'
        ];
        
        const rows = this.selectedOptimization.employees.map(emp => [
            emp.name,
            emp.title || '',
            emp.country || '',
            emp.performance,
            emp.currentSalary,
            (emp.optimizedRaise * 100).toFixed(2),
            (emp.currentSalary * emp.optimizedRaise).toFixed(2),
            emp.newSalary.toFixed(2),
            emp.priorityReason,
            emp.impactScore.toFixed(0)
        ]);
        
        // Add summary
        rows.push([]);
        rows.push(['OPTIMIZATION SUMMARY']);
        rows.push(['Strategy', this.getStrategyName(this.selectedOptimization.strategy)]);
        rows.push(['Total Budget Used', this.selectedOptimization.totalBudgetUsed.toFixed(2)]);
        rows.push(['Budget Utilization', `${(this.selectedOptimization.budgetUtilization * 100).toFixed(1)}%`]);
        rows.push(['Employees Affected', this.selectedOptimization.employees.length]);
        rows.push(['Retention Score', this.selectedOptimization.metrics.retentionScore.toFixed(0)]);
        rows.push(['Performance Score', this.selectedOptimization.metrics.performanceScore.toFixed(0)]);
        rows.push(['Equity Score', this.selectedOptimization.metrics.equityScore.toFixed(0)]);
        rows.push(['Overall Score', this.selectedOptimization.metrics.overallScore.toFixed(0)]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-optimization-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Optimization plan exported successfully', 'success');
    }
    
    applyOptimization() {
        if (!this.selectedOptimization) {
            this.showNotification('No optimization selected to apply', 'warning');
            return;
        }
        
        // This would integrate with the main application to apply the optimized raises
        this.showNotification(`Applied ${this.getStrategyName(this.selectedOptimization.strategy)} optimization to ${this.selectedOptimization.employees.length} employees`, 'success');
        
        // Emit event for main app to handle
        if (window.app && window.app.applyOptimization) {
            window.app.applyOptimization(this.selectedOptimization);
        }
    }
    
    customizeOptimization() {
        this.showNotification('Customization interface would open here', 'info');
        // This would open a detailed customization interface
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
    module.exports = BudgetOptimizer;
} else {
    window.BudgetOptimizer = BudgetOptimizer;
} 