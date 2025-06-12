/**
 * Salary Raise Suggester Component
 * Provides interface for viewing and applying salary raise suggestions
 * based on performance, comparatio, and market positioning
 */

class SalaryRaiseSuggesterComponent {
    constructor() {
        this.container = null;
        this.suggestions = [];
        this.currentIndex = 0;
        this.onSuggestionApplied = null;
        this.onSuggestionSkipped = null;
        this.onAllCompleted = null;
    }

    /**
     * Initialize the performance suggester interface
     * @param {HTMLElement} container - Container element
     * @param {Array} suggestions - Array of performance suggestions
     * @param {Object} callbacks - Callback functions
     */
    init(container, suggestions, callbacks = {}) {
        this.container = container;
        this.suggestions = suggestions || [];
        this.currentIndex = 0;
        this.onSuggestionApplied = callbacks.onApplied;
        this.onSuggestionSkipped = callbacks.onSkipped;
        this.onAllCompleted = callbacks.onCompleted;

        this.render();
        this.attachEventListeners();
    }

    /**
     * Render the performance suggester interface
     */
    render() {
        if (!this.container || this.suggestions.length === 0) {
            this.container.innerHTML = `
                <div class="performance-suggester-empty">
                    <div class="empty-icon">📊</div>
                    <h3>No Performance Suggestions</h3>
                    <p>All employees have performance ratings or no suggestions are available.</p>
                </div>
            `;
            return;
        }

        const current = this.suggestions[this.currentIndex];
        const progress = ((this.currentIndex + 1) / this.suggestions.length) * 100;

        this.container.innerHTML = `
            <div class="performance-suggester">
                <div class="suggester-header">
                    <h3>Performance Rating Suggestions</h3>
                    <div class="progress-info">
                        <span class="progress-text">${this.currentIndex + 1} of ${this.suggestions.length}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>

                <div class="suggestion-card">
                    <div class="employee-info">
                        <h4>${current.employeeName || current.employee?.name || 'Unknown Employee'}</h4>
                        <div class="employee-details">
                            <span class="detail-item">
                                <strong>ID:</strong> ${current.employeeId || current.employee?.id || 'N/A'}
                            </span>
                            <span class="detail-item">
                                <strong>Title:</strong> ${current.employee?.title || 'N/A'}
                            </span>
                            <span class="detail-item">
                                <strong>Salary:</strong> ${this.formatSalary(current.employee?.salary)}
                            </span>
                            <span class="detail-item">
                                <strong>Tenure:</strong> ${current.employee?.tenure || current.factors?.tenure?.timeInRole || 'N/A'} ${current.factors?.tenure?.timeInRole ? 'months' : 'years'}
                            </span>
                        </div>
                    </div>

                    <div class="suggestion-content">
                        <div class="suggestion-header">
                            <div class="salary-raise-info">
                                <div class="current-salary">
                                    <label>Current Salary:</label>
                                    <div class="salary-display">
                                        ${this.formatSalary(current.employee?.salary)}
                                    </div>
                                </div>
                                <div class="raise-arrow">→</div>
                                <div class="suggested-raise">
                                    <label>Suggested Raise:</label>
                                    <div class="raise-display">
                                        ${this.formatRaise(current.suggestedRaise)}
                                    </div>
                                </div>
                            </div>
                            <div class="confidence-score">
                                <label>Confidence:</label>
                                <div class="confidence-bar">
                                    <div class="confidence-fill" style="width: ${current.confidence || 0}%"></div>
                                    <span class="confidence-text">${current.confidence || 0}%</span>
                                </div>
                            </div>
                        </div>

                        <div class="reasoning-section">
                            <label>Reasoning:</label>
                            <div class="reasoning-text">${current.reasoning || 'No reasoning provided'}</div>
                        </div>

                        <div class="factors-section">
                            <label>Analysis Factors:</label>
                            <div class="factors-grid">
                                ${this.renderFactors(current.factors)}
                            </div>
                        </div>

                        <div class="raise-editor">
                            <label for="custom-raise">Edit Raise Amount:</label>
                            <input type="number" id="custom-raise" class="raise-input" 
                                   value="${current.suggestedRaise?.rawAmount || ''}" 
                                   placeholder="Enter raise amount" 
                                   min="0" 
                                   step="100">
                            <small>Amount will be added to current salary</small>
                        </div>
                    </div>

                    <div class="suggestion-actions">
                        <button class="btn btn-secondary" id="skip-suggestion">
                            Skip
                        </button>
                        <button class="btn btn-primary" id="apply-suggestion">
                            Apply Raise
                        </button>
                        <button class="btn btn-success" id="apply-all-remaining">
                            Apply All Raises
                        </button>
                    </div>
                </div>

                <div class="navigation-controls">
                    <button class="btn btn-outline" id="prev-suggestion" ${this.currentIndex === 0 ? 'disabled' : ''}>
                        ← Previous
                    </button>
                    <button class="btn btn-outline" id="next-suggestion" ${this.currentIndex === this.suggestions.length - 1 ? 'disabled' : ''}>
                        Next →
                    </button>
                </div>

                <div class="keyboard-hints">
                    <small>
                        <strong>Keyboard shortcuts:</strong>
                        Enter = Apply Raise • Space = Skip • ← → = Navigate • Esc = Close
                    </small>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (!this.container) return;

        // Apply suggestion
        const applyBtn = this.container.querySelector('#apply-suggestion');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applySuggestion());
        }

        // Skip suggestion
        const skipBtn = this.container.querySelector('#skip-suggestion');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipSuggestion());
        }

        // Apply all remaining
        const applyAllBtn = this.container.querySelector('#apply-all-remaining');
        if (applyAllBtn) {
            applyAllBtn.addEventListener('click', () => this.applyAllRemaining());
        }

        // Navigation
        const prevBtn = this.container.querySelector('#prev-suggestion');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigatePrevious());
        }

        const nextBtn = this.container.querySelector('#next-suggestion');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateNext());
        }

        // Raise amount change
        const raiseInput = this.container.querySelector('#custom-raise');
        if (raiseInput) {
            raiseInput.addEventListener('input', (e) => {
                const current = this.suggestions[this.currentIndex];
                if (current) {
                    current.customRaise = parseFloat(e.target.value) || 0;
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeydown(e) {
        if (!this.container || this.suggestions.length === 0) return;

        // Only handle if suggester is visible
        if (!this.container.querySelector('.performance-suggester')) return;

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.applySuggestion();
                break;
            case ' ':
                e.preventDefault();
                this.skipSuggestion();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.navigatePrevious();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.navigateNext();
                break;
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    }

    /**
     * Apply the current suggestion
     */
    applySuggestion() {
        const current = this.suggestions[this.currentIndex];
        if (!current) return;

        const raiseInput = this.container.querySelector('#custom-raise');
        const finalRaise = raiseInput ? parseFloat(raiseInput.value) : current.suggestedRaise?.rawAmount;

        if (!finalRaise || finalRaise <= 0) {
            this.showNotification('Please enter a valid raise amount', 'warning');
            return;
        }

        // Apply the raise to the employee
        if (current.employee && current.employee.salary) {
            const newSalary = current.employee.salary.amount + finalRaise;
            current.employee.salary = {
                ...current.employee.salary,
                amount: newSalary,
                formatted: new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: current.employee.salary.currency || 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(newSalary)
            };
        }
        current.applied = true;
        current.appliedRaise = finalRaise;

        // Callback
        if (this.onSuggestionApplied) {
            this.onSuggestionApplied(current, finalRaise);
        }

        const employeeName = current.employeeName || current.employee?.name || 'Employee';
        const raiseFormatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: current.employee?.salary?.currency || 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(finalRaise);
        this.showNotification(`Applied ${raiseFormatted} raise to ${employeeName}`, 'success');
        this.moveToNext();
    }

    /**
     * Skip the current suggestion
     */
    skipSuggestion() {
        const current = this.suggestions[this.currentIndex];
        if (!current) return;

        current.skipped = true;

        // Callback
        if (this.onSuggestionSkipped) {
            this.onSuggestionSkipped(current);
        }

        const employeeName = current.employeeName || current.employee?.name || 'Employee';
        this.showNotification(`Skipped suggestion for ${employeeName}`, 'info');
        this.moveToNext();
    }

    /**
     * Apply all remaining suggestions
     */
    applyAllRemaining() {
        if (!confirm('Apply suggested raises to all remaining employees?')) {
            return;
        }

        let appliedCount = 0;
        for (let i = this.currentIndex; i < this.suggestions.length; i++) {
            const suggestion = this.suggestions[i];
            if (!suggestion.applied && !suggestion.skipped && suggestion.suggestedRaise?.rawAmount) {
                const raiseAmount = suggestion.suggestedRaise.rawAmount;
                if (suggestion.employee && suggestion.employee.salary) {
                    const newSalary = suggestion.employee.salary.amount + raiseAmount;
                    suggestion.employee.salary = {
                        ...suggestion.employee.salary,
                        amount: newSalary,
                        formatted: new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: suggestion.employee.salary.currency || 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(newSalary)
                    };
                }
                suggestion.applied = true;
                suggestion.appliedRaise = raiseAmount;
                appliedCount++;

                if (this.onSuggestionApplied) {
                    this.onSuggestionApplied(suggestion, raiseAmount);
                }
            }
        }

        this.showNotification(`Applied ${appliedCount} salary raises`, 'success');
        this.complete();
    }

    /**
     * Navigate to previous suggestion
     */
    navigatePrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.render();
            this.attachEventListeners();
        }
    }

    /**
     * Navigate to next suggestion
     */
    navigateNext() {
        if (this.currentIndex < this.suggestions.length - 1) {
            this.currentIndex++;
            this.render();
            this.attachEventListeners();
        }
    }

    /**
     * Move to next suggestion or complete
     */
    moveToNext() {
        if (this.currentIndex < this.suggestions.length - 1) {
            this.currentIndex++;
            this.render();
            this.attachEventListeners();
        } else {
            this.complete();
        }
    }

    /**
     * Complete the suggestion process
     */
    complete() {
        if (this.onAllCompleted) {
            this.onAllCompleted();
        }

        this.container.innerHTML = `
            <div class="performance-suggester-complete">
                <div class="complete-icon">✅</div>
                <h3>Salary Raise Suggestions Complete</h3>
                <p>All salary raise suggestions have been processed.</p>
                <button class="btn btn-primary" onclick="this.parentElement.style.display='none'">
                    Close
                </button>
            </div>
        `;
    }

    /**
     * Close the suggester
     */
    close() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * Render factors section
     * @param {Object} factors - Factors object
     * @returns {string} HTML for factors
     */
    renderFactors(factors) {
        if (!factors || typeof factors !== 'object') {
            return '<div class="factor-item">No analysis factors available</div>';
        }

        const factorEntries = Object.entries(factors);
        if (factorEntries.length === 0) {
            return '<div class="factor-item">No analysis factors available</div>';
        }

        return factorEntries.map(([key, factor]) => {
            if (!factor || typeof factor !== 'object') return '';
            
            const score = factor.score || 0;
            const reason = factor.reason || 'No reason provided';
            const weight = factor.weight || 0;
            
            let impact = 'neutral';
            if (score >= 4) impact = 'positive';
            else if (score <= 2) impact = 'negative';
            
            // Enhanced display for salary factor to highlight the targeted comparison
            let enhancedReason = reason;
            if (key === 'salary' && factor.comparisonGroup) {
                const confidenceIndicator = factor.sampleSize >= 3 ? 
                    '<span class="high-confidence">📊 High Confidence</span>' : 
                    factor.sampleSize >= 2 ? 
                    '<span class="medium-confidence">📈 Medium Confidence</span>' : 
                    '<span class="low-confidence">⚠️ Low Confidence</span>';
                
                enhancedReason = `${reason} ${confidenceIndicator}`;
            }
            
            return `
                <div class="factor-item">
                    <div class="factor-header">
                        <span class="factor-name">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <span class="factor-score ${impact}">Score: ${score.toFixed(1)}</span>
                    </div>
                    <div class="factor-description">${enhancedReason}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get CSS class for rating
     * @param {string} rating - Performance rating
     * @returns {string} CSS class
     */
    getRatingClass(rating) {
        const ratingNum = parseInt(rating);
        if (ratingNum >= 5) return 'rating-excellent';
        if (ratingNum >= 4) return 'rating-good';
        if (ratingNum >= 3) return 'rating-average';
        if (ratingNum >= 2) return 'rating-below';
        return 'rating-poor';
    }

    /**
     * Format salary for display
     * @param {Object|number} salary - Salary object or amount
     * @returns {string} Formatted salary
     */
    formatSalary(salary) {
        if (!salary) return 'N/A';
        
        // If salary is an object with formatted property, use that
        if (typeof salary === 'object' && salary.formatted) {
            return salary.formatted;
        }
        
        // If salary is an object with amount and currency, format accordingly
        if (typeof salary === 'object' && salary.amount !== undefined) {
            const amount = salary.amount;
            const currency = salary.currency || 'USD';
            
            if (isNaN(amount)) return 'N/A';
            
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        }
        
        // If salary is a simple number
        if (typeof salary === 'number') {
            if (isNaN(salary)) return 'N/A';
            
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(salary);
        }
        
        return 'N/A';
    }

    /**
     * Format raise amount for display
     * @param {Object|number} raise - Raise object or amount
     * @returns {string} Formatted raise
     */
    formatRaise(raise) {
        if (!raise) return 'N/A';
        
        // If raise is an object with formatted property, use that
        if (typeof raise === 'object' && raise.formatted) {
            return raise.formatted;
        }
        
        // If raise is an object with amount and percentage
        if (typeof raise === 'object' && raise.amount !== undefined) {
            const percentage = raise.percentage ? ` (${raise.percentage})` : '';
            return `${raise.amount}${percentage}`;
        }
        
        // If raise is an object with rawAmount
        if (typeof raise === 'object' && raise.rawAmount !== undefined) {
            const amount = raise.rawAmount;
            const currency = raise.currency || 'USD';
            const percentage = raise.percentage ? ` (${raise.percentage})` : '';
            
            if (isNaN(amount)) return 'N/A';
            
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
            
            return `${formatted}${percentage}`;
        }
        
        // If raise is a simple number
        if (typeof raise === 'number') {
            if (isNaN(raise)) return 'N/A';
            
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(raise);
        }
        
        return 'N/A';
    }

    /**
     * Format current performance rating for display
     * @param {Object|string|number} rating - Current performance rating
     * @returns {string} Formatted rating
     */
    formatCurrentRating(rating) {
        if (!rating) return 'No Rating';
        
        // If rating is an object with text property
        if (typeof rating === 'object' && rating.text) {
            return rating.text;
        }
        
        // If rating is an object with numeric property
        if (typeof rating === 'object' && rating.numeric) {
            return this.getPerformanceText(rating.numeric);
        }
        
        // If rating is a number
        if (typeof rating === 'number') {
            return this.getPerformanceText(rating);
        }
        
        // If rating is a string
        if (typeof rating === 'string') {
            return rating;
        }
        
        return 'No Rating';
    }

    /**
     * Get performance text from numeric rating
     * @param {number} rating - Numeric rating
     * @returns {string} Performance text
     */
    getPerformanceText(rating) {
        const numRating = parseFloat(rating);
        if (isNaN(numRating)) return 'Unknown';
        
        if (numRating >= 4.5) return 'High Impact Performer';
        if (numRating >= 3.5) return 'Successful Performer';
        if (numRating >= 2.5) return 'Evolving Performer';
        if (numRating >= 1.5) return 'Needs Improvement';
        return 'Unsatisfactory';
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        // Use the global notification system
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }

    /**
     * Update suggestions list
     * @param {Array} newSuggestions - New suggestions array
     */
    updateSuggestions(newSuggestions) {
        this.suggestions = newSuggestions || [];
        this.currentIndex = 0;
        this.render();
        this.attachEventListeners();
    }

    /**
     * Get completion statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        const applied = this.suggestions.filter(s => s.applied).length;
        const skipped = this.suggestions.filter(s => s.skipped).length;
        const remaining = this.suggestions.length - applied - skipped;

        return {
            total: this.suggestions.length,
            applied,
            skipped,
            remaining,
            completionRate: this.suggestions.length > 0 ? (applied / this.suggestions.length) * 100 : 0
        };
    }
}

// Export for use in other modules
window.SalaryRaiseSuggesterComponent = SalaryRaiseSuggesterComponent;
// Maintain backward compatibility
window.PerformanceSuggesterComponent = SalaryRaiseSuggesterComponent;
