/**
 * Performance Rating Suggester Component
 * Provides interface for viewing and editing performance rating suggestions
 */

class PerformanceSuggesterComponent {
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
                        <h4>${current.employee.name}</h4>
                        <div class="employee-details">
                            <span class="detail-item">
                                <strong>Title:</strong> ${current.employee.title || 'N/A'}
                            </span>
                            <span class="detail-item">
                                <strong>Salary:</strong> ${this.formatSalary(current.employee.salary)}
                            </span>
                            <span class="detail-item">
                                <strong>Tenure:</strong> ${current.employee.tenure || 'N/A'} years
                            </span>
                        </div>
                    </div>

                    <div class="suggestion-content">
                        <div class="suggestion-header">
                            <div class="suggested-rating">
                                <label>Suggested Rating:</label>
                                <div class="rating-display ${this.getRatingClass(current.suggestedRating)}">
                                    ${current.suggestedRating}
                                </div>
                            </div>
                            <div class="confidence-score">
                                <label>Confidence:</label>
                                <div class="confidence-bar">
                                    <div class="confidence-fill" style="width: ${current.confidence}%"></div>
                                    <span class="confidence-text">${current.confidence}%</span>
                                </div>
                            </div>
                        </div>

                        <div class="reasoning-section">
                            <label>Reasoning:</label>
                            <div class="reasoning-text">${current.reasoning}</div>
                        </div>

                        <div class="factors-section">
                            <label>Analysis Factors:</label>
                            <div class="factors-grid">
                                ${current.factors.map(factor => `
                                    <div class="factor-item">
                                        <span class="factor-name">${factor.name}:</span>
                                        <span class="factor-value">${factor.value}</span>
                                        <span class="factor-impact ${factor.impact}">${factor.impact}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="rating-editor">
                            <label for="custom-rating">Edit Rating:</label>
                            <select id="custom-rating" class="rating-select">
                                <option value="">Select Rating</option>
                                <option value="1" ${current.suggestedRating === '1' ? 'selected' : ''}>1 - Poor</option>
                                <option value="2" ${current.suggestedRating === '2' ? 'selected' : ''}>2 - Below Average</option>
                                <option value="3" ${current.suggestedRating === '3' ? 'selected' : ''}>3 - Average</option>
                                <option value="4" ${current.suggestedRating === '4' ? 'selected' : ''}>4 - Above Average</option>
                                <option value="5" ${current.suggestedRating === '5' ? 'selected' : ''}>5 - Excellent</option>
                            </select>
                        </div>
                    </div>

                    <div class="suggestion-actions">
                        <button class="btn btn-secondary" id="skip-suggestion">
                            Skip
                        </button>
                        <button class="btn btn-primary" id="apply-suggestion">
                            Apply Rating
                        </button>
                        <button class="btn btn-success" id="apply-all-remaining">
                            Apply All Remaining
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
                        Enter = Apply • Space = Skip • ← → = Navigate • Esc = Close
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

        // Rating selection change
        const ratingSelect = this.container.querySelector('#custom-rating');
        if (ratingSelect) {
            ratingSelect.addEventListener('change', (e) => {
                const current = this.suggestions[this.currentIndex];
                if (current) {
                    current.customRating = e.target.value;
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

        const ratingSelect = this.container.querySelector('#custom-rating');
        const finalRating = ratingSelect ? ratingSelect.value : current.suggestedRating;

        if (!finalRating) {
            this.showNotification('Please select a rating', 'warning');
            return;
        }

        // Apply the rating to the employee
        current.employee.performanceRating = finalRating;
        current.applied = true;
        current.appliedRating = finalRating;

        // Callback
        if (this.onSuggestionApplied) {
            this.onSuggestionApplied(current, finalRating);
        }

        this.showNotification(`Applied rating ${finalRating} to ${current.employee.name}`, 'success');
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

        this.showNotification(`Skipped suggestion for ${current.employee.name}`, 'info');
        this.moveToNext();
    }

    /**
     * Apply all remaining suggestions
     */
    applyAllRemaining() {
        if (!confirm('Apply suggested ratings to all remaining employees?')) {
            return;
        }

        let appliedCount = 0;
        for (let i = this.currentIndex; i < this.suggestions.length; i++) {
            const suggestion = this.suggestions[i];
            if (!suggestion.applied && !suggestion.skipped) {
                suggestion.employee.performanceRating = suggestion.suggestedRating;
                suggestion.applied = true;
                suggestion.appliedRating = suggestion.suggestedRating;
                appliedCount++;

                if (this.onSuggestionApplied) {
                    this.onSuggestionApplied(suggestion, suggestion.suggestedRating);
                }
            }
        }

        this.showNotification(`Applied ${appliedCount} performance ratings`, 'success');
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
                <h3>Performance Suggestions Complete</h3>
                <p>All performance rating suggestions have been processed.</p>
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
     * @param {number} salary - Salary amount
     * @returns {string} Formatted salary
     */
    formatSalary(salary) {
        if (!salary) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(salary);
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
window.PerformanceSuggesterComponent = PerformanceSuggesterComponent;
