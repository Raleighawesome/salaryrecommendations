/**
 * Budget Modeler Component
 * 
 * Provides interactive budget modeling and scenario planning for salary raises.
 * Includes total cost calculations, budget constraints, and optimization suggestions.
 */

// Note: This component depends on raiseCalculator.js being loaded first

class BudgetModeler {
    constructor(container) {
        this.container = container;
        this.employees = [];
        this.budgetConstraints = {};
        this.currentScenario = null;
        this.scenarios = {};
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="budget-modeler">
                <div class="budget-header">
                    <h2>Budget Modeling & Planning</h2>
                    <p>Plan salary raises within budget constraints and compare scenarios</p>
                </div>
                
                <div class="budget-controls">
                    <div class="budget-input-section">
                        <h3>Budget Constraints</h3>
                        <div class="budget-inputs">
                            <div class="input-group">
                                <label for="total-budget">Total Budget Available</label>
                                <input type="number" id="total-budget" placeholder="Enter total budget" min="0" step="1000">
                                <select id="budget-currency">
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="INR">INR</option>
                                    <option value="CAD">CAD</option>
                                </select>
                            </div>
                            
                            <div class="input-group">
                                <label for="budget-increase">Maximum Budget Increase</label>
                                <input type="number" id="budget-increase" placeholder="Max increase from current" min="0" step="1000">
                            </div>
                            
                            <div class="input-group">
                                <label for="budget-period">Budget Period</label>
                                <select id="budget-period">
                                    <option value="annual">Annual</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                        
                        <button id="calculate-scenarios" class="btn btn-primary">
                            Calculate Budget Scenarios
                        </button>
                    </div>
                </div>
                
                <div class="scenario-comparison" style="display: none;">
                    <h3>Scenario Comparison</h3>
                    <div class="scenarios-grid">
                        <div class="scenario-card" data-scenario="conservative">
                            <h4>Conservative Scenario</h4>
                            <p class="scenario-description">80% of recommended raises</p>
                            <div class="scenario-metrics"></div>
                        </div>
                        
                        <div class="scenario-card" data-scenario="recommended">
                            <h4>Recommended Scenario</h4>
                            <p class="scenario-description">100% of recommended raises</p>
                            <div class="scenario-metrics"></div>
                        </div>
                        
                        <div class="scenario-card" data-scenario="aggressive">
                            <h4>Aggressive Scenario</h4>
                            <p class="scenario-description">120% of recommended raises</p>
                            <div class="scenario-metrics"></div>
                        </div>
                    </div>
                </div>
                
                <div class="budget-analysis" style="display: none;">
                    <h3>Budget Analysis</h3>
                    <div class="analysis-grid">
                        <div class="analysis-card">
                            <h4>Current Costs</h4>
                            <div class="cost-breakdown">
                                <div class="cost-item">
                                    <span>Total Salaries:</span>
                                    <span id="current-salaries">$0</span>
                                </div>
                                <div class="cost-item">
                                    <span>Total Cost (with benefits):</span>
                                    <span id="current-total-cost">$0</span>
                                </div>
                                <div class="cost-item">
                                    <span>Average Salary:</span>
                                    <span id="average-salary">$0</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="analysis-card">
                            <h4>Projected Costs</h4>
                            <div class="cost-breakdown">
                                <div class="cost-item">
                                    <span>New Total Salaries:</span>
                                    <span id="new-salaries">$0</span>
                                </div>
                                <div class="cost-item">
                                    <span>New Total Cost:</span>
                                    <span id="new-total-cost">$0</span>
                                </div>
                                <div class="cost-item">
                                    <span>Budget Increase:</span>
                                    <span id="budget-increase-amount">$0</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="analysis-card">
                            <h4>Budget Utilization</h4>
                            <div class="utilization-display">
                                <div class="utilization-bar">
                                    <div class="utilization-fill" id="utilization-fill"></div>
                                </div>
                                <div class="utilization-text">
                                    <span id="utilization-percentage">0%</span>
                                    <span>of budget used</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="optimization-suggestions" style="display: none;">
                    <h3>Optimization Suggestions</h3>
                    <div id="suggestions-list" class="suggestions-list"></div>
                </div>
                
                <div class="detailed-breakdown" style="display: none;">
                    <h3>Detailed Employee Breakdown</h3>
                    <div class="breakdown-controls">
                        <button id="export-budget-plan" class="btn btn-secondary">
                            Export Budget Plan
                        </button>
                        <button id="toggle-approval-only" class="btn btn-secondary">
                            Show Only Approval Required
                        </button>
                    </div>
                    <div id="employee-breakdown-table" class="breakdown-table"></div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Calculate scenarios button
        document.getElementById('calculate-scenarios').addEventListener('click', () => {
            this.calculateScenarios();
        });
        
        // Scenario card selection
        document.querySelectorAll('.scenario-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectScenario(card.dataset.scenario);
            });
        });
        
        // Export budget plan
        document.getElementById('export-budget-plan').addEventListener('click', () => {
            this.exportBudgetPlan();
        });
        
        // Toggle approval only view
        document.getElementById('toggle-approval-only').addEventListener('click', () => {
            this.toggleApprovalOnlyView();
        });
        
        // Real-time budget input updates
        ['total-budget', 'budget-increase'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                if (this.scenarios && Object.keys(this.scenarios).length > 0) {
                    this.updateBudgetAnalysis();
                }
            });
        });
    }
    
    setEmployees(employees) {
        this.employees = employees;
        console.log(`Budget modeler loaded ${employees.length} employees`);
    }
    
    calculateScenarios() {
        if (!this.employees || this.employees.length === 0) {
            this.showNotification('Please load employee data first', 'warning');
            return;
        }
        
        // Get budget constraints from inputs
        const totalBudget = parseFloat(document.getElementById('total-budget').value) || 0;
        const maxIncrease = parseFloat(document.getElementById('budget-increase').value) || totalBudget;
        const currency = document.getElementById('budget-currency').value;
        const period = document.getElementById('budget-period').value;
        
        this.budgetConstraints = {
            totalBudget,
            maxIncrease,
            currency,
            period
        };
        
        // Generate scenarios
        this.scenarios = generateRaiseScenarios(this.employees, maxIncrease);
        
        // Show scenario comparison
        this.displayScenarioComparison();
        
        // Select recommended scenario by default
        this.selectScenario('recommended');
        
        console.log('Budget scenarios calculated:', this.scenarios);
    }
    
    displayScenarioComparison() {
        const scenarioSection = document.querySelector('.scenario-comparison');
        scenarioSection.style.display = 'block';
        
        Object.entries(this.scenarios).forEach(([key, scenario]) => {
            const card = document.querySelector(`[data-scenario="${key}"]`);
            const metricsDiv = card.querySelector('.scenario-metrics');
            
            const budgetUtilization = (scenario.budgetUtilization * 100).toFixed(1);
            const isOverBudget = scenario.budgetExceeded;
            
            metricsDiv.innerHTML = `
                <div class="metric">
                    <span class="metric-label">Budget Increase:</span>
                    <span class="metric-value">${this.formatCurrency(scenario.totalBudgetIncrease)}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Budget Utilization:</span>
                    <span class="metric-value ${isOverBudget ? 'over-budget' : ''}">${budgetUtilization}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Employees Affected:</span>
                    <span class="metric-value">${scenario.employees.length}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Approval Required:</span>
                    <span class="metric-value">${scenario.approvalRequired.length}</span>
                </div>
            `;
            
            // Add visual indicators
            card.classList.toggle('over-budget', isOverBudget);
            card.classList.toggle('optimal', budgetUtilization >= 80 && budgetUtilization <= 95);
        });
    }
    
    selectScenario(scenarioKey) {
        // Update UI selection
        document.querySelectorAll('.scenario-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-scenario="${scenarioKey}"]`).classList.add('selected');
        
        // Set current scenario
        this.currentScenario = this.scenarios[scenarioKey];
        
        // Update analysis displays
        this.updateBudgetAnalysis();
        this.displayOptimizationSuggestions();
        this.displayDetailedBreakdown();
        
        console.log(`Selected scenario: ${scenarioKey}`, this.currentScenario);
    }
    
    updateBudgetAnalysis() {
        if (!this.currentScenario) return;
        
        const analysisSection = document.querySelector('.budget-analysis');
        analysisSection.style.display = 'block';
        
        // Current costs
        const currentSalaries = this.currentScenario.employees.reduce((sum, emp) => sum + emp.currentSalary, 0);
        const currentTotalCost = this.currentScenario.totalCurrentCost;
        const averageSalary = currentSalaries / this.currentScenario.employees.length;
        
        // Projected costs
        const newSalaries = this.currentScenario.employees.reduce((sum, emp) => sum + emp.impact.newSalary, 0);
        const newTotalCost = this.currentScenario.totalNewCost;
        const budgetIncrease = this.currentScenario.totalBudgetIncrease;
        
        // Update displays
        document.getElementById('current-salaries').textContent = this.formatCurrency(currentSalaries);
        document.getElementById('current-total-cost').textContent = this.formatCurrency(currentTotalCost);
        document.getElementById('average-salary').textContent = this.formatCurrency(averageSalary);
        
        document.getElementById('new-salaries').textContent = this.formatCurrency(newSalaries);
        document.getElementById('new-total-cost').textContent = this.formatCurrency(newTotalCost);
        document.getElementById('budget-increase-amount').textContent = this.formatCurrency(budgetIncrease);
        
        // Budget utilization
        const utilization = this.currentScenario.budgetUtilization * 100;
        const utilizationFill = document.getElementById('utilization-fill');
        const utilizationText = document.getElementById('utilization-percentage');
        
        utilizationFill.style.width = `${Math.min(utilization, 100)}%`;
        utilizationText.textContent = `${utilization.toFixed(1)}%`;
        
        // Color coding for utilization
        utilizationFill.className = 'utilization-fill';
        if (utilization > 100) {
            utilizationFill.classList.add('over-budget');
        } else if (utilization > 90) {
            utilizationFill.classList.add('high-utilization');
        } else if (utilization > 70) {
            utilizationFill.classList.add('medium-utilization');
        }
    }
    
    displayOptimizationSuggestions() {
        if (!this.currentScenario) return;
        
        const suggestionsSection = document.querySelector('.optimization-suggestions');
        const suggestionsList = document.getElementById('suggestions-list');
        
        let suggestions = [...this.currentScenario.recommendations];
        
        // Add custom optimization suggestions
        if (this.currentScenario.budgetUtilization > 1.0) {
            const overageAmount = this.currentScenario.totalBudgetIncrease - this.budgetConstraints.maxIncrease;
            suggestions.push({
                type: 'reduce_raises',
                message: `Consider reducing raises by ${this.formatCurrency(overageAmount)} to stay within budget`,
                severity: 'error',
                actionable: true
            });
        }
        
        if (this.currentScenario.approvalRequired.length > 0) {
            suggestions.push({
                type: 'approval_workflow',
                message: `${this.currentScenario.approvalRequired.length} employees require VP approval for their raises`,
                severity: 'warning',
                actionable: true
            });
        }
        
        // Check for high performers with low raises
        const undervaluedPerformers = this.currentScenario.employees.filter(emp => 
            emp.performance >= 4 && emp.recommendation.percentage < 0.05
        );
        
        if (undervaluedPerformers.length > 0) {
            suggestions.push({
                type: 'undervalued_performers',
                message: `${undervaluedPerformers.length} high performers have raises below 5% - consider increasing to retain talent`,
                severity: 'info',
                actionable: true
            });
        }
        
        if (suggestions.length > 0) {
            suggestionsSection.style.display = 'block';
            suggestionsList.innerHTML = suggestions.map(suggestion => `
                <div class="suggestion-item ${suggestion.severity}">
                    <div class="suggestion-icon">
                        ${this.getSuggestionIcon(suggestion.severity)}
                    </div>
                    <div class="suggestion-content">
                        <p>${suggestion.message}</p>
                        ${suggestion.actionable ? '<button class="btn btn-sm btn-outline">Take Action</button>' : ''}
                    </div>
                </div>
            `).join('');
        } else {
            suggestionsSection.style.display = 'none';
        }
    }
    
    displayDetailedBreakdown() {
        if (!this.currentScenario) return;
        
        const breakdownSection = document.querySelector('.detailed-breakdown');
        const tableDiv = document.getElementById('employee-breakdown-table');
        
        breakdownSection.style.display = 'block';
        
        // Create detailed table
        const table = document.createElement('table');
        table.className = 'budget-breakdown-table';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Employee</th>
                    <th>Country</th>
                    <th>Performance</th>
                    <th>Current Salary</th>
                    <th>Recommended Raise</th>
                    <th>New Salary</th>
                    <th>Total Cost Impact</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${this.currentScenario.employees.map(emp => `
                    <tr class="${emp.validation.requiresApproval ? 'requires-approval' : ''}">
                        <td>
                            <div class="employee-info">
                                <strong>${emp.name}</strong>
                                <small>${emp.title || 'N/A'}</small>
                            </div>
                        </td>
                        <td>${emp.country || 'N/A'}</td>
                        <td>
                            <span class="performance-badge performance-${emp.performance}">
                                ${emp.performance}/5
                            </span>
                        </td>
                        <td>${this.formatCurrency(emp.currentSalary)}</td>
                        <td>
                            <div class="raise-info">
                                <strong>${(emp.recommendation.percentage * 100).toFixed(1)}%</strong>
                                <small>${this.formatCurrency(emp.impact.raiseAmount)}</small>
                            </div>
                        </td>
                        <td>${this.formatCurrency(emp.impact.newSalary)}</td>
                        <td>${this.formatCurrency(emp.impact.totalCostIncrease)}</td>
                        <td>
                            <div class="status-indicators">
                                ${emp.validation.requiresApproval ? '<span class="status-badge approval">Approval Required</span>' : ''}
                                ${emp.validation.warnings.length > 0 ? '<span class="status-badge warning">Warnings</span>' : ''}
                                ${emp.validation.errors.length > 0 ? '<span class="status-badge error">Errors</span>' : ''}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        tableDiv.innerHTML = '';
        tableDiv.appendChild(table);
    }
    
    toggleApprovalOnlyView() {
        const table = document.querySelector('.budget-breakdown-table tbody');
        const button = document.getElementById('toggle-approval-only');
        
        if (button.textContent.includes('Show Only')) {
            // Show only approval required
            table.querySelectorAll('tr').forEach(row => {
                if (!row.classList.contains('requires-approval')) {
                    row.style.display = 'none';
                }
            });
            button.textContent = 'Show All Employees';
        } else {
            // Show all employees
            table.querySelectorAll('tr').forEach(row => {
                row.style.display = '';
            });
            button.textContent = 'Show Only Approval Required';
        }
    }
    
    exportBudgetPlan() {
        if (!this.currentScenario) {
            this.showNotification('No scenario selected to export', 'warning');
            return;
        }
        
        // Create CSV data
        const headers = [
            'Employee Name', 'Title', 'Country', 'Performance Rating',
            'Current Salary', 'Recommended Raise %', 'Raise Amount',
            'New Salary', 'Total Cost Impact', 'Requires Approval',
            'Warnings', 'Risk Factors'
        ];
        
        const rows = this.currentScenario.employees.map(emp => [
            emp.name,
            emp.title || '',
            emp.country || '',
            emp.performance,
            emp.currentSalary,
            (emp.recommendation.percentage * 100).toFixed(2),
            emp.impact.raiseAmount.toFixed(2),
            emp.impact.newSalary.toFixed(2),
            emp.impact.totalCostIncrease.toFixed(2),
            emp.validation.requiresApproval ? 'Yes' : 'No',
            emp.validation.warnings.join('; '),
            emp.recommendation.appliedRiskFactors.join('; ')
        ]);
        
        // Add summary row
        rows.push([]);
        rows.push(['SUMMARY']);
        rows.push(['Total Current Cost', '', '', '', this.currentScenario.totalCurrentCost.toFixed(2)]);
        rows.push(['Total New Cost', '', '', '', this.currentScenario.totalNewCost.toFixed(2)]);
        rows.push(['Total Budget Increase', '', '', '', this.currentScenario.totalBudgetIncrease.toFixed(2)]);
        rows.push(['Budget Utilization', '', '', '', `${(this.currentScenario.budgetUtilization * 100).toFixed(1)}%`]);
        
        // Create and download CSV
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-plan-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Budget plan exported successfully', 'success');
    }
    
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    getSuggestionIcon(severity) {
        const icons = {
            error: '⚠️',
            warning: '⚡',
            info: 'ℹ️',
            success: '✅'
        };
        return icons[severity] || 'ℹ️';
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
    module.exports = BudgetModeler;
} else {
    window.BudgetModeler = BudgetModeler;
} 