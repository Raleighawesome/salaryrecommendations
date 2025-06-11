/**
 * ScenarioModeler.js
 * 
 * Scenario modeling component for testing different budget allocation strategies.
 * Allows users to create multiple scenarios, compare outcomes, and analyze
 * the impact of different raise distribution approaches.
 */

class ScenarioModeler {
    constructor() {
        this.scenarios = new Map();
        this.activeScenario = null;
        this.baselineData = null;
        this.constraints = {
            totalBudget: 0,
            maxRaisePercent: 12,
            vpApprovalThreshold: 12,
            countryConstraints: {
                'US': { min: 0, max: 12, vpApprovalRequired: 12 },
                'India': { min: 0, max: 50, vpApprovalRequired: 25 },
                'UK': { min: 0, max: 15, vpApprovalRequired: 15 },
                'Canada': { min: 0, max: 12, vpApprovalRequired: 12 },
                'Germany': { min: 0, max: 10, vpApprovalRequired: 10 }
            }
        };
        this.comparisonMetrics = [
            'totalCost',
            'averageRaise',
            'medianRaise',
            'employeesWithRaises',
            'highPerformerRetention',
            'budgetUtilization',
            'equityScore',
            'riskScore'
        ];
    }

    /**
     * Initialize the scenario modeler with employee data
     */
    initialize(employeeData, budgetConstraints = {}) {
        this.baselineData = employeeData.map(emp => ({ ...emp }));
        this.constraints = { ...this.constraints, ...budgetConstraints };
        
        // Create default baseline scenario
        this.createScenario('Baseline', 'Current state without any raises', {
            strategy: 'none',
            parameters: {}
        });
        
        this.render();
    }

    /**
     * Create a new scenario
     */
    createScenario(name, description, config) {
        const scenario = {
            id: this.generateScenarioId(),
            name,
            description,
            config,
            results: null,
            createdAt: new Date(),
            modifiedAt: new Date()
        };
        
        this.scenarios.set(scenario.id, scenario);
        this.calculateScenarioResults(scenario.id);
        
        return scenario.id;
    }

    /**
     * Generate unique scenario ID
     */
    generateScenarioId() {
        return 'scenario_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Calculate results for a scenario
     */
    calculateScenarioResults(scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario || !this.baselineData) return;

        const employeeData = this.baselineData.map(emp => ({ ...emp }));
        const results = this.applyScenarioStrategy(employeeData, scenario.config);
        
        scenario.results = {
            ...results,
            calculatedAt: new Date()
        };
        
        scenario.modifiedAt = new Date();
        this.updateScenarioDisplay();
    }

    /**
     * Apply scenario strategy to employee data
     */
    applyScenarioStrategy(employeeData, config) {
        const { strategy, parameters } = config;
        let modifiedData = [...employeeData];
        
        switch (strategy) {
            case 'none':
                // No raises applied
                break;
                
            case 'performance_based':
                modifiedData = this.applyPerformanceBasedRaises(modifiedData, parameters);
                break;
                
            case 'equity_focused':
                modifiedData = this.applyEquityFocusedRaises(modifiedData, parameters);
                break;
                
            case 'retention_focused':
                modifiedData = this.applyRetentionFocusedRaises(modifiedData, parameters);
                break;
                
            case 'budget_maximized':
                modifiedData = this.applyBudgetMaximizedRaises(modifiedData, parameters);
                break;
                
            case 'custom':
                modifiedData = this.applyCustomRaises(modifiedData, parameters);
                break;
                
            default:
                console.warn('Unknown scenario strategy:', strategy);
        }
        
        return this.calculateScenarioMetrics(modifiedData);
    }

    /**
     * Apply performance-based raise strategy
     */
    applyPerformanceBasedRaises(employeeData, parameters) {
        const { budgetLimit = this.constraints.totalBudget, performanceWeighting = 0.8 } = parameters;
        
        return employeeData.map(emp => {
            const performance = parseFloat(emp.performanceRating) || 3;
            let raisePercent = 0;
            
            // Performance-based raise calculation
            if (performance >= 4.5) {
                raisePercent = 8 + (performance - 4.5) * 8; // 8-12% for top performers
            } else if (performance >= 3.5) {
                raisePercent = 4 + (performance - 3.5) * 4; // 4-8% for good performers
            } else if (performance >= 2.5) {
                raisePercent = 1 + (performance - 2.5) * 3; // 1-4% for average performers
            }
            
            // Apply country constraints
            const country = emp.country || 'US';
            const countryConstraint = this.constraints.countryConstraints[country] || this.constraints.countryConstraints['US'];
            raisePercent = Math.min(raisePercent, countryConstraint.max);
            
            return {
                ...emp,
                proposedRaisePercent: raisePercent,
                proposedNewSalary: emp.currentSalary * (1 + raisePercent / 100),
                raiseReason: this.generateRaiseReason('performance', performance, raisePercent)
            };
        });
    }

    /**
     * Apply equity-focused raise strategy
     */
    applyEquityFocusedRaises(employeeData, parameters) {
        const { budgetLimit = this.constraints.totalBudget, equityThreshold = 0.9 } = parameters;
        
        // Calculate market ratios for equity analysis
        const marketAnalysis = this.calculateMarketEquity(employeeData);
        
        return employeeData.map(emp => {
            const marketRatio = marketAnalysis.get(emp.id) || 1.0;
            let raisePercent = 0;
            
            // Equity-based raise calculation
            if (marketRatio < equityThreshold) {
                // Below market - larger raise needed
                raisePercent = Math.min(15, (equityThreshold - marketRatio) * 20);
            } else if (marketRatio < 0.95) {
                // Slightly below market - moderate raise
                raisePercent = Math.min(8, (0.95 - marketRatio) * 40);
            } else {
                // At or above market - small raise
                raisePercent = Math.min(3, 3 * (emp.performanceRating / 5));
            }
            
            // Apply country constraints
            const country = emp.country || 'US';
            const countryConstraint = this.constraints.countryConstraints[country] || this.constraints.countryConstraints['US'];
            raisePercent = Math.min(raisePercent, countryConstraint.max);
            
            return {
                ...emp,
                proposedRaisePercent: raisePercent,
                proposedNewSalary: emp.currentSalary * (1 + raisePercent / 100),
                raiseReason: this.generateRaiseReason('equity', marketRatio, raisePercent)
            };
        });
    }

    /**
     * Apply retention-focused raise strategy
     */
    applyRetentionFocusedRaises(employeeData, parameters) {
        const { budgetLimit = this.constraints.totalBudget, riskThreshold = 0.7 } = parameters;
        
        return employeeData.map(emp => {
            const retentionRisk = this.calculateRetentionRisk(emp);
            const performance = parseFloat(emp.performanceRating) || 3;
            let raisePercent = 0;
            
            // Retention-focused raise calculation
            if (retentionRisk > 0.8 && performance >= 3.5) {
                // High risk, good performer - significant raise
                raisePercent = 10 + (retentionRisk - 0.8) * 10;
            } else if (retentionRisk > 0.6 && performance >= 3.0) {
                // Medium risk - moderate raise
                raisePercent = 5 + (retentionRisk - 0.6) * 12.5;
            } else if (performance >= 4.0) {
                // Low risk but high performer - standard raise
                raisePercent = 4 + (performance - 4.0) * 4;
            } else {
                // Low risk, average performer - minimal raise
                raisePercent = Math.max(0, performance - 2.5);
            }
            
            // Apply country constraints
            const country = emp.country || 'US';
            const countryConstraint = this.constraints.countryConstraints[country] || this.constraints.countryConstraints['US'];
            raisePercent = Math.min(raisePercent, countryConstraint.max);
            
            return {
                ...emp,
                proposedRaisePercent: raisePercent,
                proposedNewSalary: emp.currentSalary * (1 + raisePercent / 100),
                raiseReason: this.generateRaiseReason('retention', retentionRisk, raisePercent)
            };
        });
    }

    /**
     * Apply budget-maximized raise strategy
     */
    applyBudgetMaximizedRaises(employeeData, parameters) {
        const { budgetLimit = this.constraints.totalBudget, distributionMethod = 'proportional' } = parameters;
        
        const totalCurrentSalary = employeeData.reduce((sum, emp) => sum + emp.currentSalary, 0);
        const targetBudgetPercent = (budgetLimit / totalCurrentSalary) * 100;
        
        return employeeData.map(emp => {
            let raisePercent = 0;
            
            if (distributionMethod === 'proportional') {
                // Distribute proportionally based on current salary
                raisePercent = targetBudgetPercent;
            } else if (distributionMethod === 'equal') {
                // Equal dollar amount for all employees
                const equalAmount = budgetLimit / employeeData.length;
                raisePercent = (equalAmount / emp.currentSalary) * 100;
            } else if (distributionMethod === 'performance_weighted') {
                // Weight by performance rating
                const performance = parseFloat(emp.performanceRating) || 3;
                const performanceWeight = performance / 5;
                raisePercent = targetBudgetPercent * performanceWeight * 1.5;
            }
            
            // Apply country constraints
            const country = emp.country || 'US';
            const countryConstraint = this.constraints.countryConstraints[country] || this.constraints.countryConstraints['US'];
            raisePercent = Math.min(raisePercent, countryConstraint.max);
            
            return {
                ...emp,
                proposedRaisePercent: raisePercent,
                proposedNewSalary: emp.currentSalary * (1 + raisePercent / 100),
                raiseReason: this.generateRaiseReason('budget', targetBudgetPercent, raisePercent)
            };
        });
    }

    /**
     * Apply custom raise strategy
     */
    applyCustomRaises(employeeData, parameters) {
        const { customRules = [] } = parameters;
        
        return employeeData.map(emp => {
            let raisePercent = 0;
            let raiseReason = 'No raise criteria met';
            
            // Apply custom rules in order
            for (const rule of customRules) {
                if (this.evaluateCustomRule(emp, rule)) {
                    raisePercent = rule.raisePercent;
                    raiseReason = rule.reason || 'Custom rule applied';
                    break;
                }
            }
            
            // Apply country constraints
            const country = emp.country || 'US';
            const countryConstraint = this.constraints.countryConstraints[country] || this.constraints.countryConstraints['US'];
            raisePercent = Math.min(raisePercent, countryConstraint.max);
            
            return {
                ...emp,
                proposedRaisePercent: raisePercent,
                proposedNewSalary: emp.currentSalary * (1 + raisePercent / 100),
                raiseReason
            };
        });
    }

    /**
     * Calculate scenario metrics
     */
    calculateScenarioMetrics(employeeData) {
        const totalCurrentSalary = employeeData.reduce((sum, emp) => sum + emp.currentSalary, 0);
        const totalNewSalary = employeeData.reduce((sum, emp) => sum + (emp.proposedNewSalary || emp.currentSalary), 0);
        const totalCost = totalNewSalary - totalCurrentSalary;
        
        const raises = employeeData.filter(emp => (emp.proposedRaisePercent || 0) > 0);
        const raisePercentages = raises.map(emp => emp.proposedRaisePercent || 0);
        
        const highPerformers = employeeData.filter(emp => parseFloat(emp.performanceRating) >= 4.0);
        const highPerformerRaises = highPerformers.filter(emp => (emp.proposedRaisePercent || 0) > 0);
        
        return {
            totalCost,
            budgetUtilization: (totalCost / this.constraints.totalBudget) * 100,
            averageRaise: raisePercentages.length > 0 ? raisePercentages.reduce((a, b) => a + b, 0) / raisePercentages.length : 0,
            medianRaise: this.calculateMedian(raisePercentages),
            employeesWithRaises: raises.length,
            employeesWithoutRaises: employeeData.length - raises.length,
            highPerformerRetention: highPerformers.length > 0 ? (highPerformerRaises.length / highPerformers.length) * 100 : 0,
            equityScore: this.calculateEquityScore(employeeData),
            riskScore: this.calculateRiskScore(employeeData),
            vpApprovalsRequired: employeeData.filter(emp => (emp.proposedRaisePercent || 0) >= this.constraints.vpApprovalThreshold).length,
            countryBreakdown: this.calculateCountryBreakdown(employeeData),
            performanceBreakdown: this.calculatePerformanceBreakdown(employeeData)
        };
    }

    /**
     * Calculate market equity for employees
     */
    calculateMarketEquity(employeeData) {
        const marketRatios = new Map();
        
        // Group by similar roles and calculate market positioning
        const roleGroups = this.groupByRole(employeeData);
        
        roleGroups.forEach((employees, role) => {
            const salaries = employees.map(emp => emp.currentSalary).sort((a, b) => a - b);
            const median = this.calculateMedian(salaries);
            
            employees.forEach(emp => {
                const ratio = emp.currentSalary / median;
                marketRatios.set(emp.id, ratio);
            });
        });
        
        return marketRatios;
    }

    /**
     * Calculate retention risk for an employee
     */
    calculateRetentionRisk(employee) {
        let risk = 0.3; // Base risk
        
        // Performance factor
        const performance = parseFloat(employee.performanceRating) || 3;
        if (performance >= 4.0) risk += 0.2; // High performers more likely to leave
        
        // Tenure factor
        const tenure = parseFloat(employee.tenure) || 1;
        if (tenure < 2) risk += 0.2; // New employees higher risk
        if (tenure > 5) risk -= 0.1; // Longer tenure lower risk
        
        // Salary factor (below market increases risk)
        const comparatio = parseFloat(employee.comparatio) || 1.0;
        if (comparatio < 0.9) risk += 0.3;
        else if (comparatio < 0.95) risk += 0.1;
        
        // Future talent factor
        if (employee.futureTalent === 'Yes' || employee.futureTalent === 'High') {
            risk += 0.2;
        }
        
        return Math.min(1.0, Math.max(0.0, risk));
    }

    /**
     * Generate raise reason text
     */
    generateRaiseReason(strategy, metric, raisePercent) {
        switch (strategy) {
            case 'performance':
                return `Performance-based raise (${metric.toFixed(1)} rating, ${raisePercent.toFixed(1)}% increase)`;
            case 'equity':
                return `Equity adjustment (${(metric * 100).toFixed(0)}% of market, ${raisePercent.toFixed(1)}% increase)`;
            case 'retention':
                return `Retention-focused raise (${(metric * 100).toFixed(0)}% risk, ${raisePercent.toFixed(1)}% increase)`;
            case 'budget':
                return `Budget optimization (${metric.toFixed(1)}% target, ${raisePercent.toFixed(1)}% increase)`;
            default:
                return `${raisePercent.toFixed(1)}% salary increase`;
        }
    }

    /**
     * Evaluate custom rule against employee
     */
    evaluateCustomRule(employee, rule) {
        const { conditions } = rule;
        
        return conditions.every(condition => {
            const { field, operator, value } = condition;
            const empValue = employee[field];
            
            switch (operator) {
                case 'equals':
                    return empValue === value;
                case 'greater_than':
                    return parseFloat(empValue) > parseFloat(value);
                case 'less_than':
                    return parseFloat(empValue) < parseFloat(value);
                case 'contains':
                    return String(empValue).toLowerCase().includes(String(value).toLowerCase());
                default:
                    return false;
            }
        });
    }

    /**
     * Calculate various metrics
     */
    calculateMedian(values) {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    calculateEquityScore(employeeData) {
        // Calculate how equitable the raise distribution is
        const raises = employeeData.map(emp => emp.proposedRaisePercent || 0);
        const performances = employeeData.map(emp => parseFloat(emp.performanceRating) || 3);
        
        // Correlation between performance and raises
        const correlation = this.calculateCorrelation(performances, raises);
        return Math.max(0, correlation * 100);
    }

    calculateRiskScore(employeeData) {
        // Calculate overall retention risk after raises
        const risks = employeeData.map(emp => {
            const baseRisk = this.calculateRetentionRisk(emp);
            const raisePercent = emp.proposedRaisePercent || 0;
            // Raises reduce risk
            return Math.max(0, baseRisk - (raisePercent / 100) * 0.5);
        });
        
        return risks.reduce((sum, risk) => sum + risk, 0) / risks.length * 100;
    }

    calculateCorrelation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
        
        return denominator === 0 ? 0 : numerator / denominator;
    }

    calculateCountryBreakdown(employeeData) {
        const breakdown = {};
        
        employeeData.forEach(emp => {
            const country = emp.country || 'Unknown';
            if (!breakdown[country]) {
                breakdown[country] = {
                    totalEmployees: 0,
                    employeesWithRaises: 0,
                    totalCost: 0,
                    averageRaise: 0
                };
            }
            
            breakdown[country].totalEmployees++;
            if ((emp.proposedRaisePercent || 0) > 0) {
                breakdown[country].employeesWithRaises++;
                breakdown[country].totalCost += (emp.proposedNewSalary || emp.currentSalary) - emp.currentSalary;
            }
        });
        
        // Calculate averages
        Object.values(breakdown).forEach(data => {
            if (data.employeesWithRaises > 0) {
                data.averageRaise = data.totalCost / data.employeesWithRaises;
            }
        });
        
        return breakdown;
    }

    calculatePerformanceBreakdown(employeeData) {
        const breakdown = {
            '5.0': { count: 0, avgRaise: 0, totalRaise: 0 },
            '4.0-4.9': { count: 0, avgRaise: 0, totalRaise: 0 },
            '3.0-3.9': { count: 0, avgRaise: 0, totalRaise: 0 },
            '2.0-2.9': { count: 0, avgRaise: 0, totalRaise: 0 },
            'Below 2.0': { count: 0, avgRaise: 0, totalRaise: 0 }
        };
        
        employeeData.forEach(emp => {
            const performance = parseFloat(emp.performanceRating) || 0;
            const raisePercent = emp.proposedRaisePercent || 0;
            
            let bucket;
            if (performance >= 5.0) bucket = '5.0';
            else if (performance >= 4.0) bucket = '4.0-4.9';
            else if (performance >= 3.0) bucket = '3.0-3.9';
            else if (performance >= 2.0) bucket = '2.0-2.9';
            else bucket = 'Below 2.0';
            
            breakdown[bucket].count++;
            breakdown[bucket].totalRaise += raisePercent;
        });
        
        // Calculate averages
        Object.values(breakdown).forEach(data => {
            if (data.count > 0) {
                data.avgRaise = data.totalRaise / data.count;
            }
        });
        
        return breakdown;
    }

    groupByRole(employeeData) {
        const groups = new Map();
        
        employeeData.forEach(emp => {
            const role = emp.title || 'Unknown';
            if (!groups.has(role)) {
                groups.set(role, []);
            }
            groups.get(role).push(emp);
        });
        
        return groups;
    }

    /**
     * Render the scenario modeler interface
     */
    render() {
        const container = document.getElementById('scenario-modeler');
        if (!container) return;
        
        container.innerHTML = `
            <div class="scenario-modeler">
                <div class="scenario-header">
                    <h2>Scenario Modeling</h2>
                    <p>Test different budget allocation strategies and compare outcomes</p>
                </div>
                
                <div class="scenario-controls">
                    <button class="btn btn-primary" onclick="scenarioModeler.showCreateScenarioModal()">
                        <i class="icon-plus"></i> Create New Scenario
                    </button>
                    <button class="btn btn-secondary" onclick="scenarioModeler.showComparisonView()">
                        <i class="icon-compare"></i> Compare Scenarios
                    </button>
                    <button class="btn btn-secondary" onclick="scenarioModeler.exportScenarios()">
                        <i class="icon-download"></i> Export Results
                    </button>
                </div>
                
                <div class="scenario-list">
                    <h3>Scenarios</h3>
                    <div id="scenarios-container">
                        ${this.renderScenarioList()}
                    </div>
                </div>
                
                <div class="scenario-comparison" id="scenario-comparison" style="display: none;">
                    <h3>Scenario Comparison</h3>
                    <div id="comparison-container"></div>
                </div>
            </div>
            
            <!-- Create Scenario Modal -->
            <div id="create-scenario-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Create New Scenario</h3>
                        <button class="modal-close" onclick="scenarioModeler.hideCreateScenarioModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${this.renderCreateScenarioForm()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render scenario list
     */
    renderScenarioList() {
        if (this.scenarios.size === 0) {
            return '<p class="empty-state">No scenarios created yet. Create your first scenario to get started.</p>';
        }
        
        return Array.from(this.scenarios.values()).map(scenario => `
            <div class="scenario-card" data-scenario-id="${scenario.id}">
                <div class="scenario-card-header">
                    <h4>${scenario.name}</h4>
                    <div class="scenario-actions">
                        <button class="btn btn-sm" onclick="scenarioModeler.editScenario('${scenario.id}')">Edit</button>
                        <button class="btn btn-sm" onclick="scenarioModeler.duplicateScenario('${scenario.id}')">Duplicate</button>
                        <button class="btn btn-sm btn-danger" onclick="scenarioModeler.deleteScenario('${scenario.id}')">Delete</button>
                    </div>
                </div>
                <div class="scenario-card-body">
                    <p class="scenario-description">${scenario.description}</p>
                    ${scenario.results ? this.renderScenarioResults(scenario.results) : '<p class="calculating">Calculating results...</p>'}
                </div>
                <div class="scenario-card-footer">
                    <small>Created: ${scenario.createdAt.toLocaleDateString()}</small>
                    <small>Modified: ${scenario.modifiedAt.toLocaleDateString()}</small>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render scenario results summary
     */
    renderScenarioResults(results) {
        return `
            <div class="scenario-results">
                <div class="results-grid">
                    <div class="result-item">
                        <span class="result-label">Total Cost:</span>
                        <span class="result-value">${this.formatCurrency(results.totalCost)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Budget Utilization:</span>
                        <span class="result-value">${results.budgetUtilization.toFixed(1)}%</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Employees with Raises:</span>
                        <span class="result-value">${results.employeesWithRaises}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Average Raise:</span>
                        <span class="result-value">${results.averageRaise.toFixed(1)}%</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">High Performer Retention:</span>
                        <span class="result-value">${results.highPerformerRetention.toFixed(1)}%</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Equity Score:</span>
                        <span class="result-value">${results.equityScore.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render create scenario form
     */
    renderCreateScenarioForm() {
        return `
            <form id="create-scenario-form">
                <div class="form-group">
                    <label for="scenario-name">Scenario Name</label>
                    <input type="text" id="scenario-name" name="name" required placeholder="e.g., Performance-Based 2024">
                </div>
                
                <div class="form-group">
                    <label for="scenario-description">Description</label>
                    <textarea id="scenario-description" name="description" placeholder="Describe the scenario strategy and goals"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="scenario-strategy">Strategy</label>
                    <select id="scenario-strategy" name="strategy" onchange="scenarioModeler.updateStrategyParameters()">
                        <option value="performance_based">Performance-Based Raises</option>
                        <option value="equity_focused">Equity-Focused Raises</option>
                        <option value="retention_focused">Retention-Focused Raises</option>
                        <option value="budget_maximized">Budget-Maximized Distribution</option>
                        <option value="custom">Custom Rules</option>
                    </select>
                </div>
                
                <div id="strategy-parameters">
                    ${this.renderStrategyParameters('performance_based')}
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="scenarioModeler.hideCreateScenarioModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Scenario</button>
                </div>
            </form>
        `;
    }

    /**
     * Render strategy-specific parameters
     */
    renderStrategyParameters(strategy) {
        switch (strategy) {
            case 'performance_based':
                return `
                    <div class="form-group">
                        <label for="budget-limit">Budget Limit</label>
                        <input type="number" id="budget-limit" name="budgetLimit" value="${this.constraints.totalBudget}" min="0">
                    </div>
                    <div class="form-group">
                        <label for="performance-weighting">Performance Weighting (0-1)</label>
                        <input type="number" id="performance-weighting" name="performanceWeighting" value="0.8" min="0" max="1" step="0.1">
                    </div>
                `;
                
            case 'equity_focused':
                return `
                    <div class="form-group">
                        <label for="budget-limit">Budget Limit</label>
                        <input type="number" id="budget-limit" name="budgetLimit" value="${this.constraints.totalBudget}" min="0">
                    </div>
                    <div class="form-group">
                        <label for="equity-threshold">Equity Threshold (0-1)</label>
                        <input type="number" id="equity-threshold" name="equityThreshold" value="0.9" min="0" max="1" step="0.05">
                    </div>
                `;
                
            case 'retention_focused':
                return `
                    <div class="form-group">
                        <label for="budget-limit">Budget Limit</label>
                        <input type="number" id="budget-limit" name="budgetLimit" value="${this.constraints.totalBudget}" min="0">
                    </div>
                    <div class="form-group">
                        <label for="risk-threshold">Risk Threshold (0-1)</label>
                        <input type="number" id="risk-threshold" name="riskThreshold" value="0.7" min="0" max="1" step="0.1">
                    </div>
                `;
                
            case 'budget_maximized':
                return `
                    <div class="form-group">
                        <label for="budget-limit">Budget Limit</label>
                        <input type="number" id="budget-limit" name="budgetLimit" value="${this.constraints.totalBudget}" min="0">
                    </div>
                    <div class="form-group">
                        <label for="distribution-method">Distribution Method</label>
                        <select id="distribution-method" name="distributionMethod">
                            <option value="proportional">Proportional to Salary</option>
                            <option value="equal">Equal Dollar Amount</option>
                            <option value="performance_weighted">Performance Weighted</option>
                        </select>
                    </div>
                `;
                
            case 'custom':
                return `
                    <div class="form-group">
                        <label>Custom Rules</label>
                        <div id="custom-rules-container">
                            <button type="button" class="btn btn-sm" onclick="scenarioModeler.addCustomRule()">Add Rule</button>
                        </div>
                    </div>
                `;
                
            default:
                return '';
        }
    }

    /**
     * Show create scenario modal
     */
    showCreateScenarioModal() {
        document.getElementById('create-scenario-modal').style.display = 'block';
        
        // Setup form submission
        document.getElementById('create-scenario-form').onsubmit = (e) => {
            e.preventDefault();
            this.handleCreateScenario(e.target);
        };
    }

    /**
     * Hide create scenario modal
     */
    hideCreateScenarioModal() {
        document.getElementById('create-scenario-modal').style.display = 'none';
    }

    /**
     * Update strategy parameters when strategy changes
     */
    updateStrategyParameters() {
        const strategy = document.getElementById('scenario-strategy').value;
        const container = document.getElementById('strategy-parameters');
        container.innerHTML = this.renderStrategyParameters(strategy);
    }

    /**
     * Handle create scenario form submission
     */
    handleCreateScenario(form) {
        const formData = new FormData(form);
        const config = {
            strategy: formData.get('strategy'),
            parameters: {}
        };
        
        // Collect strategy-specific parameters
        for (const [key, value] of formData.entries()) {
            if (key !== 'name' && key !== 'description' && key !== 'strategy') {
                config.parameters[key] = value;
            }
        }
        
        const scenarioId = this.createScenario(
            formData.get('name'),
            formData.get('description'),
            config
        );
        
        this.hideCreateScenarioModal();
        this.updateScenarioDisplay();
        
        // Show success notification
        window.showNotification('Scenario created successfully', 'success');
    }

    /**
     * Update scenario display
     */
    updateScenarioDisplay() {
        const container = document.getElementById('scenarios-container');
        if (container) {
            container.innerHTML = this.renderScenarioList();
        }
    }

    /**
     * Format currency for display
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Edit scenario
     */
    editScenario(scenarioId) {
        // Implementation for editing scenarios
        console.log('Edit scenario:', scenarioId);
    }

    /**
     * Duplicate scenario
     */
    duplicateScenario(scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        if (scenario) {
            this.createScenario(
                scenario.name + ' (Copy)',
                scenario.description,
                { ...scenario.config }
            );
            this.updateScenarioDisplay();
        }
    }

    /**
     * Delete scenario
     */
    deleteScenario(scenarioId) {
        if (confirm('Are you sure you want to delete this scenario?')) {
            this.scenarios.delete(scenarioId);
            this.updateScenarioDisplay();
        }
    }

    /**
     * Show comparison view
     */
    showComparisonView() {
        const comparisonContainer = document.getElementById('scenario-comparison');
        comparisonContainer.style.display = 'block';
        comparisonContainer.innerHTML = this.renderComparisonView();
    }

    /**
     * Render comparison view
     */
    renderComparisonView() {
        const scenarios = Array.from(this.scenarios.values()).filter(s => s.results);
        
        if (scenarios.length < 2) {
            return '<p>Create at least 2 scenarios to compare results.</p>';
        }
        
        return `
            <div class="comparison-table">
                <table>
                    <thead>
                        <tr>
                            <th>Metric</th>
                            ${scenarios.map(s => `<th>${s.name}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.comparisonMetrics.map(metric => `
                            <tr>
                                <td>${this.getMetricLabel(metric)}</td>
                                ${scenarios.map(s => `<td>${this.formatMetricValue(metric, s.results[metric])}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Get metric label for display
     */
    getMetricLabel(metric) {
        const labels = {
            totalCost: 'Total Cost',
            averageRaise: 'Average Raise %',
            medianRaise: 'Median Raise %',
            employeesWithRaises: 'Employees with Raises',
            highPerformerRetention: 'High Performer Retention %',
            budgetUtilization: 'Budget Utilization %',
            equityScore: 'Equity Score',
            riskScore: 'Risk Score'
        };
        return labels[metric] || metric;
    }

    /**
     * Format metric value for display
     */
    formatMetricValue(metric, value) {
        if (value === undefined || value === null) return 'N/A';
        
        switch (metric) {
            case 'totalCost':
                return this.formatCurrency(value);
            case 'averageRaise':
            case 'medianRaise':
            case 'highPerformerRetention':
            case 'budgetUtilization':
            case 'equityScore':
            case 'riskScore':
                return value.toFixed(1) + '%';
            case 'employeesWithRaises':
                return value.toString();
            default:
                return value.toString();
        }
    }

    /**
     * Export scenarios
     */
    exportScenarios() {
        const scenarios = Array.from(this.scenarios.values());
        const exportData = {
            exportDate: new Date().toISOString(),
            scenarios: scenarios.map(s => ({
                name: s.name,
                description: s.description,
                config: s.config,
                results: s.results
            }))
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scenario-analysis-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScenarioModeler;
} 