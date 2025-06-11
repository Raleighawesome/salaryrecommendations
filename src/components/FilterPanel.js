/**
 * FilterPanel Component
 * 
 * Provides combinable filters for the employee data table including
 * country, salary range, performance rating, and future talent filters.
 */

class FilterPanel {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showClearAll: true,
            showFilterCount: true,
            ...options
        };
        
        // State
        this.filters = {
            countries: new Set(),
            salaryRange: { min: null, max: null },
            performanceRatings: new Set(),
            futureTalent: null, // null = all, true = only future talent, false = exclude future talent
            searchTerm: ''
        };
        
        this.data = [];
        this.availableFilters = {
            countries: [],
            salaryRange: { min: 0, max: 0 },
            performanceRatings: [],
            futureTalentCount: 0
        };
        
        // Callbacks
        this.onFiltersChange = options.onFiltersChange || (() => {});
        
        this.init();
    }

    /**
     * Initialize the filter panel
     */
    init() {
        this.createFilterStructure();
        this.setupEventListeners();
    }

    /**
     * Create the filter panel DOM structure
     */
    createFilterStructure() {
        this.container.innerHTML = '';
        this.container.className = 'filter-panel';
        
        // Create filter header
        const header = document.createElement('div');
        header.className = 'filter-header';
        header.innerHTML = `
            <h3>Filters</h3>
            <div class="filter-actions">
                <button class="filter-clear-btn" title="Clear all filters">Clear All</button>
                <span class="filter-count">0 active</span>
            </div>
        `;
        
        // Create filter sections
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'filters-container';
        
        // Country filter
        const countryFilter = this.createCountryFilter();
        filtersContainer.appendChild(countryFilter);
        
        // Salary range filter
        const salaryFilter = this.createSalaryRangeFilter();
        filtersContainer.appendChild(salaryFilter);
        
        // Performance rating filter
        const performanceFilter = this.createPerformanceFilter();
        filtersContainer.appendChild(performanceFilter);
        
        // Future talent filter
        const futureTalentFilter = this.createFutureTalentFilter();
        filtersContainer.appendChild(futureTalentFilter);
        
        // Assemble panel
        this.container.appendChild(header);
        this.container.appendChild(filtersContainer);
        
        // Store references
        this.clearBtn = header.querySelector('.filter-clear-btn');
        this.filterCount = header.querySelector('.filter-count');
    }

    /**
     * Create country filter section
     * @returns {HTMLElement} Country filter element
     */
    createCountryFilter() {
        const section = document.createElement('div');
        section.className = 'filter-section';
        section.innerHTML = `
            <div class="filter-section-header">
                <h4>Country</h4>
                <span class="filter-section-count">0 selected</span>
            </div>
            <div class="filter-section-content">
                <div class="country-filters">
                    <!-- Country checkboxes will be populated here -->
                </div>
            </div>
        `;
        return section;
    }

    /**
     * Create salary range filter section
     * @returns {HTMLElement} Salary range filter element
     */
    createSalaryRangeFilter() {
        const section = document.createElement('div');
        section.className = 'filter-section';
        section.innerHTML = `
            <div class="filter-section-header">
                <h4>Salary Range</h4>
                <span class="filter-section-count">All</span>
            </div>
            <div class="filter-section-content">
                <div class="salary-range-inputs">
                    <div class="range-input-group">
                        <label for="salary-min">Min:</label>
                        <input type="number" id="salary-min" class="salary-input" placeholder="0" min="0" step="1000">
                    </div>
                    <div class="range-input-group">
                        <label for="salary-max">Max:</label>
                        <input type="number" id="salary-max" class="salary-input" placeholder="No limit" min="0" step="1000">
                    </div>
                </div>
                <div class="salary-range-slider">
                    <input type="range" id="salary-range-min" class="range-slider" min="0" max="500000" step="1000">
                    <input type="range" id="salary-range-max" class="range-slider" min="0" max="500000" step="1000">
                </div>
                <div class="salary-range-display">
                    <span class="range-display-min">$0</span>
                    <span class="range-display-max">$500K+</span>
                </div>
            </div>
        `;
        return section;
    }

    /**
     * Create performance rating filter section
     * @returns {HTMLElement} Performance filter element
     */
    createPerformanceFilter() {
        const section = document.createElement('div');
        section.className = 'filter-section';
        section.innerHTML = `
            <div class="filter-section-header">
                <h4>Performance Rating</h4>
                <span class="filter-section-count">0 selected</span>
            </div>
            <div class="filter-section-content">
                <div class="performance-filters">
                    <!-- Performance rating checkboxes will be populated here -->
                </div>
            </div>
        `;
        return section;
    }

    /**
     * Create future talent filter section
     * @returns {HTMLElement} Future talent filter element
     */
    createFutureTalentFilter() {
        const section = document.createElement('div');
        section.className = 'filter-section';
        section.innerHTML = `
            <div class="filter-section-header">
                <h4>Future Talent</h4>
                <span class="filter-section-count">All</span>
            </div>
            <div class="filter-section-content">
                <div class="future-talent-options">
                    <label class="radio-option">
                        <input type="radio" name="future-talent" value="all" checked>
                        <span class="radio-label">All Employees</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="future-talent" value="true">
                        <span class="radio-label">Future Talent Only</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="future-talent" value="false">
                        <span class="radio-label">Exclude Future Talent</span>
                    </label>
                </div>
            </div>
        `;
        return section;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Clear all filters button
        this.clearBtn.addEventListener('click', this.clearAllFilters.bind(this));
        
        // Salary range inputs
        const salaryMin = this.container.querySelector('#salary-min');
        const salaryMax = this.container.querySelector('#salary-max');
        const rangeMin = this.container.querySelector('#salary-range-min');
        const rangeMax = this.container.querySelector('#salary-range-max');
        
        salaryMin.addEventListener('input', this.handleSalaryInputChange.bind(this));
        salaryMax.addEventListener('input', this.handleSalaryInputChange.bind(this));
        rangeMin.addEventListener('input', this.handleSalaryRangeChange.bind(this));
        rangeMax.addEventListener('input', this.handleSalaryRangeChange.bind(this));
        
        // Future talent radio buttons
        const futureTalentRadios = this.container.querySelectorAll('input[name="future-talent"]');
        futureTalentRadios.forEach(radio => {
            radio.addEventListener('change', this.handleFutureTalentChange.bind(this));
        });
    }

    /**
     * Update data and rebuild filter options
     * @param {Array} data - Employee data array
     */
    updateData(data) {
        this.data = data || [];
        this.analyzeData();
        this.populateFilterOptions();
        this.updateFilterCounts();
    }

    /**
     * Analyze data to determine available filter options
     */
    analyzeData() {
        const countries = new Set();
        const performanceRatings = new Set();
        let minSalary = Infinity;
        let maxSalary = 0;
        let futureTalentCount = 0;
        
        this.data.forEach(employee => {
            // Countries
            if (employee.country) {
                countries.add(employee.country);
            }
            
            // Salary range
            if (employee.salary && employee.salary.amount > 0) {
                minSalary = Math.min(minSalary, employee.salary.amount);
                maxSalary = Math.max(maxSalary, employee.salary.amount);
            }
            
            // Performance ratings
            if (employee.performanceRating && employee.performanceRating.text) {
                performanceRatings.add(employee.performanceRating.text);
            }
            
            // Future talent count
            if (employee.futureTalent) {
                futureTalentCount++;
            }
        });
        
        this.availableFilters = {
            countries: Array.from(countries).sort(),
            salaryRange: {
                min: minSalary === Infinity ? 0 : Math.floor(minSalary / 1000) * 1000,
                max: Math.ceil(maxSalary / 1000) * 1000
            },
            performanceRatings: Array.from(performanceRatings).sort(),
            futureTalentCount
        };
    }

    /**
     * Populate filter options based on analyzed data
     */
    populateFilterOptions() {
        this.populateCountryOptions();
        this.populatePerformanceOptions();
        this.updateSalaryRangeSliders();
        this.updateFutureTalentCounts();
    }

    /**
     * Populate country filter options
     */
    populateCountryOptions() {
        const container = this.container.querySelector('.country-filters');
        container.innerHTML = '';
        
        this.availableFilters.countries.forEach(country => {
            const count = this.data.filter(emp => emp.country === country).length;
            
            const option = document.createElement('label');
            option.className = 'checkbox-option';
            option.innerHTML = `
                <input type="checkbox" value="${country}" data-filter="country">
                <span class="checkbox-label">${country}</span>
                <span class="option-count">(${count})</span>
            `;
            
            const checkbox = option.querySelector('input');
            checkbox.addEventListener('change', this.handleCountryChange.bind(this));
            
            container.appendChild(option);
        });
    }

    /**
     * Populate performance rating filter options
     */
    populatePerformanceOptions() {
        const container = this.container.querySelector('.performance-filters');
        container.innerHTML = '';
        
        this.availableFilters.performanceRatings.forEach(rating => {
            const count = this.data.filter(emp => emp.performanceRating?.text === rating).length;
            
            const option = document.createElement('label');
            option.className = 'checkbox-option';
            option.innerHTML = `
                <input type="checkbox" value="${rating}" data-filter="performance">
                <span class="checkbox-label">${rating}</span>
                <span class="option-count">(${count})</span>
            `;
            
            const checkbox = option.querySelector('input');
            checkbox.addEventListener('change', this.handlePerformanceChange.bind(this));
            
            container.appendChild(option);
        });
    }

    /**
     * Update salary range sliders
     */
    updateSalaryRangeSliders() {
        const rangeMin = this.container.querySelector('#salary-range-min');
        const rangeMax = this.container.querySelector('#salary-range-max');
        const displayMin = this.container.querySelector('.range-display-min');
        const displayMax = this.container.querySelector('.range-display-max');
        
        const { min, max } = this.availableFilters.salaryRange;
        
        rangeMin.min = min;
        rangeMin.max = max;
        rangeMin.value = min;
        
        rangeMax.min = min;
        rangeMax.max = max;
        rangeMax.value = max;
        
        displayMin.textContent = this.formatCurrency(min);
        displayMax.textContent = this.formatCurrency(max);
    }

    /**
     * Update future talent counts
     */
    updateFutureTalentCounts() {
        const options = this.container.querySelectorAll('.future-talent-options .radio-option');
        const totalCount = this.data.length;
        const futureTalentCount = this.availableFilters.futureTalentCount;
        const nonFutureTalentCount = totalCount - futureTalentCount;
        
        options[0].querySelector('.radio-label').textContent = `All Employees (${totalCount})`;
        options[1].querySelector('.radio-label').textContent = `Future Talent Only (${futureTalentCount})`;
        options[2].querySelector('.radio-label').textContent = `Exclude Future Talent (${nonFutureTalentCount})`;
    }

    /**
     * Handle country filter changes
     * @param {Event} event - Change event
     */
    handleCountryChange(event) {
        const country = event.target.value;
        const isChecked = event.target.checked;
        
        if (isChecked) {
            this.filters.countries.add(country);
        } else {
            this.filters.countries.delete(country);
        }
        
        this.updateFilterCounts();
        this.applyFilters();
    }

    /**
     * Handle performance rating filter changes
     * @param {Event} event - Change event
     */
    handlePerformanceChange(event) {
        const rating = event.target.value;
        const isChecked = event.target.checked;
        
        if (isChecked) {
            this.filters.performanceRatings.add(rating);
        } else {
            this.filters.performanceRatings.delete(rating);
        }
        
        this.updateFilterCounts();
        this.applyFilters();
    }

    /**
     * Handle salary input changes
     * @param {Event} event - Input event
     */
    handleSalaryInputChange(event) {
        const isMin = event.target.id === 'salary-min';
        const value = parseInt(event.target.value) || null;
        
        if (isMin) {
            this.filters.salaryRange.min = value;
        } else {
            this.filters.salaryRange.max = value;
        }
        
        // Update corresponding slider
        const slider = this.container.querySelector(isMin ? '#salary-range-min' : '#salary-range-max');
        if (value !== null) {
            slider.value = value;
        }
        
        this.updateFilterCounts();
        this.applyFilters();
    }

    /**
     * Handle salary range slider changes
     * @param {Event} event - Input event
     */
    handleSalaryRangeChange(event) {
        const isMin = event.target.id === 'salary-range-min';
        const value = parseInt(event.target.value);
        
        if (isMin) {
            this.filters.salaryRange.min = value;
            this.container.querySelector('#salary-min').value = value;
        } else {
            this.filters.salaryRange.max = value;
            this.container.querySelector('#salary-max').value = value;
        }
        
        // Update display
        const display = this.container.querySelector(isMin ? '.range-display-min' : '.range-display-max');
        display.textContent = this.formatCurrency(value);
        
        this.updateFilterCounts();
        this.applyFilters();
    }

    /**
     * Handle future talent filter changes
     * @param {Event} event - Change event
     */
    handleFutureTalentChange(event) {
        const value = event.target.value;
        
        switch (value) {
            case 'all':
                this.filters.futureTalent = null;
                break;
            case 'true':
                this.filters.futureTalent = true;
                break;
            case 'false':
                this.filters.futureTalent = false;
                break;
        }
        
        this.updateFilterCounts();
        this.applyFilters();
    }

    /**
     * Apply all filters and return filtered data
     * @returns {Array} Filtered employee data
     */
    applyFilters() {
        let filteredData = [...this.data];
        
        // Apply country filter
        if (this.filters.countries.size > 0) {
            filteredData = filteredData.filter(emp => 
                this.filters.countries.has(emp.country)
            );
        }
        
        // Apply salary range filter
        if (this.filters.salaryRange.min !== null || this.filters.salaryRange.max !== null) {
            filteredData = filteredData.filter(emp => {
                if (!emp.salary || emp.salary.amount <= 0) return false;
                
                const salary = emp.salary.amount;
                const minOk = this.filters.salaryRange.min === null || salary >= this.filters.salaryRange.min;
                const maxOk = this.filters.salaryRange.max === null || salary <= this.filters.salaryRange.max;
                
                return minOk && maxOk;
            });
        }
        
        // Apply performance rating filter
        if (this.filters.performanceRatings.size > 0) {
            filteredData = filteredData.filter(emp => 
                emp.performanceRating && this.filters.performanceRatings.has(emp.performanceRating.text)
            );
        }
        
        // Apply future talent filter
        if (this.filters.futureTalent !== null) {
            filteredData = filteredData.filter(emp => 
                Boolean(emp.futureTalent) === this.filters.futureTalent
            );
        }
        
        // Apply search term filter (if set externally)
        if (this.filters.searchTerm) {
            const searchLower = this.filters.searchTerm.toLowerCase();
            filteredData = filteredData.filter(emp => 
                (emp.name && emp.name.toLowerCase().includes(searchLower)) ||
                (emp.title && emp.title.toLowerCase().includes(searchLower))
            );
        }
        
        this.onFiltersChange(filteredData, this.getActiveFiltersCount());
        return filteredData;
    }

    /**
     * Set search term filter
     * @param {string} searchTerm - Search term
     */
    setSearchTerm(searchTerm) {
        this.filters.searchTerm = searchTerm || '';
        this.applyFilters();
    }

    /**
     * Clear all filters
     */
    clearAllFilters() {
        // Reset filter state
        this.filters.countries.clear();
        this.filters.salaryRange = { min: null, max: null };
        this.filters.performanceRatings.clear();
        this.filters.futureTalent = null;
        this.filters.searchTerm = '';
        
        // Reset UI elements
        this.container.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        this.container.querySelectorAll('input[type="radio"][value="all"]').forEach(radio => radio.checked = true);
        this.container.querySelector('#salary-min').value = '';
        this.container.querySelector('#salary-max').value = '';
        
        // Reset sliders
        const rangeMin = this.container.querySelector('#salary-range-min');
        const rangeMax = this.container.querySelector('#salary-range-max');
        rangeMin.value = rangeMin.min;
        rangeMax.value = rangeMax.max;
        
        // Reset displays
        this.container.querySelector('.range-display-min').textContent = this.formatCurrency(rangeMin.min);
        this.container.querySelector('.range-display-max').textContent = this.formatCurrency(rangeMax.max);
        
        this.updateFilterCounts();
        this.applyFilters();
    }

    /**
     * Update filter count displays
     */
    updateFilterCounts() {
        // Country section count
        const countryCount = this.filters.countries.size;
        const countrySection = this.container.querySelector('.filter-section:nth-child(1) .filter-section-count');
        countrySection.textContent = countryCount > 0 ? `${countryCount} selected` : 'All';
        
        // Salary section count
        const salarySection = this.container.querySelector('.filter-section:nth-child(2) .filter-section-count');
        const hasMinMax = this.filters.salaryRange.min !== null || this.filters.salaryRange.max !== null;
        salarySection.textContent = hasMinMax ? 'Custom range' : 'All';
        
        // Performance section count
        const performanceCount = this.filters.performanceRatings.size;
        const performanceSection = this.container.querySelector('.filter-section:nth-child(3) .filter-section-count');
        performanceSection.textContent = performanceCount > 0 ? `${performanceCount} selected` : 'All';
        
        // Future talent section count
        const futureTalentSection = this.container.querySelector('.filter-section:nth-child(4) .filter-section-count');
        if (this.filters.futureTalent === true) {
            futureTalentSection.textContent = 'Future Talent Only';
        } else if (this.filters.futureTalent === false) {
            futureTalentSection.textContent = 'Excluding Future Talent';
        } else {
            futureTalentSection.textContent = 'All';
        }
        
        // Overall filter count
        const activeCount = this.getActiveFiltersCount();
        this.filterCount.textContent = activeCount > 0 ? `${activeCount} active` : '0 active';
        this.clearBtn.style.display = activeCount > 0 ? 'block' : 'none';
    }

    /**
     * Get count of active filters
     * @returns {number} Number of active filters
     */
    getActiveFiltersCount() {
        let count = 0;
        
        if (this.filters.countries.size > 0) count++;
        if (this.filters.salaryRange.min !== null || this.filters.salaryRange.max !== null) count++;
        if (this.filters.performanceRatings.size > 0) count++;
        if (this.filters.futureTalent !== null) count++;
        if (this.filters.searchTerm) count++;
        
        return count;
    }

    /**
     * Format currency value for display
     * @param {number} value - Currency value
     * @returns {string} Formatted currency string
     */
    formatCurrency(value) {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        } else {
            return `$${value}`;
        }
    }

    /**
     * Get current filter state
     * @returns {Object} Current filter state
     */
    getFilters() {
        return {
            countries: Array.from(this.filters.countries),
            salaryRange: { ...this.filters.salaryRange },
            performanceRatings: Array.from(this.filters.performanceRatings),
            futureTalent: this.filters.futureTalent,
            searchTerm: this.filters.searchTerm
        };
    }

    /**
     * Set filter state
     * @param {Object} filters - Filter state to set
     */
    setFilters(filters) {
        if (filters.countries) {
            this.filters.countries = new Set(filters.countries);
        }
        if (filters.salaryRange) {
            this.filters.salaryRange = { ...filters.salaryRange };
        }
        if (filters.performanceRatings) {
            this.filters.performanceRatings = new Set(filters.performanceRatings);
        }
        if (filters.futureTalent !== undefined) {
            this.filters.futureTalent = filters.futureTalent;
        }
        if (filters.searchTerm !== undefined) {
            this.filters.searchTerm = filters.searchTerm;
        }
        
        this.updateFilterCounts();
        this.applyFilters();
    }

    /**
     * Destroy the filter panel
     */
    destroy() {
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
window.FilterPanel = FilterPanel; 