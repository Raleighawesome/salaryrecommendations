/**
 * SearchBar Component
 * 
 * Provides live search functionality with debounced input for searching
 * across employee names and titles with real-time filtering.
 */

class SearchBar {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            placeholder: 'Search employees by name or title...',
            debounceDelay: 300,
            minSearchLength: 1,
            showClearButton: true,
            showSearchIcon: true,
            showResultsCount: true,
            ...options
        };
        
        // State
        this.searchTerm = '';
        this.data = [];
        this.filteredData = [];
        this.debounceTimer = null;
        this.isSearching = false;
        
        // Callbacks
        this.onSearch = options.onSearch || (() => {});
        this.onClear = options.onClear || (() => {});
        this.onFocus = options.onFocus || (() => {});
        this.onBlur = options.onBlur || (() => {});
        
        this.init();
    }

    /**
     * Initialize the search bar
     */
    init() {
        this.createSearchStructure();
        this.setupEventListeners();
    }

    /**
     * Create the search bar DOM structure
     */
    createSearchStructure() {
        this.container.innerHTML = '';
        this.container.className = 'search-bar-container';
        
        // Create search wrapper
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'search-wrapper';
        
        // Create search icon
        if (this.options.showSearchIcon) {
            const searchIcon = document.createElement('div');
            searchIcon.className = 'search-icon';
            searchIcon.innerHTML = '🔍';
            searchWrapper.appendChild(searchIcon);
        }
        
        // Create search input
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.className = 'search-input';
        this.searchInput.placeholder = this.options.placeholder;
        this.searchInput.autocomplete = 'off';
        this.searchInput.spellcheck = false;
        searchWrapper.appendChild(this.searchInput);
        
        // Create loading indicator
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'search-loading hidden';
        this.loadingIndicator.innerHTML = '⏳';
        searchWrapper.appendChild(this.loadingIndicator);
        
        // Create clear button
        if (this.options.showClearButton) {
            this.clearButton = document.createElement('button');
            this.clearButton.className = 'search-clear-btn hidden';
            this.clearButton.innerHTML = '✕';
            this.clearButton.title = 'Clear search';
            this.clearButton.type = 'button';
            searchWrapper.appendChild(this.clearButton);
        }
        
        // Create results info
        if (this.options.showResultsCount) {
            this.resultsInfo = document.createElement('div');
            this.resultsInfo.className = 'search-results-info';
            this.resultsInfo.textContent = '';
        }
        
        // Assemble search bar
        this.container.appendChild(searchWrapper);
        if (this.options.showResultsCount) {
            this.container.appendChild(this.resultsInfo);
        }
        
        // Create suggestions dropdown (for future enhancement)
        this.suggestionsDropdown = document.createElement('div');
        this.suggestionsDropdown.className = 'search-suggestions hidden';
        this.container.appendChild(this.suggestionsDropdown);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search input events
        this.searchInput.addEventListener('input', this.handleInput.bind(this));
        this.searchInput.addEventListener('focus', this.handleFocus.bind(this));
        this.searchInput.addEventListener('blur', this.handleBlur.bind(this));
        this.searchInput.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Clear button event
        if (this.clearButton) {
            this.clearButton.addEventListener('click', this.handleClear.bind(this));
        }
        
        // Click outside to close suggestions
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    /**
     * Handle input changes with debouncing
     * @param {Event} event - Input event
     */
    handleInput(event) {
        const value = event.target.value.trim();
        
        // Clear previous debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Show/hide clear button
        if (this.clearButton) {
            this.clearButton.classList.toggle('hidden', value.length === 0);
        }
        
        // Show loading indicator for longer searches
        if (value.length >= this.options.minSearchLength) {
            this.showLoading();
        }
        
        // Debounce the search
        this.debounceTimer = setTimeout(() => {
            this.performSearch(value);
        }, this.options.debounceDelay);
    }

    /**
     * Handle input focus
     * @param {Event} event - Focus event
     */
    handleFocus(event) {
        this.container.classList.add('search-focused');
        this.onFocus(event);
        
        // Show suggestions if there's a search term
        if (this.searchTerm && this.searchTerm.length >= this.options.minSearchLength) {
            this.showSuggestions();
        }
    }

    /**
     * Handle input blur
     * @param {Event} event - Blur event
     */
    handleBlur(event) {
        // Delay to allow for suggestion clicks
        setTimeout(() => {
            this.container.classList.remove('search-focused');
            this.hideSuggestions();
            this.onBlur(event);
        }, 150);
    }

    /**
     * Handle keyboard navigation
     * @param {Event} event - Keydown event
     */
    handleKeydown(event) {
        switch (event.key) {
            case 'Escape':
                this.clearSearch();
                this.searchInput.blur();
                break;
            case 'Enter':
                event.preventDefault();
                this.hideSuggestions();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.navigateSuggestions('down');
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.navigateSuggestions('up');
                break;
        }
    }

    /**
     * Handle clear button click
     * @param {Event} event - Click event
     */
    handleClear(event) {
        event.preventDefault();
        this.clearSearch();
        this.searchInput.focus();
    }

    /**
     * Handle document click to close suggestions
     * @param {Event} event - Click event
     */
    handleDocumentClick(event) {
        if (!this.container.contains(event.target)) {
            this.hideSuggestions();
        }
    }

    /**
     * Perform the actual search
     * @param {string} searchTerm - Search term
     */
    performSearch(searchTerm) {
        this.searchTerm = searchTerm;
        this.hideLoading();
        
        if (searchTerm.length < this.options.minSearchLength) {
            this.clearSearchResults();
            return;
        }
        
        // Perform search across employee data
        const results = this.searchEmployees(searchTerm);
        this.filteredData = results;
        
        // Update results info
        this.updateResultsInfo(results.length);
        
        // Generate and show suggestions
        this.generateSuggestions(searchTerm, results);
        
        // Trigger callback
        this.onSearch(searchTerm, results);
    }

    /**
     * Search employees by name and title
     * @param {string} searchTerm - Search term
     * @returns {Array} Filtered employee data
     */
    searchEmployees(searchTerm) {
        if (!searchTerm || searchTerm.length < this.options.minSearchLength) {
            return [...this.data];
        }
        
        const searchLower = searchTerm.toLowerCase();
        const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
        
        return this.data.filter(employee => {
            // Search in name
            const nameMatch = employee.name && 
                searchWords.every(word => employee.name.toLowerCase().includes(word));
            
            // Search in title
            const titleMatch = employee.title && 
                searchWords.every(word => employee.title.toLowerCase().includes(word));
            
            // Search in combined name + title
            const combinedText = `${employee.name || ''} ${employee.title || ''}`.toLowerCase();
            const combinedMatch = searchWords.every(word => combinedText.includes(word));
            
            return nameMatch || titleMatch || combinedMatch;
        });
    }

    /**
     * Generate search suggestions
     * @param {string} searchTerm - Search term
     * @param {Array} results - Search results
     */
    generateSuggestions(searchTerm, results) {
        if (searchTerm.length < this.options.minSearchLength || results.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        // Get unique suggestions from results
        const suggestions = this.extractSuggestions(searchTerm, results);
        
        if (suggestions.length > 0) {
            this.renderSuggestions(suggestions);
            this.showSuggestions();
        } else {
            this.hideSuggestions();
        }
    }

    /**
     * Extract relevant suggestions from search results
     * @param {string} searchTerm - Search term
     * @param {Array} results - Search results
     * @returns {Array} Suggestion objects
     */
    extractSuggestions(searchTerm, results) {
        const suggestions = [];
        const searchLower = searchTerm.toLowerCase();
        const maxSuggestions = 8;
        
        // Extract name suggestions
        const nameMatches = results
            .filter(emp => emp.name && emp.name.toLowerCase().includes(searchLower))
            .slice(0, 5)
            .map(emp => ({
                type: 'name',
                text: emp.name,
                subtitle: emp.title || 'Unknown Title',
                employee: emp
            }));
        
        // Extract title suggestions
        const titleMatches = results
            .filter(emp => emp.title && emp.title.toLowerCase().includes(searchLower))
            .slice(0, 5)
            .map(emp => ({
                type: 'title',
                text: emp.title,
                subtitle: emp.name || 'Unknown Name',
                employee: emp
            }));
        
        // Combine and deduplicate
        const allSuggestions = [...nameMatches, ...titleMatches];
        const uniqueSuggestions = allSuggestions.filter((suggestion, index, array) => 
            array.findIndex(s => s.text === suggestion.text && s.type === suggestion.type) === index
        );
        
        return uniqueSuggestions.slice(0, maxSuggestions);
    }

    /**
     * Render suggestions dropdown
     * @param {Array} suggestions - Suggestion objects
     */
    renderSuggestions(suggestions) {
        this.suggestionsDropdown.innerHTML = '';
        
        suggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'search-suggestion';
            suggestionElement.setAttribute('data-index', index);
            
            const icon = suggestion.type === 'name' ? '👤' : '💼';
            suggestionElement.innerHTML = `
                <div class="suggestion-icon">${icon}</div>
                <div class="suggestion-content">
                    <div class="suggestion-text">${this.highlightMatch(suggestion.text, this.searchTerm)}</div>
                    <div class="suggestion-subtitle">${suggestion.subtitle}</div>
                </div>
            `;
            
            // Add click handler
            suggestionElement.addEventListener('click', () => {
                this.selectSuggestion(suggestion);
            });
            
            this.suggestionsDropdown.appendChild(suggestionElement);
        });
    }

    /**
     * Highlight matching text in suggestions
     * @param {string} text - Text to highlight
     * @param {string} searchTerm - Search term
     * @returns {string} HTML with highlighted text
     */
    highlightMatch(text, searchTerm) {
        if (!searchTerm) return text;
        
        const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        let highlightedText = text;
        
        searchWords.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });
        
        return highlightedText;
    }

    /**
     * Select a suggestion
     * @param {Object} suggestion - Selected suggestion
     */
    selectSuggestion(suggestion) {
        this.searchInput.value = suggestion.text;
        this.searchTerm = suggestion.text;
        this.hideSuggestions();
        this.performSearch(suggestion.text);
    }

    /**
     * Navigate suggestions with keyboard
     * @param {string} direction - 'up' or 'down'
     */
    navigateSuggestions(direction) {
        const suggestions = this.suggestionsDropdown.querySelectorAll('.search-suggestion');
        if (suggestions.length === 0) return;
        
        const currentActive = this.suggestionsDropdown.querySelector('.search-suggestion.active');
        let newIndex = 0;
        
        if (currentActive) {
            const currentIndex = parseInt(currentActive.getAttribute('data-index'));
            newIndex = direction === 'down' 
                ? Math.min(currentIndex + 1, suggestions.length - 1)
                : Math.max(currentIndex - 1, 0);
            currentActive.classList.remove('active');
        } else {
            newIndex = direction === 'down' ? 0 : suggestions.length - 1;
        }
        
        suggestions[newIndex].classList.add('active');
        suggestions[newIndex].scrollIntoView({ block: 'nearest' });
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.remove('hidden');
            this.isSearching = true;
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.add('hidden');
            this.isSearching = false;
        }
    }

    /**
     * Show suggestions dropdown
     */
    showSuggestions() {
        this.suggestionsDropdown.classList.remove('hidden');
    }

    /**
     * Hide suggestions dropdown
     */
    hideSuggestions() {
        this.suggestionsDropdown.classList.add('hidden');
        // Remove active state from suggestions
        this.suggestionsDropdown.querySelectorAll('.search-suggestion.active').forEach(el => {
            el.classList.remove('active');
        });
    }

    /**
     * Update results info display
     * @param {number} resultCount - Number of results
     */
    updateResultsInfo(resultCount) {
        if (!this.resultsInfo) return;
        
        if (this.searchTerm.length < this.options.minSearchLength) {
            this.resultsInfo.textContent = '';
            return;
        }
        
        if (resultCount === 0) {
            this.resultsInfo.textContent = `No results found for "${this.searchTerm}"`;
            this.resultsInfo.className = 'search-results-info no-results';
        } else {
            const totalCount = this.data.length;
            this.resultsInfo.textContent = `${resultCount} of ${totalCount} employees match "${this.searchTerm}"`;
            this.resultsInfo.className = 'search-results-info has-results';
        }
    }

    /**
     * Clear search results
     */
    clearSearchResults() {
        this.filteredData = [...this.data];
        this.updateResultsInfo(0);
        this.hideSuggestions();
        this.onSearch('', this.filteredData);
    }

    /**
     * Clear search completely
     */
    clearSearch() {
        this.searchInput.value = '';
        this.searchTerm = '';
        
        if (this.clearButton) {
            this.clearButton.classList.add('hidden');
        }
        
        this.clearSearchResults();
        this.onClear();
    }

    /**
     * Update data for searching
     * @param {Array} data - Employee data array
     */
    updateData(data) {
        this.data = data || [];
        this.filteredData = [...this.data];
        
        // Re-perform search if there's an active search term
        if (this.searchTerm && this.searchTerm.length >= this.options.minSearchLength) {
            this.performSearch(this.searchTerm);
        } else {
            this.updateResultsInfo(0);
        }
    }

    /**
     * Set search term programmatically
     * @param {string} searchTerm - Search term to set
     */
    setSearchTerm(searchTerm) {
        this.searchInput.value = searchTerm || '';
        this.performSearch(searchTerm || '');
    }

    /**
     * Get current search term
     * @returns {string} Current search term
     */
    getSearchTerm() {
        return this.searchTerm;
    }

    /**
     * Get current filtered data
     * @returns {Array} Filtered employee data
     */
    getFilteredData() {
        return this.filteredData;
    }

    /**
     * Focus the search input
     */
    focus() {
        this.searchInput.focus();
    }

    /**
     * Blur the search input
     */
    blur() {
        this.searchInput.blur();
    }

    /**
     * Enable/disable the search bar
     * @param {boolean} enabled - Whether to enable the search bar
     */
    setEnabled(enabled) {
        this.searchInput.disabled = !enabled;
        this.container.classList.toggle('search-disabled', !enabled);
        
        if (this.clearButton) {
            this.clearButton.disabled = !enabled;
        }
    }

    /**
     * Destroy the search bar
     */
    destroy() {
        // Clear timers
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Remove event listeners
        document.removeEventListener('click', this.handleDocumentClick);
        
        // Clear container
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
window.SearchBar = SearchBar; 