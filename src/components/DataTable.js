/**
 * DataTable Component
 * 
 * High-performance data table with virtual scrolling for displaying
 * employee data with sorting, selection, and responsive design.
 */

class DataTable {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            itemHeight: 60,
            bufferSize: 10,
            sortable: true,
            selectable: true,
            showActions: true,
            ...options
        };
        
        // State
        this.data = [];
        this.filteredData = [];
        this.selectedRows = new Set();
        this.lastSelectedIndex = null;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.virtualScroll = null;
        
        // Callbacks
        this.onRowSelect = options.onRowSelect || (() => {});
        this.onRowEdit = options.onRowEdit || (() => {});
        this.onRowMerge = options.onRowMerge || (() => {});
        this.onSort = options.onSort || (() => {});
        
        // Column definitions
        this.columns = [
            {
                key: 'name',
                title: 'Name',
                sortable: true,
                className: 'col-name',
                render: this.renderNameCell.bind(this)
            },
            {
                key: 'title',
                title: 'Job Title',
                sortable: true,
                className: 'col-title',
                render: this.renderTitleCell.bind(this)
            },
            {
                key: 'country',
                title: 'Country',
                sortable: true,
                className: 'col-country',
                render: this.renderCountryCell.bind(this)
            },
            {
                key: 'salary',
                title: 'Salary',
                sortable: true,
                className: 'col-salary',
                render: this.renderSalaryCell.bind(this)
            },
            {
                key: 'comparatio',
                title: 'Comparatio',
                sortable: true,
                className: 'col-comparatio',
                render: this.renderComparatioCell.bind(this)
            },
            {
                key: 'performanceRating',
                title: 'Performance',
                sortable: true,
                className: 'col-performance',
                render: this.renderPerformanceCell.bind(this)
            },
            {
                key: 'futureTalent',
                title: 'Future Talent',
                sortable: true,
                className: 'col-future-talent',
                render: this.renderFutureTalentCell.bind(this)
            }
        ];
        
        if (this.options.showActions) {
            this.columns.push({
                key: 'actions',
                title: 'Actions',
                sortable: false,
                className: 'col-actions',
                render: this.renderActionsCell.bind(this)
            });
        }
        
        this.init();
    }

    /**
     * Initialize the data table
     */
    init() {
        this.createTableStructure();
        this.setupEventListeners();
    }

    /**
     * Create the table DOM structure
     */
    createTableStructure() {
        this.container.innerHTML = '';
        this.container.className = 'data-table-container';
        
        // Create header
        this.header = document.createElement('div');
        this.header.className = 'data-table-header';
        this.createHeader();
        
        // Create body container
        this.bodyContainer = document.createElement('div');
        this.bodyContainer.className = 'data-table-body';
        
        // Create info bar
        this.infoBar = document.createElement('div');
        this.infoBar.className = 'data-table-info';
        this.updateInfoBar();
        
        // Create keyboard hints
        this.keyboardHints = document.createElement('div');
        this.keyboardHints.className = 'data-table-keyboard-hints';
        this.keyboardHints.innerHTML = `
            <div class="hint-line"><span class="hint-key">↑↓</span> Navigate</div>
            <div class="hint-line"><span class="hint-key">Space</span> Select</div>
            <div class="hint-line"><span class="hint-key">Shift+↑↓</span> Range</div>
            <div class="hint-line"><span class="hint-key">Ctrl+A</span> Select All</div>
            <div class="hint-line"><span class="hint-key">Esc</span> Clear</div>
        `;
        
        // Assemble table
        this.container.appendChild(this.header);
        this.container.appendChild(this.bodyContainer);
        this.container.appendChild(this.infoBar);
        this.container.appendChild(this.keyboardHints);
        
        // Initialize virtual scrolling
        this.initVirtualScroll();
    }

    /**
     * Create table header
     */
    createHeader() {
        this.header.innerHTML = '';
        
        this.columns.forEach(column => {
            const cell = document.createElement('div');
            cell.className = `data-table-header-cell ${column.className}`;
            cell.textContent = column.title;
            cell.setAttribute('data-column', column.key);
            
            if (column.sortable) {
                cell.classList.add('sortable');
                cell.setAttribute('tabindex', '0');
                cell.setAttribute('role', 'button');
                cell.setAttribute('aria-label', `Sort by ${column.title}`);
            }
            
            // Add sort indicator
            if (this.sortColumn === column.key) {
                cell.classList.add(`sort-${this.sortDirection}`);
            }
            
            this.header.appendChild(cell);
        });
    }

    /**
     * Initialize virtual scrolling
     */
    initVirtualScroll() {
        this.virtualScroll = new VirtualScroll({
            container: this.bodyContainer,
            itemHeight: this.options.itemHeight,
            bufferSize: this.options.bufferSize,
            data: this.filteredData,
            renderItem: this.renderRow.bind(this),
            onScroll: this.handleScroll.bind(this)
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Header click for sorting
        this.header.addEventListener('click', this.handleHeaderClick.bind(this));
        this.header.addEventListener('keydown', this.handleHeaderKeydown.bind(this));
        
        // Row selection
        this.bodyContainer.addEventListener('click', this.handleRowClick.bind(this));
        this.bodyContainer.addEventListener('keydown', this.handleRowKeydown.bind(this));
    }

    /**
     * Handle header click for sorting
     * @param {Event} event - Click event
     */
    handleHeaderClick(event) {
        const cell = event.target.closest('.data-table-header-cell');
        if (!cell || !cell.classList.contains('sortable')) return;
        
        const column = cell.getAttribute('data-column');
        this.sort(column);
    }

    /**
     * Handle header keyboard navigation
     * @param {Event} event - Keydown event
     */
    handleHeaderKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleHeaderClick(event);
        }
    }

    /**
     * Handle row click for selection
     * @param {Event} event - Click event
     */
    handleRowClick(event) {
        const row = event.target.closest('.data-table-row');
        if (!row) return;
        
        const index = parseInt(row.getAttribute('data-index'));
        const employee = this.filteredData[index];
        
        // Handle action button clicks
        const actionBtn = event.target.closest('.action-btn');
        if (actionBtn) {
            event.stopPropagation();
            this.handleActionClick(actionBtn, employee, index);
            return;
        }
        
        // Handle row selection
        if (this.options.selectable) {
            this.toggleRowSelection(index);
        }
        
        this.onRowSelect(employee, index);
    }

    /**
     * Handle action button clicks
     * @param {HTMLElement} button - Action button
     * @param {Object} employee - Employee data
     * @param {number} index - Row index
     */
    handleActionClick(button, employee, index) {
        const action = button.getAttribute('data-action');
        
        switch (action) {
            case 'edit':
                this.onRowEdit(employee, index);
                break;
            case 'merge':
                this.onRowMerge(employee, index);
                break;
            case 'delete':
                this.deleteRow(index);
                break;
        }
    }

    /**
     * Handle row keyboard navigation
     * @param {Event} event - Keydown event
     */
    handleRowKeydown(event) {
        const row = event.target.closest('.data-table-row');
        if (!row) return;
        
        const index = parseInt(row.getAttribute('data-index'));
        
        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (event.shiftKey) {
                    this.selectRowRange(this.lastSelectedIndex || 0, index);
                } else if (event.ctrlKey || event.metaKey) {
                    this.toggleRowSelection(index);
                } else {
                    this.selectSingleRow(index);
                }
                this.lastSelectedIndex = index;
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (event.shiftKey && this.lastSelectedIndex !== null) {
                    this.selectRowRange(this.lastSelectedIndex, index - 1);
                } else {
                    this.focusRow(index - 1);
                    if (event.ctrlKey || event.metaKey) {
                        // Move focus without changing selection
                    } else {
                        this.selectSingleRow(index - 1);
                        this.lastSelectedIndex = index - 1;
                    }
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (event.shiftKey && this.lastSelectedIndex !== null) {
                    this.selectRowRange(this.lastSelectedIndex, index + 1);
                } else {
                    this.focusRow(index + 1);
                    if (event.ctrlKey || event.metaKey) {
                        // Move focus without changing selection
                    } else {
                        this.selectSingleRow(index + 1);
                        this.lastSelectedIndex = index + 1;
                    }
                }
                break;
            case 'Home':
                event.preventDefault();
                if (event.shiftKey && this.lastSelectedIndex !== null) {
                    this.selectRowRange(this.lastSelectedIndex, 0);
                } else {
                    this.focusRow(0);
                    if (!event.ctrlKey && !event.metaKey) {
                        this.selectSingleRow(0);
                        this.lastSelectedIndex = 0;
                    }
                }
                break;
            case 'End':
                event.preventDefault();
                const lastIndex = this.filteredData.length - 1;
                if (event.shiftKey && this.lastSelectedIndex !== null) {
                    this.selectRowRange(this.lastSelectedIndex, lastIndex);
                } else {
                    this.focusRow(lastIndex);
                    if (!event.ctrlKey && !event.metaKey) {
                        this.selectSingleRow(lastIndex);
                        this.lastSelectedIndex = lastIndex;
                    }
                }
                break;
            case 'PageUp':
                event.preventDefault();
                const pageUpIndex = Math.max(0, index - 10);
                if (event.shiftKey && this.lastSelectedIndex !== null) {
                    this.selectRowRange(this.lastSelectedIndex, pageUpIndex);
                } else {
                    this.focusRow(pageUpIndex);
                    if (!event.ctrlKey && !event.metaKey) {
                        this.selectSingleRow(pageUpIndex);
                        this.lastSelectedIndex = pageUpIndex;
                    }
                }
                break;
            case 'PageDown':
                event.preventDefault();
                const pageDownIndex = Math.min(this.filteredData.length - 1, index + 10);
                if (event.shiftKey && this.lastSelectedIndex !== null) {
                    this.selectRowRange(this.lastSelectedIndex, pageDownIndex);
                } else {
                    this.focusRow(pageDownIndex);
                    if (!event.ctrlKey && !event.metaKey) {
                        this.selectSingleRow(pageDownIndex);
                        this.lastSelectedIndex = pageDownIndex;
                    }
                }
                break;
            case 'a':
            case 'A':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.selectAllRows();
                }
                break;
            case 'Escape':
                event.preventDefault();
                this.clearSelection();
                this.lastSelectedIndex = null;
                break;
            case 'Delete':
            case 'Backspace':
                if (this.selectedRows.size > 0) {
                    event.preventDefault();
                    this.deleteSelectedRows();
                }
                break;
        }
    }

    /**
     * Render a table row
     * @param {Object} employee - Employee data
     * @param {number} index - Row index
     * @returns {HTMLElement} Row element
     */
    renderRow(employee, index) {
        const row = document.createElement('div');
        row.className = 'data-table-row';
        row.setAttribute('data-index', index);
        row.setAttribute('tabindex', '0');
        row.setAttribute('role', 'row');
        
        // Add row state classes
        if (this.selectedRows.has(index)) {
            row.classList.add('selected');
        }
        
        if (employee.isDuplicate) {
            row.classList.add('duplicate');
        }
        
        if (employee.performanceRating?.isSuggested) {
            row.classList.add('suggested');
        }
        
        if (this.hasRiskIndicators(employee)) {
            row.classList.add('risk');
        }
        
        // Render cells
        this.columns.forEach(column => {
            const cell = column.render(employee, index);
            row.appendChild(cell);
        });
        
        return row;
    }

    /**
     * Render name cell
     * @param {Object} employee - Employee data
     * @returns {HTMLElement} Cell element
     */
    renderNameCell(employee) {
        const cell = document.createElement('div');
        cell.className = 'data-table-cell cell-name col-name';
        cell.textContent = employee.name || 'Unknown';
        cell.setAttribute('title', employee.name || 'Unknown');
        return cell;
    }

    /**
     * Render title cell
     * @param {Object} employee - Employee data
     * @returns {HTMLElement} Cell element
     */
    renderTitleCell(employee) {
        const cell = document.createElement('div');
        cell.className = 'data-table-cell cell-title col-title';
        cell.textContent = employee.title || 'Unknown';
        cell.setAttribute('title', employee.title || 'Unknown');
        return cell;
    }

    /**
     * Render country cell
     * @param {Object} employee - Employee data
     * @returns {HTMLElement} Cell element
     */
    renderCountryCell(employee) {
        const cell = document.createElement('div');
        cell.className = 'data-table-cell col-country';
        cell.textContent = employee.country || 'Unknown';
        return cell;
    }

    /**
     * Render salary cell
     * @param {Object} employee - Employee data
     * @returns {HTMLElement} Cell element
     */
    renderSalaryCell(employee) {
        const cell = document.createElement('div');
        cell.className = 'data-table-cell cell-salary col-salary';
        
        if (employee.salary) {
            cell.textContent = employee.salary.formatted || `${employee.salary.amount}`;
            
            // Add multi-currency indicator if needed
            if (window.AppState?.currencyAnalysis?.statistics?.uniqueCurrencies > 1) {
                cell.classList.add('multi-currency');
            }
        } else {
            cell.textContent = 'N/A';
        }
        
        return cell;
    }

    /**
     * Render comparatio cell
     * @param {Object} employee - Employee data
     * @returns {HTMLElement} Cell element
     */
    renderComparatioCell(employee) {
        const cell = document.createElement('div');
        cell.className = 'data-table-cell cell-comparatio col-comparatio';
        
        if (employee.comparatio !== null && employee.comparatio !== undefined) {
            cell.textContent = employee.comparatio.toFixed(2);
            
            // Add color coding
            if (employee.comparatio > 1.1) {
                cell.classList.add('high');
            } else if (employee.comparatio < 0.9) {
                cell.classList.add('low');
            }
        } else {
            cell.textContent = 'N/A';
        }
        
        return cell;
    }

    /**
     * Render performance cell
     * @param {Object} employee - Employee data
     * @returns {HTMLElement} Cell element
     */
    renderPerformanceCell(employee) {
        const cell = document.createElement('div');
        cell.className = 'data-table-cell cell-performance col-performance';
        
        if (employee.performanceRating) {
            const badge = document.createElement('span');
            badge.className = 'performance-badge';
            badge.textContent = employee.performanceRating.text;
            
            // Add appropriate class based on rating
            const rating = employee.performanceRating.numeric;
            if (employee.performanceRating.isSuggested) {
                badge.classList.add('performance-suggested');
            } else if (rating >= 4.5) {
                badge.classList.add('performance-outstanding');
            } else if (rating >= 3.5) {
                badge.classList.add('performance-exceeds');
            } else if (rating >= 2.5) {
                badge.classList.add('performance-meets');
            } else {
                badge.classList.add('performance-below');
            }
            
            cell.appendChild(badge);
        } else {
            cell.textContent = 'N/A';
        }
        
        return cell;
    }

    /**
     * Render future talent cell
     * @param {Object} employee - Employee data
     * @returns {HTMLElement} Cell element
     */
    renderFutureTalentCell(employee) {
        const cell = document.createElement('div');
        cell.className = 'data-table-cell cell-future-talent col-future-talent';
        
        if (employee.futureTalent) {
            const badge = document.createElement('span');
            badge.className = 'future-talent-badge';
            badge.textContent = 'HiPo';
            cell.appendChild(badge);
        } else {
            cell.textContent = '-';
        }
        
        return cell;
    }

    /**
     * Render actions cell
     * @param {Object} employee - Employee data
     * @param {number} index - Row index
     * @returns {HTMLElement} Cell element
     */
    renderActionsCell(employee, index) {
        const cell = document.createElement('div');
        cell.className = 'data-table-cell cell-actions col-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit';
        editBtn.setAttribute('data-action', 'edit');
        editBtn.setAttribute('title', 'Edit employee');
        editBtn.textContent = '✏️';
        cell.appendChild(editBtn);
        
        // Merge button (if duplicate)
        if (employee.isDuplicate) {
            const mergeBtn = document.createElement('button');
            mergeBtn.className = 'action-btn merge';
            mergeBtn.setAttribute('data-action', 'merge');
            mergeBtn.setAttribute('title', 'Merge duplicate');
            mergeBtn.textContent = '🔗';
            cell.appendChild(mergeBtn);
        }
        
        return cell;
    }

    /**
     * Check if employee has risk indicators
     * @param {Object} employee - Employee data
     * @returns {boolean} Whether employee has risks
     */
    hasRiskIndicators(employee) {
        return employee.riskIndicators && Object.values(employee.riskIndicators).some(risk => risk);
    }

    /**
     * Sort table by column
     * @param {string} column - Column key
     */
    sort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        this.applySorting();
        this.createHeader(); // Update sort indicators
        this.onSort(column, this.sortDirection);
    }

    /**
     * Apply sorting to filtered data
     */
    applySorting() {
        if (!this.sortColumn) return;
        
        this.filteredData.sort((a, b) => {
            let valueA = this.getSortValue(a, this.sortColumn);
            let valueB = this.getSortValue(b, this.sortColumn);
            
            // Handle null/undefined values
            if (valueA == null && valueB == null) return 0;
            if (valueA == null) return 1;
            if (valueB == null) return -1;
            
            // Compare values
            let result = 0;
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                result = valueA.localeCompare(valueB);
            } else {
                result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            }
            
            return this.sortDirection === 'desc' ? -result : result;
        });
        
        this.virtualScroll.updateData(this.filteredData);
        this.updateInfoBar();
    }

    /**
     * Get sort value for a column
     * @param {Object} employee - Employee data
     * @param {string} column - Column key
     * @returns {*} Sort value
     */
    getSortValue(employee, column) {
        switch (column) {
            case 'name':
                return employee.name?.toLowerCase();
            case 'title':
                return employee.title?.toLowerCase();
            case 'country':
                return employee.country?.toLowerCase();
            case 'salary':
                return employee.salary?.amount || 0;
            case 'comparatio':
                return employee.comparatio || 0;
            case 'performanceRating':
                return employee.performanceRating?.numeric || 0;
            case 'futureTalent':
                return employee.futureTalent ? 1 : 0;
            default:
                return employee[column];
        }
    }

    /**
     * Toggle row selection
     * @param {number} index - Row index
     */
    toggleRowSelection(index) {
        if (this.selectedRows.has(index)) {
            this.selectedRows.delete(index);
        } else {
            this.selectedRows.add(index);
        }
        
        // Re-render the row to update selection state
        const rowElement = this.bodyContainer.querySelector(`[data-index="${index}"]`);
        if (rowElement) {
            rowElement.classList.toggle('selected', this.selectedRows.has(index));
        }
        
        this.updateInfoBar();
        
        // Trigger selection change callback
        if (this.onSelectionChange) {
            this.onSelectionChange(this.getSelectedEmployees());
        }
    }

    /**
     * Select a single row (clear others)
     * @param {number} index - Row index
     */
    selectSingleRow(index) {
        if (index < 0 || index >= this.filteredData.length) return;
        
        // Clear existing selection
        this.clearSelection();
        
        // Select the new row
        this.selectedRows.add(index);
        
        // Update row visual state
        const rowElement = this.bodyContainer.querySelector(`[data-index="${index}"]`);
        if (rowElement) {
            rowElement.classList.add('selected');
        }
        
        this.updateInfoBar();
        
        // Trigger selection change callback
        if (this.onSelectionChange) {
            this.onSelectionChange(this.getSelectedEmployees());
        }
    }

    /**
     * Select a range of rows
     * @param {number} startIndex - Start index
     * @param {number} endIndex - End index
     */
    selectRowRange(startIndex, endIndex) {
        const start = Math.max(0, Math.min(startIndex, endIndex));
        const end = Math.min(this.filteredData.length - 1, Math.max(startIndex, endIndex));
        
        // Clear existing selection
        this.clearSelection();
        
        // Select range
        for (let i = start; i <= end; i++) {
            this.selectedRows.add(i);
            
            // Update row visual state
            const rowElement = this.bodyContainer.querySelector(`[data-index="${i}"]`);
            if (rowElement) {
                rowElement.classList.add('selected');
            }
        }
        
        this.updateInfoBar();
        
        // Trigger selection change callback
        if (this.onSelectionChange) {
            this.onSelectionChange(this.getSelectedEmployees());
        }
    }

    /**
     * Select all visible rows
     */
    selectAllRows() {
        // Clear existing selection
        this.clearSelection();
        
        // Select all rows
        for (let i = 0; i < this.filteredData.length; i++) {
            this.selectedRows.add(i);
            
            // Update row visual state
            const rowElement = this.bodyContainer.querySelector(`[data-index="${i}"]`);
            if (rowElement) {
                rowElement.classList.add('selected');
            }
        }
        
        this.updateInfoBar();
        
        // Trigger selection change callback
        if (this.onSelectionChange) {
            this.onSelectionChange(this.getSelectedEmployees());
        }
    }

    /**
     * Delete selected rows
     */
    deleteSelectedRows() {
        if (this.selectedRows.size === 0) return;
        
        const selectedIndices = Array.from(this.selectedRows).sort((a, b) => b - a);
        const selectedEmployees = selectedIndices.map(index => this.filteredData[index]);
        
        // Confirm deletion
        const confirmMessage = selectedIndices.length === 1 
            ? `Delete ${selectedEmployees[0].name}?`
            : `Delete ${selectedIndices.length} selected employees?`;
            
        if (!confirm(confirmMessage)) return;
        
        // Remove from filtered data (in reverse order to maintain indices)
        selectedIndices.forEach(index => {
            this.filteredData.splice(index, 1);
        });
        
        // Clear selection
        this.clearSelection();
        
        // Re-render table
        this.virtualScroll.updateData(this.filteredData);
        this.updateInfoBar();
        
        // Show notification
        if (window.showNotification) {
            window.showNotification(
                `Deleted ${selectedIndices.length} employee${selectedIndices.length === 1 ? '' : 's'}`,
                'success',
                3000
            );
        }
        
        // Trigger data change callback
        if (this.onDataChange) {
            this.onDataChange(this.filteredData);
        }
    }

    /**
     * Focus a specific row
     * @param {number} index - Row index
     */
    focusRow(index) {
        if (index < 0 || index >= this.filteredData.length) return;
        
        this.virtualScroll.scrollToItem(index, 'center');
        
        setTimeout(() => {
            const rowElement = this.bodyContainer.querySelector(`[data-index="${index}"]`);
            if (rowElement) {
                rowElement.focus();
            }
        }, 100);
    }

    /**
     * Handle scroll events
     * @param {number} scrollTop - Scroll position
     */
    handleScroll(scrollTop) {
        this.updateInfoBar();
    }

    /**
     * Update info bar
     */
    updateInfoBar() {
        const totalCount = this.data.length;
        const filteredCount = this.filteredData.length;
        const selectedCount = this.selectedRows.size;
        
        let countText = `${filteredCount.toLocaleString()} employees`;
        if (filteredCount !== totalCount) {
            countText += ` (filtered from ${totalCount.toLocaleString()})`;
        }
        if (selectedCount > 0) {
            countText += `, ${selectedCount} selected`;
        }
        
        const scrollPercentage = this.virtualScroll ? this.virtualScroll.getScrollPercentage() : 0;
        const scrollText = `${Math.round(scrollPercentage)}% scrolled`;
        
        this.infoBar.innerHTML = `
            <div class="data-table-count">${countText}</div>
            <div class="data-table-scroll-info">${scrollText}</div>
        `;
    }

    /**
     * Update table data
     * @param {Array} data - New data array
     */
    updateData(data) {
        this.data = data || [];
        this.filteredData = [...this.data];
        this.selectedRows.clear();
        this.lastSelectedIndex = null;
        
        if (this.sortColumn) {
            this.applySorting();
        } else {
            this.virtualScroll.updateData(this.filteredData);
        }
        
        this.updateInfoBar();
    }

    /**
     * Apply filters to data
     * @param {Array} filteredData - Filtered data array
     */
    applyFilters(filteredData) {
        this.filteredData = filteredData || [];
        this.selectedRows.clear();
        this.lastSelectedIndex = null;
        
        if (this.sortColumn) {
            this.applySorting();
        } else {
            this.virtualScroll.updateData(this.filteredData);
        }
        
        this.updateInfoBar();
    }

    /**
     * Get selected employees
     * @returns {Array} Selected employee data
     */
    getSelectedEmployees() {
        return Array.from(this.selectedRows).map(index => this.filteredData[index]);
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedRows.clear();
        this.lastSelectedIndex = null;
        this.bodyContainer.querySelectorAll('.data-table-row.selected').forEach(row => {
            row.classList.remove('selected');
        });
        this.updateInfoBar();
        
        // Trigger selection change callback
        if (this.onSelectionChange) {
            this.onSelectionChange([]);
        }
    }

    /**
     * Delete row
     * @param {number} index - Row index
     */
    deleteRow(index) {
        if (confirm('Are you sure you want to delete this employee?')) {
            this.filteredData.splice(index, 1);
            this.virtualScroll.updateData(this.filteredData);
            this.updateInfoBar();
        }
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        this.bodyContainer.innerHTML = `
            <div class="data-table-empty">
                <div class="data-table-empty-icon">📊</div>
                <div class="data-table-empty-title">No Data Available</div>
                <div class="data-table-empty-message">Upload a CSV file to view employee data</div>
            </div>
        `;
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.bodyContainer.innerHTML = `
            <div class="data-table-loading">
                <div class="data-table-loading-spinner"></div>
                <div>Loading employee data...</div>
            </div>
        `;
    }

    /**
     * Destroy the data table
     */
    destroy() {
        if (this.virtualScroll) {
            this.virtualScroll.destroy();
        }
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
window.DataTable = DataTable; 