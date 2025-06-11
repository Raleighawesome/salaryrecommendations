/**
 * Raise Recommendations Component
 * 
 * Provides performance-based raise recommendations with detailed analysis,
 * justifications, and interactive editing capabilities.
 */

// Note: This component depends on raiseCalculator.js being loaded first

class RaiseRecommendations {
    constructor(container) {
        this.container = container;
        this.employees = [];
        this.recommendations = [];
        this.selectedEmployee = null;
        this.filters = {
            performance: 'all',
            country: 'all',
            riskLevel: 'all',
            approvalRequired: 'all'
        };
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="raise-recommendations">
                <div class="recommendations-header">
                    <h2>Performance-Based Raise Recommendations</h2>
                    <p>AI-generated salary raise recommendations based on performance, market data, and risk factors</p>
                </div>
                
                <div class="recommendations-controls">
                    <div class="filters-section">
                        <h3>Filter Recommendations</h3>
                        <div class="filters-grid">
                            <div class="filter-group">
                                <label for="performance-filter">Performance Rating</label>
                                <select id="performance-filter">
                                    <option value="all">All Ratings</option>
                                    <option value="5">5 - Far Exceeds (Top Performers)</option>
                                    <option value="4">4 - Exceeds Expectations</option>
                                    <option value="3">3 - Meets Expectations</option>
                                    <option value="2">2 - Meets Some Expectations</option>
                                    <option value="1">1 - Below Expectations</option>
                                </select>
                            </div>
                            
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
                                <label for="risk-filter">Risk Level</label>
                                <select id="risk-filter">
                                    <option value="all">All Risk Levels</option>
                                    <option value="high">High Risk (Flight Risk)</option>
                                    <option value="medium">Medium Risk</option>
                                    <option value="low">Low Risk</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label for="approval-filter">Approval Status</label>
                                <select id="approval-filter">
                                    <option value="all">All Employees</option>
                                    <option value="required">Requires VP Approval</option>
                                    <option value="standard">Standard Approval</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="filter-actions">
                            <button id="apply-filters" class="btn btn-primary">Apply Filters</button>
                            <button id="clear-filters" class="btn btn-secondary">Clear All</button>
                            <button id="generate-recommendations" class="btn btn-success">
                                Generate Recommendations
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="recommendations-summary" style="display: none;">
                    <h3>Recommendations Summary</h3>
                    <div class="summary-grid">
                        <div class="summary-card">
                            <h4>Total Employees</h4>
                            <span class="summary-value" id="total-employees">0</span>
                        </div>
                        <div class="summary-card">
                            <h4>Average Recommended Raise</h4>
                            <span class="summary-value" id="average-raise">0%</span>
                        </div>
                        <div class="summary-card">
                            <h4>Requires VP Approval</h4>
                            <span class="summary-value" id="approval-count">0</span>
                        </div>
                        <div class="summary-card">
                            <h4>High Performers</h4>
                            <span class="summary-value" id="high-performers">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="recommendations-list" style="display: none;">
                    <div class="list-header">
                        <h3>Individual Recommendations</h3>
                        <div class="list-controls">
                            <button id="export-recommendations" class="btn btn-secondary">
                                Export Recommendations
                            </button>
                            <button id="bulk-approve" class="btn btn-primary">
                                Bulk Approve Selected
                            </button>
                        </div>
                    </div>
                    
                    <div class="recommendations-table-container">
                        <table class="recommendations-table">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" id="select-all"></th>
                                    <th>Employee</th>
                                    <th>Performance</th>
                                    <th>Current Salary</th>
                                    <th>Recommended Raise</th>
                                    <th>New Salary</th>
                                    <th>Justification</th>
                                    <th>Risk Factors</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="recommendations-tbody">
                                <!-- Recommendations will be populated here -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="recommendation-detail-modal" id="detail-modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Detailed Recommendation Analysis</h3>
                            <button class="modal-close" id="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div id="employee-detail-content">
                                <!-- Detailed analysis will be populated here -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button id="save-custom-raise" class="btn btn-primary">Save Custom Raise</button>
                            <button id="approve-recommendation" class="btn btn-success">Approve Recommendation</button>
                            <button id="reject-recommendation" class="btn btn-danger">Reject</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Generate recommendations
        document.getElementById('generate-recommendations').addEventListener('click', () => {
            this.generateRecommendations();
        });
        
        // Filter controls
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.applyFilters();
        });
        
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Export and bulk actions
        document.getElementById('export-recommendations').addEventListener('click', () => {
            this.exportRecommendations();
        });
        
        document.getElementById('bulk-approve').addEventListener('click', () => {
            this.bulkApproveSelected();
        });
        
        // Select all checkbox
        document.getElementById('select-all').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });
        
        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeDetailModal();
        });
        
        document.getElementById('save-custom-raise').addEventListener('click', () => {
            this.saveCustomRaise();
        });
        
        document.getElementById('approve-recommendation').addEventListener('click', () => {
            this.approveRecommendation();
        });
        
        document.getElementById('reject-recommendation').addEventListener('click', () => {
            this.rejectRecommendation();
        });
    }
    
    setEmployees(employees) {
        this.employees = employees;
        console.log(`Raise recommendations loaded ${employees.length} employees`);
    }
    
    generateRecommendations() {
        if (!this.employees || this.employees.length === 0) {
            this.showNotification('Please load employee data first', 'warning');
            return;
        }
        
        this.recommendations = this.employees.map(employee => {
            const country = employee.country || 'US';
            const constraints = COUNTRY_CONSTRAINTS[country] || COUNTRY_CONSTRAINTS['US'];
            
            // Calculate recommended raise
            const recommendation = calculateRecommendedRaise(employee, constraints);
            
            // Validate the recommendation
            const validation = validateRaise(employee, recommendation.percentage);
            
            // Generate justification
            const justification = this.generateJustification(employee, recommendation, constraints);
            
            // Calculate risk level
            const riskLevel = this.calculateRiskLevel(employee);
            
            return {
                ...employee,
                recommendation,
                validation,
                justification,
                riskLevel,
                constraints,
                status: 'pending', // pending, approved, rejected, custom
                selected: false
            };
        });
        
        this.displayRecommendations();
        console.log('Generated recommendations:', this.recommendations);
    }
    
    generateJustification(employee, recommendation, constraints) {
        const justifications = [];
        
        // Performance-based justification
        const performanceText = {
            5: 'exceptional performance and significant contributions',
            4: 'strong performance exceeding expectations',
            3: 'solid performance meeting all expectations',
            2: 'adequate performance with room for improvement',
            1: 'performance below expectations requiring development'
        };
        
        justifications.push(`Based on ${performanceText[employee.performance] || 'performance rating'}`);
        
        // Risk factor justifications
        if (employee.riskIndicators && employee.riskIndicators.length > 0) {
            employee.riskIndicators.forEach(risk => {
                switch (risk) {
                    case 'flight_risk':
                        justifications.push('increased due to flight risk concerns');
                        break;
                    case 'promotion_ready':
                        justifications.push('enhanced for promotion readiness');
                        break;
                    case 'new_hire':
                        justifications.push('adjusted for recent hire status');
                        break;
                    case 'recent_raise':
                        justifications.push('reduced due to recent salary adjustment');
                        break;
                }
            });
        }
        
        // Market positioning
        if (employee.comparatio) {
            if (employee.comparatio < 0.8) {
                justifications.push('below market positioning requires correction');
            } else if (employee.comparatio > 1.2) {
                justifications.push('above market positioning considered');
            }
        }
        
        // Country-specific context
        const raisePercent = (recommendation.percentage * 100).toFixed(1);
        const typicalRange = `${(constraints.typicalRange.min * 100).toFixed(1)}%-${(constraints.typicalRange.max * 100).toFixed(1)}%`;
        justifications.push(`${raisePercent}% raise within ${employee.country || 'US'} typical range (${typicalRange})`);
        
        return justifications.join('; ');
    }
    
    calculateRiskLevel(employee) {
        let riskScore = 0;
        
        // Performance risk
        if (employee.performance <= 2) riskScore += 2;
        else if (employee.performance >= 4) riskScore -= 1;
        
        // Flight risk indicators
        if (employee.riskIndicators && employee.riskIndicators.includes('flight_risk')) {
            riskScore += 3;
        }
        
        // Tenure risk
        if (employee.tenure && employee.tenure < 1) riskScore += 1;
        else if (employee.tenure && employee.tenure > 5) riskScore -= 1;
        
        // Salary positioning risk
        if (employee.comparatio && employee.comparatio < 0.8) riskScore += 2;
        
        if (riskScore >= 3) return 'high';
        if (riskScore >= 1) return 'medium';
        return 'low';
    }
    
    displayRecommendations() {
        // Show summary
        this.updateSummary();
        
        // Show recommendations list
        this.updateRecommendationsList();
        
        // Show sections
        document.querySelector('.recommendations-summary').style.display = 'block';
        document.querySelector('.recommendations-list').style.display = 'block';
    }
    
    updateSummary() {
        const filtered = this.getFilteredRecommendations();
        
        const totalEmployees = filtered.length;
        const averageRaise = filtered.length > 0 
            ? (filtered.reduce((sum, rec) => sum + rec.recommendation.percentage, 0) / filtered.length * 100).toFixed(1)
            : 0;
        const approvalCount = filtered.filter(rec => rec.validation.requiresApproval).length;
        const highPerformers = filtered.filter(rec => rec.performance >= 4).length;
        
        document.getElementById('total-employees').textContent = totalEmployees;
        document.getElementById('average-raise').textContent = `${averageRaise}%`;
        document.getElementById('approval-count').textContent = approvalCount;
        document.getElementById('high-performers').textContent = highPerformers;
    }
    
    updateRecommendationsList() {
        const tbody = document.getElementById('recommendations-tbody');
        const filtered = this.getFilteredRecommendations();
        
        tbody.innerHTML = filtered.map((rec, index) => `
            <tr class="recommendation-row ${rec.validation.requiresApproval ? 'requires-approval' : ''} ${rec.status}">
                <td>
                    <input type="checkbox" class="employee-checkbox" data-index="${index}" ${rec.selected ? 'checked' : ''}>
                </td>
                <td>
                    <div class="employee-info">
                        <strong>${rec.name}</strong>
                        <small>${rec.title || 'N/A'}</small>
                        <small>${rec.country || 'N/A'}</small>
                    </div>
                </td>
                <td>
                    <span class="performance-badge performance-${rec.performance}">
                        ${rec.performance}/5
                    </span>
                </td>
                <td>${this.formatCurrency(rec.currentSalary)}</td>
                <td>
                    <div class="raise-recommendation">
                        <strong>${(rec.recommendation.percentage * 100).toFixed(1)}%</strong>
                        <small>${this.formatCurrency(rec.currentSalary * rec.recommendation.percentage)}</small>
                    </div>
                </td>
                <td>${this.formatCurrency(rec.currentSalary * (1 + rec.recommendation.percentage))}</td>
                <td>
                    <div class="justification-text">
                        ${rec.justification}
                    </div>
                </td>
                <td>
                    <span class="risk-badge risk-${rec.riskLevel}">${rec.riskLevel.toUpperCase()}</span>
                    ${rec.recommendation.appliedRiskFactors.map(factor => 
                        `<span class="risk-factor">${factor.replace('_', ' ')}</span>`
                    ).join('')}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline view-detail" data-index="${index}">
                            View Details
                        </button>
                        <button class="btn btn-sm btn-success approve-btn" data-index="${index}" 
                                ${rec.status === 'approved' ? 'disabled' : ''}>
                            ${rec.status === 'approved' ? 'Approved' : 'Approve'}
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Attach event listeners for action buttons
        tbody.querySelectorAll('.view-detail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.showDetailModal(filtered[index]);
            });
        });
        
        tbody.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.approveIndividualRecommendation(filtered[index]);
            });
        });
        
        tbody.querySelectorAll('.employee-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                filtered[index].selected = e.target.checked;
            });
        });
    }
    
    getFilteredRecommendations() {
        return this.recommendations.filter(rec => {
            if (this.filters.performance !== 'all' && rec.performance.toString() !== this.filters.performance) {
                return false;
            }
            if (this.filters.country !== 'all' && rec.country !== this.filters.country) {
                return false;
            }
            if (this.filters.riskLevel !== 'all' && rec.riskLevel !== this.filters.riskLevel) {
                return false;
            }
            if (this.filters.approvalRequired !== 'all') {
                if (this.filters.approvalRequired === 'required' && !rec.validation.requiresApproval) {
                    return false;
                }
                if (this.filters.approvalRequired === 'standard' && rec.validation.requiresApproval) {
                    return false;
                }
            }
            return true;
        });
    }
    
    applyFilters() {
        this.filters.performance = document.getElementById('performance-filter').value;
        this.filters.country = document.getElementById('country-filter').value;
        this.filters.riskLevel = document.getElementById('risk-filter').value;
        this.filters.approvalRequired = document.getElementById('approval-filter').value;
        
        this.updateSummary();
        this.updateRecommendationsList();
        
        console.log('Applied filters:', this.filters);
    }
    
    clearFilters() {
        this.filters = {
            performance: 'all',
            country: 'all',
            riskLevel: 'all',
            approvalRequired: 'all'
        };
        
        // Reset filter UI
        document.getElementById('performance-filter').value = 'all';
        document.getElementById('country-filter').value = 'all';
        document.getElementById('risk-filter').value = 'all';
        document.getElementById('approval-filter').value = 'all';
        
        this.updateSummary();
        this.updateRecommendationsList();
    }
    
    showDetailModal(recommendation) {
        this.selectedEmployee = recommendation;
        const modal = document.getElementById('detail-modal');
        const content = document.getElementById('employee-detail-content');
        
        content.innerHTML = `
            <div class="employee-detail">
                <div class="detail-header">
                    <h4>${recommendation.name}</h4>
                    <p>${recommendation.title || 'N/A'} • ${recommendation.country || 'N/A'}</p>
                </div>
                
                <div class="detail-sections">
                    <div class="detail-section">
                        <h5>Current Information</h5>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Current Salary:</label>
                                <span>${this.formatCurrency(recommendation.currentSalary)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Performance Rating:</label>
                                <span>${recommendation.performance}/5</span>
                            </div>
                            <div class="detail-item">
                                <label>Tenure:</label>
                                <span>${recommendation.tenure || 'N/A'} years</span>
                            </div>
                            <div class="detail-item">
                                <label>Market Position:</label>
                                <span>${recommendation.comparatio ? (recommendation.comparatio * 100).toFixed(0) + '%' : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Recommendation Analysis</h5>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Recommended Raise:</label>
                                <span>${(recommendation.recommendation.percentage * 100).toFixed(1)}%</span>
                            </div>
                            <div class="detail-item">
                                <label>Raise Amount:</label>
                                <span>${this.formatCurrency(recommendation.currentSalary * recommendation.recommendation.percentage)}</span>
                            </div>
                            <div class="detail-item">
                                <label>New Salary:</label>
                                <span>${this.formatCurrency(recommendation.currentSalary * (1 + recommendation.recommendation.percentage))}</span>
                            </div>
                            <div class="detail-item">
                                <label>Risk Level:</label>
                                <span class="risk-badge risk-${recommendation.riskLevel}">${recommendation.riskLevel.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Justification</h5>
                        <p>${recommendation.justification}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Risk Factors</h5>
                        <div class="risk-factors">
                            ${recommendation.recommendation.appliedRiskFactors.length > 0 
                                ? recommendation.recommendation.appliedRiskFactors.map(factor => 
                                    `<span class="risk-factor">${factor.replace('_', ' ')}</span>`
                                  ).join('')
                                : '<span>No specific risk factors identified</span>'
                            }
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Custom Raise Override</h5>
                        <div class="custom-raise-input">
                            <label for="custom-raise-percent">Custom Raise Percentage:</label>
                            <input type="number" id="custom-raise-percent" 
                                   value="${(recommendation.recommendation.percentage * 100).toFixed(1)}" 
                                   min="0" max="50" step="0.1">
                            <span>%</span>
                        </div>
                        <div class="validation-warnings" id="custom-validation">
                            <!-- Validation messages will appear here -->
                        </div>
                    </div>
                    
                    ${recommendation.validation.warnings.length > 0 || recommendation.validation.errors.length > 0 ? `
                        <div class="detail-section">
                            <h5>Validation Issues</h5>
                            ${recommendation.validation.errors.map(error => 
                                `<div class="validation-error">⚠️ ${error}</div>`
                            ).join('')}
                            ${recommendation.validation.warnings.map(warning => 
                                `<div class="validation-warning">⚡ ${warning}</div>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add real-time validation for custom raise
        document.getElementById('custom-raise-percent').addEventListener('input', (e) => {
            this.validateCustomRaise(recommendation, parseFloat(e.target.value) / 100);
        });
        
        modal.style.display = 'block';
    }
    
    validateCustomRaise(recommendation, customPercentage) {
        const validation = validateRaise(recommendation, customPercentage);
        const validationDiv = document.getElementById('custom-validation');
        
        let html = '';
        validation.errors.forEach(error => {
            html += `<div class="validation-error">⚠️ ${error}</div>`;
        });
        validation.warnings.forEach(warning => {
            html += `<div class="validation-warning">⚡ ${warning}</div>`;
        });
        
        validationDiv.innerHTML = html;
    }
    
    closeDetailModal() {
        document.getElementById('detail-modal').style.display = 'none';
        this.selectedEmployee = null;
    }
    
    saveCustomRaise() {
        if (!this.selectedEmployee) return;
        
        const customPercent = parseFloat(document.getElementById('custom-raise-percent').value) / 100;
        
        // Update the recommendation
        this.selectedEmployee.recommendation.percentage = customPercent;
        this.selectedEmployee.validation = validateRaise(this.selectedEmployee, customPercent);
        this.selectedEmployee.status = 'custom';
        
        // Regenerate justification for custom raise
        this.selectedEmployee.justification = `Custom raise of ${(customPercent * 100).toFixed(1)}% set by manager override`;
        
        this.updateRecommendationsList();
        this.closeDetailModal();
        
        this.showNotification('Custom raise saved successfully', 'success');
    }
    
    approveRecommendation() {
        if (!this.selectedEmployee) return;
        
        this.selectedEmployee.status = 'approved';
        this.updateRecommendationsList();
        this.closeDetailModal();
        
        this.showNotification(`Recommendation approved for ${this.selectedEmployee.name}`, 'success');
    }
    
    rejectRecommendation() {
        if (!this.selectedEmployee) return;
        
        this.selectedEmployee.status = 'rejected';
        this.updateRecommendationsList();
        this.closeDetailModal();
        
        this.showNotification(`Recommendation rejected for ${this.selectedEmployee.name}`, 'info');
    }
    
    approveIndividualRecommendation(recommendation) {
        recommendation.status = 'approved';
        this.updateRecommendationsList();
        this.showNotification(`Recommendation approved for ${recommendation.name}`, 'success');
    }
    
    toggleSelectAll(checked) {
        const filtered = this.getFilteredRecommendations();
        filtered.forEach(rec => rec.selected = checked);
        this.updateRecommendationsList();
    }
    
    bulkApproveSelected() {
        const selected = this.recommendations.filter(rec => rec.selected);
        if (selected.length === 0) {
            this.showNotification('No employees selected', 'warning');
            return;
        }
        
        selected.forEach(rec => rec.status = 'approved');
        this.updateRecommendationsList();
        
        this.showNotification(`Approved recommendations for ${selected.length} employees`, 'success');
    }
    
    exportRecommendations() {
        if (!this.recommendations || this.recommendations.length === 0) {
            this.showNotification('No recommendations to export', 'warning');
            return;
        }
        
        const headers = [
            'Employee Name', 'Title', 'Country', 'Performance Rating',
            'Current Salary', 'Recommended Raise %', 'Raise Amount',
            'New Salary', 'Risk Level', 'Requires Approval',
            'Status', 'Justification', 'Risk Factors'
        ];
        
        const rows = this.recommendations.map(rec => [
            rec.name,
            rec.title || '',
            rec.country || '',
            rec.performance,
            rec.currentSalary,
            (rec.recommendation.percentage * 100).toFixed(2),
            (rec.currentSalary * rec.recommendation.percentage).toFixed(2),
            (rec.currentSalary * (1 + rec.recommendation.percentage)).toFixed(2),
            rec.riskLevel,
            rec.validation.requiresApproval ? 'Yes' : 'No',
            rec.status,
            rec.justification,
            rec.recommendation.appliedRiskFactors.join('; ')
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raise-recommendations-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Recommendations exported successfully', 'success');
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
    module.exports = RaiseRecommendations;
} else {
    window.RaiseRecommendations = RaiseRecommendations;
} 