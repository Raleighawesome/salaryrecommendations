/**
 * DuplicateMerger Component
 * 
 * Provides interface for reviewing and merging duplicate employee records
 * with conflict resolution and data validation.
 */

class DuplicateMerger {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showSimilarityScore: true,
            autoMergeThreshold: 0.95,
            requireConfirmation: true,
            ...options
        };
        
        // State
        this.duplicateGroups = [];
        this.currentGroup = null;
        this.currentGroupIndex = 0;
        this.mergeDecisions = new Map();
        
        // Callbacks
        this.onMergeComplete = options.onMergeComplete || (() => {});
        this.onMergeCancel = options.onMergeCancel || (() => {});
        this.onGroupChange = options.onGroupChange || (() => {});
        
        this.init();
    }

    /**
     * Initialize the duplicate merger
     */
    init() {
        this.createMergerStructure();
        this.setupEventListeners();
    }

    /**
     * Create the merger interface DOM structure
     */
    createMergerStructure() {
        this.container.innerHTML = '';
        this.container.className = 'duplicate-merger-container';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'merger-header';
        header.innerHTML = `
            <h3>Duplicate Employee Records</h3>
            <div class="merger-progress">
                <span class="progress-text">Group 0 of 0</span>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
            <div class="merger-actions">
                <button class="merger-btn merger-btn-secondary" id="merger-skip">Skip</button>
                <button class="merger-btn merger-btn-primary" id="merger-merge">Merge Selected</button>
                <button class="merger-btn merger-btn-danger" id="merger-keep-separate">Keep Separate</button>
            </div>
        `;
        
        // Create comparison area
        const comparisonArea = document.createElement('div');
        comparisonArea.className = 'merger-comparison';
        comparisonArea.innerHTML = `
            <div class="comparison-header">
                <h4>Select the correct values for the merged record:</h4>
                <div class="similarity-score">
                    <span class="score-label">Similarity:</span>
                    <span class="score-value">0%</span>
                </div>
            </div>
            <div class="comparison-grid">
                <!-- Comparison fields will be populated here -->
            </div>
        `;
        
        // Create navigation
        const navigation = document.createElement('div');
        navigation.className = 'merger-navigation';
        navigation.innerHTML = `
            <button class="nav-btn" id="nav-prev" disabled>← Previous</button>
            <span class="nav-info">No duplicates to review</span>
            <button class="nav-btn" id="nav-next" disabled>Next →</button>
        `;
        
        // Create empty state
        const emptyState = document.createElement('div');
        emptyState.className = 'merger-empty';
        emptyState.innerHTML = `
            <div class="empty-icon">✅</div>
            <div class="empty-title">No Duplicate Records Found</div>
            <div class="empty-message">All employee records appear to be unique.</div>
        `;
        
        // Assemble merger
        this.container.appendChild(header);
        this.container.appendChild(comparisonArea);
        this.container.appendChild(navigation);
        this.container.appendChild(emptyState);
        
        // Store references
        this.header = header;
        this.comparisonArea = comparisonArea;
        this.navigation = navigation;
        this.emptyState = emptyState;
        this.progressText = header.querySelector('.progress-text');
        this.progressFill = header.querySelector('.progress-fill');
        this.similarityScore = comparisonArea.querySelector('.score-value');
        this.comparisonGrid = comparisonArea.querySelector('.comparison-grid');
        this.navInfo = navigation.querySelector('.nav-info');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Header actions
        this.container.querySelector('#merger-skip').addEventListener('click', this.skipGroup.bind(this));
        this.container.querySelector('#merger-merge').addEventListener('click', this.mergeGroup.bind(this));
        this.container.querySelector('#merger-keep-separate').addEventListener('click', this.keepSeparate.bind(this));
        
        // Navigation
        this.container.querySelector('#nav-prev').addEventListener('click', this.previousGroup.bind(this));
        this.container.querySelector('#nav-next').addEventListener('click', this.nextGroup.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    /**
     * Handle keyboard shortcuts
     * @param {Event} event - Keydown event
     */
    handleKeydown(event) {
        if (!this.container.style.display || this.container.style.display === 'none') return;
        
        switch (event.key) {
            case 'ArrowLeft':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.previousGroup();
                }
                break;
            case 'ArrowRight':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.nextGroup();
                }
                break;
            case 'Enter':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.mergeGroup();
                }
                break;
            case 'Escape':
                event.preventDefault();
                this.close();
                break;
        }
    }

    /**
     * Load duplicate groups for review
     * @param {Array} duplicateGroups - Array of duplicate group objects
     */
    loadDuplicateGroups(duplicateGroups) {
        this.duplicateGroups = duplicateGroups || [];
        this.currentGroupIndex = 0;
        this.mergeDecisions.clear();
        
        if (this.duplicateGroups.length === 0) {
            this.showEmptyState();
        } else {
            this.hideEmptyState();
            this.loadGroup(0);
        }
        
        this.updateProgress();
        this.updateNavigation();
    }

    /**
     * Load a specific duplicate group
     * @param {number} index - Group index
     */
    loadGroup(index) {
        if (index < 0 || index >= this.duplicateGroups.length) return;
        
        this.currentGroupIndex = index;
        this.currentGroup = this.duplicateGroups[index];
        
        this.renderComparison();
        this.updateProgress();
        this.updateNavigation();
        
        this.onGroupChange(this.currentGroup, index);
    }

    /**
     * Render the comparison interface for current group
     */
    renderComparison() {
        if (!this.currentGroup) return;
        
        const { employees, similarity } = this.currentGroup;
        
        // Update similarity score
        if (this.options.showSimilarityScore) {
            this.similarityScore.textContent = `${Math.round(similarity * 100)}%`;
            this.similarityScore.className = `score-value ${this.getSimilarityClass(similarity)}`;
        }
        
        // Clear previous comparison
        this.comparisonGrid.innerHTML = '';
        
        // Create field comparison rows
        const fields = [
            { key: 'name', label: 'Full Name', type: 'text' },
            { key: 'title', label: 'Job Title', type: 'text' },
            { key: 'country', label: 'Country', type: 'text' },
            { key: 'salary', label: 'Salary', type: 'currency' },
            { key: 'comparatio', label: 'Comparatio', type: 'number' },
            { key: 'performanceRating', label: 'Performance Rating', type: 'rating' },
            { key: 'futureTalent', label: 'Future Talent', type: 'boolean' }
        ];
        
        fields.forEach(field => {
            const row = this.createFieldComparisonRow(field, employees);
            this.comparisonGrid.appendChild(row);
        });
    }

    /**
     * Create a field comparison row
     * @param {Object} field - Field definition
     * @param {Array} employees - Employee records to compare
     * @returns {HTMLElement} Comparison row element
     */
    createFieldComparisonRow(field, employees) {
        const row = document.createElement('div');
        row.className = 'comparison-row';
        row.setAttribute('data-field', field.key);
        
        // Field label
        const label = document.createElement('div');
        label.className = 'field-label';
        label.textContent = field.label;
        row.appendChild(label);
        
        // Value options
        const valuesContainer = document.createElement('div');
        valuesContainer.className = 'field-values';
        
        const uniqueValues = this.getUniqueFieldValues(employees, field);
        
        uniqueValues.forEach((valueInfo, index) => {
            const option = document.createElement('label');
            option.className = 'value-option';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `field-${field.key}`;
            radio.value = JSON.stringify(valueInfo.value);
            radio.checked = index === 0; // Select first option by default
            
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'value-display';
            valueDisplay.innerHTML = this.formatFieldValue(valueInfo.value, field.type);
            
            const sourceInfo = document.createElement('span');
            sourceInfo.className = 'value-source';
            sourceInfo.textContent = `(${valueInfo.sources.join(', ')})`;
            
            option.appendChild(radio);
            option.appendChild(valueDisplay);
            option.appendChild(sourceInfo);
            
            valuesContainer.appendChild(option);
        });
        
        row.appendChild(valuesContainer);
        return row;
    }

    /**
     * Get unique values for a field across employees
     * @param {Array} employees - Employee records
     * @param {Object} field - Field definition
     * @returns {Array} Unique values with source information
     */
    getUniqueFieldValues(employees, field) {
        const valueMap = new Map();
        
        employees.forEach((employee, index) => {
            let value = this.getFieldValue(employee, field.key);
            const valueKey = JSON.stringify(value);
            
            if (!valueMap.has(valueKey)) {
                valueMap.set(valueKey, {
                    value: value,
                    sources: []
                });
            }
            
            valueMap.get(valueKey).sources.push(`Record ${index + 1}`);
        });
        
        return Array.from(valueMap.values());
    }

    /**
     * Get field value from employee record
     * @param {Object} employee - Employee record
     * @param {string} fieldKey - Field key
     * @returns {*} Field value
     */
    getFieldValue(employee, fieldKey) {
        switch (fieldKey) {
            case 'salary':
                return employee.salary?.amount || null;
            case 'performanceRating':
                return employee.performanceRating?.text || null;
            default:
                return employee[fieldKey] || null;
        }
    }

    /**
     * Format field value for display
     * @param {*} value - Field value
     * @param {string} type - Field type
     * @returns {string} Formatted value
     */
    formatFieldValue(value, type) {
        if (value === null || value === undefined) {
            return '<em>Not specified</em>';
        }
        
        switch (type) {
            case 'currency':
                return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
            case 'number':
                return typeof value === 'number' ? value.toFixed(2) : value;
            case 'boolean':
                return value ? '✓ Yes' : '✗ No';
            case 'rating':
                return value;
            default:
                return String(value);
        }
    }

    /**
     * Get similarity class for styling
     * @param {number} similarity - Similarity score (0-1)
     * @returns {string} CSS class name
     */
    getSimilarityClass(similarity) {
        if (similarity >= 0.9) return 'high';
        if (similarity >= 0.7) return 'medium';
        return 'low';
    }

    /**
     * Skip current group
     */
    skipGroup() {
        this.nextGroup();
    }

    /**
     * Merge current group with selected values
     */
    mergeGroup() {
        if (!this.currentGroup) return;
        
        const mergedRecord = this.collectMergedValues();
        
        if (this.options.requireConfirmation) {
            const confirmMessage = `Merge ${this.currentGroup.employees.length} duplicate records into one?`;
            if (!confirm(confirmMessage)) return;
        }
        
        // Store merge decision
        this.mergeDecisions.set(this.currentGroupIndex, {
            action: 'merge',
            mergedRecord: mergedRecord,
            originalRecords: this.currentGroup.employees
        });
        
        this.nextGroup();
    }

    /**
     * Keep records separate (mark as not duplicates)
     */
    keepSeparate() {
        if (!this.currentGroup) return;
        
        if (this.options.requireConfirmation) {
            const confirmMessage = `Mark these ${this.currentGroup.employees.length} records as separate (not duplicates)?`;
            if (!confirm(confirmMessage)) return;
        }
        
        // Store decision to keep separate
        this.mergeDecisions.set(this.currentGroupIndex, {
            action: 'keep_separate',
            records: this.currentGroup.employees
        });
        
        this.nextGroup();
    }

    /**
     * Collect merged values from form
     * @returns {Object} Merged employee record
     */
    collectMergedValues() {
        const mergedRecord = {};
        
        this.comparisonGrid.querySelectorAll('.comparison-row').forEach(row => {
            const fieldKey = row.getAttribute('data-field');
            const selectedRadio = row.querySelector('input[type="radio"]:checked');
            
            if (selectedRadio) {
                const value = JSON.parse(selectedRadio.value);
                
                // Handle special field types
                switch (fieldKey) {
                    case 'salary':
                        mergedRecord.salary = { amount: value };
                        break;
                    case 'performanceRating':
                        mergedRecord.performanceRating = { text: value };
                        break;
                    default:
                        mergedRecord[fieldKey] = value;
                }
            }
        });
        
        // Add metadata
        mergedRecord.id = `merged_${Date.now()}`;
        mergedRecord.isMerged = true;
        mergedRecord.mergedFrom = this.currentGroup.employees.map(emp => emp.id || emp.name);
        
        return mergedRecord;
    }

    /**
     * Navigate to previous group
     */
    previousGroup() {
        if (this.currentGroupIndex > 0) {
            this.loadGroup(this.currentGroupIndex - 1);
        }
    }

    /**
     * Navigate to next group
     */
    nextGroup() {
        if (this.currentGroupIndex < this.duplicateGroups.length - 1) {
            this.loadGroup(this.currentGroupIndex + 1);
        } else {
            // Finished reviewing all groups
            this.completeMergeProcess();
        }
    }

    /**
     * Complete the merge process
     */
    completeMergeProcess() {
        const results = {
            totalGroups: this.duplicateGroups.length,
            mergedGroups: 0,
            keptSeparate: 0,
            skipped: 0,
            decisions: Array.from(this.mergeDecisions.entries()).map(([index, decision]) => ({
                groupIndex: index,
                ...decision
            }))
        };
        
        // Count decision types
        this.mergeDecisions.forEach(decision => {
            switch (decision.action) {
                case 'merge':
                    results.mergedGroups++;
                    break;
                case 'keep_separate':
                    results.keptSeparate++;
                    break;
            }
        });
        
        results.skipped = results.totalGroups - results.mergedGroups - results.keptSeparate;
        
        this.onMergeComplete(results);
        this.close();
    }

    /**
     * Update progress display
     */
    updateProgress() {
        const total = this.duplicateGroups.length;
        const current = this.currentGroupIndex + 1;
        
        this.progressText.textContent = `Group ${current} of ${total}`;
        
        const percentage = total > 0 ? (current / total) * 100 : 0;
        this.progressFill.style.width = `${percentage}%`;
    }

    /**
     * Update navigation buttons
     */
    updateNavigation() {
        const prevBtn = this.container.querySelector('#nav-prev');
        const nextBtn = this.container.querySelector('#nav-next');
        
        prevBtn.disabled = this.currentGroupIndex === 0;
        nextBtn.disabled = this.currentGroupIndex >= this.duplicateGroups.length - 1;
        
        if (this.duplicateGroups.length > 0) {
            this.navInfo.textContent = `Reviewing duplicate group ${this.currentGroupIndex + 1} of ${this.duplicateGroups.length}`;
        } else {
            this.navInfo.textContent = 'No duplicates to review';
        }
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        this.header.style.display = 'none';
        this.comparisonArea.style.display = 'none';
        this.navigation.style.display = 'none';
        this.emptyState.style.display = 'block';
    }

    /**
     * Hide empty state
     */
    hideEmptyState() {
        this.header.style.display = 'block';
        this.comparisonArea.style.display = 'block';
        this.navigation.style.display = 'flex';
        this.emptyState.style.display = 'none';
    }

    /**
     * Show the merger interface
     */
    show() {
        this.container.style.display = 'block';
    }

    /**
     * Hide the merger interface
     */
    hide() {
        this.container.style.display = 'none';
    }

    /**
     * Close the merger interface
     */
    close() {
        this.hide();
        this.onMergeCancel();
    }

    /**
     * Get current merge decisions
     * @returns {Map} Merge decisions map
     */
    getMergeDecisions() {
        return new Map(this.mergeDecisions);
    }

    /**
     * Reset the merger state
     */
    reset() {
        this.duplicateGroups = [];
        this.currentGroup = null;
        this.currentGroupIndex = 0;
        this.mergeDecisions.clear();
        this.showEmptyState();
    }

    /**
     * Destroy the merger
     */
    destroy() {
        document.removeEventListener('keydown', this.handleKeydown);
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
window.DuplicateMerger = DuplicateMerger; 