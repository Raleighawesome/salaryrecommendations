/**
 * Approval Workflow Component
 * 
 * Manages the approval workflow for salary raises that exceed country-specific
 * thresholds and require VP or executive approval.
 */

// Note: This component depends on raiseCalculator.js being loaded first

class ApprovalWorkflow {
    constructor(container) {
        this.container = container;
        this.employees = [];
        this.approvalQueue = [];
        this.approvalHistory = [];
        this.currentApproval = null;
        this.filters = {
            status: 'all',
            country: 'all',
            urgency: 'all'
        };
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="approval-workflow">
                <div class="workflow-header">
                    <h2>Raise Approval Workflow</h2>
                    <p>Manage VP and executive approvals for salary raises exceeding country thresholds</p>
                </div>
                
                <div class="workflow-summary">
                    <div class="summary-cards">
                        <div class="summary-card pending">
                            <h4>Pending Approvals</h4>
                            <span class="summary-value" id="pending-count">0</span>
                        </div>
                        
                        <div class="summary-card urgent">
                            <h4>Urgent Reviews</h4>
                            <span class="summary-value" id="urgent-count">0</span>
                        </div>
                        
                        <div class="summary-card approved">
                            <h4>Approved Today</h4>
                            <span class="summary-value" id="approved-today">0</span>
                        </div>
                        
                        <div class="summary-card rejected">
                            <h4>Requires Revision</h4>
                            <span class="summary-value" id="revision-count">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="workflow-controls">
                    <div class="controls-section">
                        <h3>Approval Queue Management</h3>
                        <div class="controls-grid">
                            <div class="control-group">
                                <label for="status-filter">Status Filter</label>
                                <select id="status-filter">
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending Approval</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="revision">Needs Revision</option>
                                </select>
                            </div>
                            
                            <div class="control-group">
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
                            
                            <div class="control-group">
                                <label for="urgency-filter">Urgency</label>
                                <select id="urgency-filter">
                                    <option value="all">All Urgency Levels</option>
                                    <option value="high">High Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="low">Low Priority</option>
                                </select>
                            </div>
                            
                            <div class="control-group">
                                <button id="refresh-queue" class="btn btn-secondary">
                                    Refresh Queue
                                </button>
                                <button id="bulk-approve" class="btn btn-success">
                                    Bulk Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="approval-queue">
                    <div class="queue-header">
                        <h3>Approval Queue</h3>
                        <div class="queue-actions">
                            <button id="export-queue" class="btn btn-secondary">
                                Export Queue
                            </button>
                            <button id="send-reminders" class="btn btn-primary">
                                Send Reminders
                            </button>
                        </div>
                    </div>
                    
                    <div class="queue-table-container">
                        <table class="approval-table">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" id="select-all-approvals"></th>
                                    <th>Employee</th>
                                    <th>Current Salary</th>
                                    <th>Proposed Raise</th>
                                    <th>New Salary</th>
                                    <th>Threshold Exceeded</th>
                                    <th>Urgency</th>
                                    <th>Submitted</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="approval-queue-tbody">
                                <!-- Approval queue items will be populated here -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="approval-history" style="display: none;">
                    <h3>Approval History</h3>
                    <div class="history-controls">
                        <button id="show-history" class="btn btn-outline">
                            Show History
                        </button>
                        <button id="export-history" class="btn btn-secondary">
                            Export History
                        </button>
                    </div>
                    <div id="history-content" class="history-content">
                        <!-- History will be populated here -->
                    </div>
                </div>
                
                <div class="approval-detail-modal" id="approval-modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Approval Review</h3>
                            <button class="modal-close" id="close-approval-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div id="approval-detail-content">
                                <!-- Detailed approval content will be populated here -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button id="approve-raise" class="btn btn-success">Approve Raise</button>
                            <button id="reject-raise" class="btn btn-danger">Reject Raise</button>
                            <button id="request-revision" class="btn btn-warning">Request Revision</button>
                            <button id="escalate-approval" class="btn btn-primary">Escalate</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        // Filter controls
        ['status-filter', 'country-filter', 'urgency-filter'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.applyFilters();
            });
        });
        
        // Queue management
        document.getElementById('refresh-queue').addEventListener('click', () => {
            this.refreshApprovalQueue();
        });
        
        document.getElementById('bulk-approve').addEventListener('click', () => {
            this.bulkApproveSelected();
        });
        
        // Export and communication
        document.getElementById('export-queue').addEventListener('click', () => {
            this.exportApprovalQueue();
        });
        
        document.getElementById('send-reminders').addEventListener('click', () => {
            this.sendApprovalReminders();
        });
        
        // History
        document.getElementById('show-history').addEventListener('click', () => {
            this.toggleApprovalHistory();
        });
        
        document.getElementById('export-history').addEventListener('click', () => {
            this.exportApprovalHistory();
        });
        
        // Select all
        document.getElementById('select-all-approvals').addEventListener('change', (e) => {
            this.toggleSelectAllApprovals(e.target.checked);
        });
        
        // Modal controls
        document.getElementById('close-approval-modal').addEventListener('click', () => {
            this.closeApprovalModal();
        });
        
        document.getElementById('approve-raise').addEventListener('click', () => {
            this.approveCurrentRaise();
        });
        
        document.getElementById('reject-raise').addEventListener('click', () => {
            this.rejectCurrentRaise();
        });
        
        document.getElementById('request-revision').addEventListener('click', () => {
            this.requestRevision();
        });
        
        document.getElementById('escalate-approval').addEventListener('click', () => {
            this.escalateApproval();
        });
    }
    
    setEmployees(employees) {
        this.employees = employees;
        this.generateApprovalQueue();
        console.log(`Approval workflow loaded ${employees.length} employees`);
    }
    
    generateApprovalQueue() {
        this.approvalQueue = [];
        
        this.employees.forEach(employee => {
            // Check if employee has a proposed raise that requires approval
            if (employee.proposedRaise && employee.proposedRaise > 0) {
                const validation = validateRaise(employee, employee.proposedRaise);
                
                if (validation.requiresApproval) {
                    const approvalItem = this.createApprovalItem(employee, validation);
                    this.approvalQueue.push(approvalItem);
                }
            }
        });
        
        // Sort by urgency and submission date
        this.approvalQueue.sort((a, b) => {
            const urgencyOrder = { high: 3, medium: 2, low: 1 };
            if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
            }
            return new Date(a.submittedDate) - new Date(b.submittedDate);
        });
        
        this.updateApprovalDisplay();
    }
    
    createApprovalItem(employee, validation) {
        const country = employee.country || 'US';
        const constraints = COUNTRY_CONSTRAINTS[country] || COUNTRY_CONSTRAINTS['US'];
        const raisePercent = employee.proposedRaise * 100;
        const thresholdPercent = constraints.vpApprovalThreshold * 100;
        
        // Calculate urgency based on various factors
        let urgency = 'medium';
        if (raisePercent > thresholdPercent * 1.5) urgency = 'high';
        if (employee.riskIndicators && employee.riskIndicators.includes('flight_risk')) urgency = 'high';
        if (raisePercent < thresholdPercent * 1.2) urgency = 'low';
        
        return {
            id: `approval_${employee.id || employee.name.replace(/\s+/g, '_')}_${Date.now()}`,
            employee,
            proposedRaise: employee.proposedRaise,
            validation,
            constraints,
            thresholdExceeded: raisePercent - thresholdPercent,
            urgency,
            status: 'pending',
            submittedDate: new Date().toISOString(),
            submittedBy: 'Manager', // This would come from the current user
            approver: null,
            approvalDate: null,
            comments: [],
            selected: false
        };
    }
    
    updateApprovalDisplay() {
        this.updateSummaryCards();
        this.updateApprovalTable();
    }
    
    updateSummaryCards() {
        const pending = this.approvalQueue.filter(item => item.status === 'pending').length;
        const urgent = this.approvalQueue.filter(item => item.urgency === 'high' && item.status === 'pending').length;
        const approvedToday = this.approvalHistory.filter(item => 
            item.status === 'approved' && 
            new Date(item.approvalDate).toDateString() === new Date().toDateString()
        ).length;
        const revision = this.approvalQueue.filter(item => item.status === 'revision').length;
        
        document.getElementById('pending-count').textContent = pending;
        document.getElementById('urgent-count').textContent = urgent;
        document.getElementById('approved-today').textContent = approvedToday;
        document.getElementById('revision-count').textContent = revision;
    }
    
    updateApprovalTable() {
        const tbody = document.getElementById('approval-queue-tbody');
        const filtered = this.getFilteredApprovals();
        
        tbody.innerHTML = filtered.map(item => `
            <tr class="approval-row ${item.urgency}-urgency ${item.status}">
                <td>
                    <input type="checkbox" class="approval-checkbox" data-id="${item.id}" ${item.selected ? 'checked' : ''}>
                </td>
                <td>
                    <div class="employee-info">
                        <strong>${item.employee.name}</strong>
                        <small>${item.employee.title || 'N/A'}</small>
                        <small>${item.employee.country || 'N/A'}</small>
                    </div>
                </td>
                <td>${this.formatCurrency(item.employee.currentSalary)}</td>
                <td>
                    <div class="raise-info">
                        <strong>${(item.proposedRaise * 100).toFixed(1)}%</strong>
                        <small>${this.formatCurrency(item.employee.currentSalary * item.proposedRaise)}</small>
                    </div>
                </td>
                <td>${this.formatCurrency(item.employee.currentSalary * (1 + item.proposedRaise))}</td>
                <td>
                    <span class="threshold-exceeded ${item.urgency}">
                        +${item.thresholdExceeded.toFixed(1)}%
                    </span>
                </td>
                <td>
                    <span class="urgency-badge ${item.urgency}">
                        ${item.urgency.toUpperCase()}
                    </span>
                </td>
                <td>
                    <div class="date-info">
                        <span>${new Date(item.submittedDate).toLocaleDateString()}</span>
                        <small>by ${item.submittedBy}</small>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${item.status}">
                        ${this.getStatusText(item.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline review-approval" data-id="${item.id}">
                            Review
                        </button>
                        ${item.status === 'pending' ? `
                            <button class="btn btn-sm btn-success quick-approve" data-id="${item.id}">
                                Quick Approve
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Attach event listeners
        tbody.querySelectorAll('.review-approval').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                this.showApprovalDetail(itemId);
            });
        });
        
        tbody.querySelectorAll('.quick-approve').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                this.quickApprove(itemId);
            });
        });
        
        tbody.querySelectorAll('.approval-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const itemId = e.target.dataset.id;
                const item = this.approvalQueue.find(item => item.id === itemId);
                if (item) item.selected = e.target.checked;
            });
        });
    }
    
    getFilteredApprovals() {
        return this.approvalQueue.filter(item => {
            if (this.filters.status !== 'all' && item.status !== this.filters.status) {
                return false;
            }
            if (this.filters.country !== 'all' && item.employee.country !== this.filters.country) {
                return false;
            }
            if (this.filters.urgency !== 'all' && item.urgency !== this.filters.urgency) {
                return false;
            }
            return true;
        });
    }
    
    applyFilters() {
        this.filters.status = document.getElementById('status-filter').value;
        this.filters.country = document.getElementById('country-filter').value;
        this.filters.urgency = document.getElementById('urgency-filter').value;
        
        this.updateApprovalTable();
    }
    
    showApprovalDetail(itemId) {
        const item = this.approvalQueue.find(item => item.id === itemId);
        if (!item) return;
        
        this.currentApproval = item;
        const modal = document.getElementById('approval-modal');
        const content = document.getElementById('approval-detail-content');
        
        const raiseAmount = item.employee.currentSalary * item.proposedRaise;
        const newSalary = item.employee.currentSalary + raiseAmount;
        
        content.innerHTML = `
            <div class="approval-detail">
                <div class="detail-header">
                    <h4>${item.employee.name}</h4>
                    <p>${item.employee.title || 'N/A'} • ${item.employee.country || 'N/A'}</p>
                    <span class="urgency-badge ${item.urgency}">${item.urgency.toUpperCase()} PRIORITY</span>
                </div>
                
                <div class="approval-sections">
                    <div class="approval-section">
                        <h5>Raise Details</h5>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Current Salary:</label>
                                <span>${this.formatCurrency(item.employee.currentSalary)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Proposed Raise:</label>
                                <span>${(item.proposedRaise * 100).toFixed(1)}%</span>
                            </div>
                            <div class="detail-item">
                                <label>Raise Amount:</label>
                                <span>${this.formatCurrency(raiseAmount)}</span>
                            </div>
                            <div class="detail-item">
                                <label>New Salary:</label>
                                <span>${this.formatCurrency(newSalary)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="approval-section">
                        <h5>Approval Requirements</h5>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Country Threshold:</label>
                                <span>${(item.constraints.vpApprovalThreshold * 100).toFixed(1)}%</span>
                            </div>
                            <div class="detail-item">
                                <label>Threshold Exceeded By:</label>
                                <span class="threshold-exceeded ${item.urgency}">
                                    +${item.thresholdExceeded.toFixed(1)}%
                                </span>
                            </div>
                            <div class="detail-item">
                                <label>Maximum Allowed:</label>
                                <span>${(item.constraints.maxRaise * 100).toFixed(1)}%</span>
                            </div>
                            <div class="detail-item">
                                <label>Within Limits:</label>
                                <span class="${item.validation.isValid ? 'valid' : 'invalid'}">
                                    ${item.validation.isValid ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="approval-section">
                        <h5>Employee Information</h5>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Performance Rating:</label>
                                <span class="performance-badge performance-${item.employee.performance}">
                                    ${item.employee.performance}/5
                                </span>
                            </div>
                            <div class="detail-item">
                                <label>Tenure:</label>
                                <span>${item.employee.tenure || 'N/A'} years</span>
                            </div>
                            <div class="detail-item">
                                <label>Market Position:</label>
                                <span>${item.employee.comparatio ? (item.employee.comparatio * 100).toFixed(0) + '%' : 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Risk Factors:</label>
                                <span>
                                    ${item.employee.riskIndicators && item.employee.riskIndicators.length > 0 
                                        ? item.employee.riskIndicators.join(', ')
                                        : 'None identified'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="approval-section">
                        <h5>Justification</h5>
                        <div class="justification-content">
                            ${item.employee.raiseJustification || 'No specific justification provided.'}
                        </div>
                    </div>
                    
                    ${item.validation.warnings.length > 0 || item.validation.errors.length > 0 ? `
                        <div class="approval-section">
                            <h5>Validation Issues</h5>
                            ${item.validation.errors.map(error => 
                                `<div class="validation-error">⚠️ ${error}</div>`
                            ).join('')}
                            ${item.validation.warnings.map(warning => 
                                `<div class="validation-warning">⚡ ${warning}</div>`
                            ).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="approval-section">
                        <h5>Approval Comments</h5>
                        <div class="comments-section">
                            <textarea id="approval-comments" placeholder="Add comments for this approval decision..." rows="3"></textarea>
                        </div>
                        ${item.comments.length > 0 ? `
                            <div class="previous-comments">
                                <h6>Previous Comments:</h6>
                                ${item.comments.map(comment => `
                                    <div class="comment">
                                        <strong>${comment.author}</strong> - ${new Date(comment.date).toLocaleString()}
                                        <p>${comment.text}</p>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }
    
    closeApprovalModal() {
        document.getElementById('approval-modal').style.display = 'none';
        this.currentApproval = null;
    }
    
    approveCurrentRaise() {
        if (!this.currentApproval) return;
        
        const comments = document.getElementById('approval-comments').value;
        this.processApproval(this.currentApproval, 'approved', comments);
        this.closeApprovalModal();
    }
    
    rejectCurrentRaise() {
        if (!this.currentApproval) return;
        
        const comments = document.getElementById('approval-comments').value;
        if (!comments.trim()) {
            this.showNotification('Please provide comments for rejection', 'warning');
            return;
        }
        
        this.processApproval(this.currentApproval, 'rejected', comments);
        this.closeApprovalModal();
    }
    
    requestRevision() {
        if (!this.currentApproval) return;
        
        const comments = document.getElementById('approval-comments').value;
        if (!comments.trim()) {
            this.showNotification('Please provide specific revision requests', 'warning');
            return;
        }
        
        this.processApproval(this.currentApproval, 'revision', comments);
        this.closeApprovalModal();
    }
    
    escalateApproval() {
        if (!this.currentApproval) return;
        
        const comments = document.getElementById('approval-comments').value;
        this.processApproval(this.currentApproval, 'escalated', comments);
        this.closeApprovalModal();
    }
    
    processApproval(item, status, comments) {
        item.status = status;
        item.approver = 'Current User'; // This would be the logged-in user
        item.approvalDate = new Date().toISOString();
        
        if (comments) {
            item.comments.push({
                author: 'Current User',
                date: new Date().toISOString(),
                text: comments,
                action: status
            });
        }
        
        // Move to history if final status
        if (['approved', 'rejected'].includes(status)) {
            this.approvalHistory.push({...item});
            this.approvalQueue = this.approvalQueue.filter(queueItem => queueItem.id !== item.id);
        }
        
        this.updateApprovalDisplay();
        this.showNotification(`Raise ${status} for ${item.employee.name}`, 'success');
        
        // Emit event for main app
        if (window.app && window.app.onApprovalProcessed) {
            window.app.onApprovalProcessed(item, status);
        }
    }
    
    quickApprove(itemId) {
        const item = this.approvalQueue.find(item => item.id === itemId);
        if (!item) return;
        
        this.processApproval(item, 'approved', 'Quick approval');
    }
    
    bulkApproveSelected() {
        const selected = this.approvalQueue.filter(item => item.selected && item.status === 'pending');
        if (selected.length === 0) {
            this.showNotification('No pending approvals selected', 'warning');
            return;
        }
        
        selected.forEach(item => {
            this.processApproval(item, 'approved', 'Bulk approval');
        });
        
        this.showNotification(`Bulk approved ${selected.length} raises`, 'success');
    }
    
    toggleSelectAllApprovals(checked) {
        const filtered = this.getFilteredApprovals();
        filtered.forEach(item => item.selected = checked);
        this.updateApprovalTable();
    }
    
    refreshApprovalQueue() {
        this.generateApprovalQueue();
        this.showNotification('Approval queue refreshed', 'info');
    }
    
    sendApprovalReminders() {
        const pending = this.approvalQueue.filter(item => item.status === 'pending');
        if (pending.length === 0) {
            this.showNotification('No pending approvals to remind about', 'info');
            return;
        }
        
        // This would integrate with email/notification system
        this.showNotification(`Sent reminders for ${pending.length} pending approvals`, 'success');
    }
    
    toggleApprovalHistory() {
        const historySection = document.querySelector('.approval-history');
        const button = document.getElementById('show-history');
        
        if (historySection.style.display === 'none') {
            this.displayApprovalHistory();
            historySection.style.display = 'block';
            button.textContent = 'Hide History';
        } else {
            historySection.style.display = 'none';
            button.textContent = 'Show History';
        }
    }
    
    displayApprovalHistory() {
        const content = document.getElementById('history-content');
        
        if (this.approvalHistory.length === 0) {
            content.innerHTML = '<p>No approval history available.</p>';
            return;
        }
        
        content.innerHTML = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Raise</th>
                        <th>Status</th>
                        <th>Approver</th>
                        <th>Date</th>
                        <th>Comments</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.approvalHistory.map(item => `
                        <tr class="${item.status}">
                            <td>${item.employee.name}</td>
                            <td>${(item.proposedRaise * 100).toFixed(1)}%</td>
                            <td>
                                <span class="status-badge ${item.status}">
                                    ${this.getStatusText(item.status)}
                                </span>
                            </td>
                            <td>${item.approver}</td>
                            <td>${new Date(item.approvalDate).toLocaleDateString()}</td>
                            <td>
                                ${item.comments.length > 0 
                                    ? item.comments[item.comments.length - 1].text.substring(0, 50) + '...'
                                    : 'No comments'
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    exportApprovalQueue() {
        const headers = [
            'Employee Name', 'Title', 'Country', 'Current Salary',
            'Proposed Raise %', 'Raise Amount', 'New Salary',
            'Threshold Exceeded', 'Urgency', 'Status',
            'Submitted Date', 'Submitted By'
        ];
        
        const rows = this.approvalQueue.map(item => [
            item.employee.name,
            item.employee.title || '',
            item.employee.country || '',
            item.employee.currentSalary,
            (item.proposedRaise * 100).toFixed(2),
            (item.employee.currentSalary * item.proposedRaise).toFixed(2),
            (item.employee.currentSalary * (1 + item.proposedRaise)).toFixed(2),
            item.thresholdExceeded.toFixed(1),
            item.urgency,
            item.status,
            new Date(item.submittedDate).toLocaleDateString(),
            item.submittedBy
        ]);
        
        this.exportToCsv(headers, rows, 'approval-queue');
    }
    
    exportApprovalHistory() {
        if (this.approvalHistory.length === 0) {
            this.showNotification('No approval history to export', 'warning');
            return;
        }
        
        const headers = [
            'Employee Name', 'Title', 'Country', 'Proposed Raise %',
            'Status', 'Approver', 'Approval Date', 'Comments'
        ];
        
        const rows = this.approvalHistory.map(item => [
            item.employee.name,
            item.employee.title || '',
            item.employee.country || '',
            (item.proposedRaise * 100).toFixed(2),
            item.status,
            item.approver,
            new Date(item.approvalDate).toLocaleDateString(),
            item.comments.map(c => c.text).join('; ')
        ]);
        
        this.exportToCsv(headers, rows, 'approval-history');
    }
    
    exportToCsv(headers, rows, filename) {
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification(`${filename} exported successfully`, 'success');
    }
    
    getStatusText(status) {
        const statusTexts = {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
            revision: 'Needs Revision',
            escalated: 'Escalated'
        };
        return statusTexts[status] || status;
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
    module.exports = ApprovalWorkflow;
} else {
    window.ApprovalWorkflow = ApprovalWorkflow;
} 