/**
 * Virtual Scrolling Utility
 * 
 * Provides efficient rendering for large datasets by only rendering
 * visible items and a small buffer around them.
 */

class VirtualScroll {
    constructor(options = {}) {
        this.container = options.container;
        this.itemHeight = options.itemHeight || 50;
        this.bufferSize = options.bufferSize || 10;
        this.data = options.data || [];
        this.renderItem = options.renderItem || this.defaultRenderItem;
        this.onScroll = options.onScroll || (() => {});
        
        // State
        this.scrollTop = 0;
        this.containerHeight = 0;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.renderedItems = new Map();
        
        // DOM elements
        this.viewport = null;
        this.content = null;
        this.spacerBefore = null;
        this.spacerAfter = null;
        
        this.init();
    }

    /**
     * Initialize the virtual scroll container
     */
    init() {
        if (!this.container) {
            throw new Error('Container element is required for virtual scrolling');
        }

        console.log('🔍 VirtualScroll init - container:', this.container);
        console.log('🔍 VirtualScroll init - data length:', this.data.length);
        console.log('🔍 VirtualScroll init - itemHeight:', this.itemHeight);

        // Create viewport structure
        this.createViewport();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial render
        this.updateVisibleRange();
        this.render();
        
        console.log('✅ VirtualScroll initialized');
    }

    /**
     * Create the viewport DOM structure
     */
    createViewport() {
        // Clear container
        this.container.innerHTML = '';
        
        // Create viewport
        this.viewport = document.createElement('div');
        this.viewport.className = 'virtual-scroll-viewport';
        this.viewport.style.cssText = `
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
        `;
        
        // Create content container
        this.content = document.createElement('div');
        this.content.className = 'virtual-scroll-content';
        this.content.style.cssText = `
            position: relative;
            height: ${this.getTotalHeight()}px;
        `;
        
        // Create spacers
        this.spacerBefore = document.createElement('div');
        this.spacerBefore.className = 'virtual-scroll-spacer-before';
        
        this.spacerAfter = document.createElement('div');
        this.spacerAfter.className = 'virtual-scroll-spacer-after';
        
        // Assemble structure
        this.content.appendChild(this.spacerBefore);
        this.content.appendChild(this.spacerAfter);
        this.viewport.appendChild(this.content);
        this.container.appendChild(this.viewport);
        
        // Update container height
        this.containerHeight = this.viewport.clientHeight;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.viewport.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        this.scrollTop = this.viewport.scrollTop;
        this.updateVisibleRange();
        this.render();
        this.onScroll(this.scrollTop);
    }

    /**
     * Handle resize events
     */
    handleResize() {
        this.containerHeight = this.viewport.clientHeight;
        this.updateVisibleRange();
        this.render();
    }

    /**
     * Update the visible range based on scroll position
     */
    updateVisibleRange() {
        const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
        const scrolledItems = Math.floor(this.scrollTop / this.itemHeight);
        
        this.visibleStart = Math.max(0, scrolledItems - this.bufferSize);
        this.visibleEnd = Math.min(
            this.data.length - 1,
            scrolledItems + visibleCount + this.bufferSize
        );
    }

    /**
     * Render visible items
     */
    render() {
        console.log('🔍 VirtualScroll render - visibleStart:', this.visibleStart, 'visibleEnd:', this.visibleEnd);
        console.log('🔍 VirtualScroll render - data length:', this.data.length);
        
        // Remove items that are no longer visible
        this.cleanupInvisibleItems();
        
        // Render visible items
        for (let i = this.visibleStart; i <= this.visibleEnd; i++) {
            if (!this.renderedItems.has(i)) {
                console.log('🔍 VirtualScroll rendering item at index:', i);
                this.renderItemAt(i);
            }
        }
        
        // Update spacers
        this.updateSpacers();
        
        console.log('✅ VirtualScroll render completed - rendered items:', this.renderedItems.size);
    }

    /**
     * Render item at specific index
     * @param {number} index - Item index
     */
    renderItemAt(index) {
        if (index < 0 || index >= this.data.length) {
            console.log('🔍 VirtualScroll renderItemAt - index out of bounds:', index, 'data length:', this.data.length);
            return;
        }
        
        const item = this.data[index];
        console.log('🔍 VirtualScroll renderItemAt - item:', item);
        console.log('🔍 VirtualScroll renderItemAt - renderItem function:', typeof this.renderItem);
        
        const element = this.renderItem(item, index);
        console.log('🔍 VirtualScroll renderItemAt - element created:', !!element);
        
        if (element) {
            element.style.cssText = `
                position: absolute;
                top: ${index * this.itemHeight}px;
                left: 0;
                right: 0;
                height: ${this.itemHeight}px;
                box-sizing: border-box;
            `;
            
            element.setAttribute('data-index', index);
            this.content.appendChild(element);
            this.renderedItems.set(index, element);
            console.log('✅ VirtualScroll renderItemAt - element added to DOM');
        } else {
            console.error('❌ VirtualScroll renderItemAt - renderItem returned null/undefined');
        }
    }

    /**
     * Remove items that are no longer visible
     */
    cleanupInvisibleItems() {
        const toRemove = [];
        
        for (const [index, element] of this.renderedItems) {
            if (index < this.visibleStart || index > this.visibleEnd) {
                toRemove.push(index);
                element.remove();
            }
        }
        
        toRemove.forEach(index => this.renderedItems.delete(index));
    }

    /**
     * Update spacer heights to maintain scroll position
     */
    updateSpacers() {
        const beforeHeight = this.visibleStart * this.itemHeight;
        const afterHeight = (this.data.length - this.visibleEnd - 1) * this.itemHeight;
        
        this.spacerBefore.style.height = `${beforeHeight}px`;
        this.spacerAfter.style.height = `${afterHeight}px`;
    }

    /**
     * Get total height of all items
     * @returns {number} Total height in pixels
     */
    getTotalHeight() {
        return this.data.length * this.itemHeight;
    }

    /**
     * Default item renderer
     * @param {*} item - Data item
     * @param {number} index - Item index
     * @returns {HTMLElement} Rendered element
     */
    defaultRenderItem(item, index) {
        const div = document.createElement('div');
        div.textContent = `Item ${index}: ${JSON.stringify(item)}`;
        div.style.cssText = `
            padding: 10px;
            border-bottom: 1px solid #eee;
            background: white;
        `;
        return div;
    }

    /**
     * Update data and re-render
     * @param {Array} newData - New data array
     */
    updateData(newData) {
        this.data = newData;
        this.clearRenderedItems();
        this.content.style.height = `${this.getTotalHeight()}px`;
        this.updateVisibleRange();
        this.render();
    }

    /**
     * Clear all rendered items
     */
    clearRenderedItems() {
        this.renderedItems.forEach(element => element.remove());
        this.renderedItems.clear();
    }

    /**
     * Scroll to specific item
     * @param {number} index - Item index to scroll to
     * @param {string} position - Scroll position ('start', 'center', 'end')
     */
    scrollToItem(index, position = 'start') {
        if (index < 0 || index >= this.data.length) return;
        
        let scrollTop = index * this.itemHeight;
        
        switch (position) {
            case 'center':
                scrollTop -= this.containerHeight / 2 - this.itemHeight / 2;
                break;
            case 'end':
                scrollTop -= this.containerHeight - this.itemHeight;
                break;
        }
        
        scrollTop = Math.max(0, Math.min(scrollTop, this.getTotalHeight() - this.containerHeight));
        this.viewport.scrollTop = scrollTop;
    }

    /**
     * Get currently visible items
     * @returns {Array} Array of visible items with their indices
     */
    getVisibleItems() {
        const visible = [];
        for (let i = this.visibleStart; i <= this.visibleEnd; i++) {
            if (i >= 0 && i < this.data.length) {
                visible.push({
                    index: i,
                    item: this.data[i]
                });
            }
        }
        return visible;
    }

    /**
     * Update item height and re-render
     * @param {number} newHeight - New item height
     */
    updateItemHeight(newHeight) {
        this.itemHeight = newHeight;
        this.clearRenderedItems();
        this.content.style.height = `${this.getTotalHeight()}px`;
        this.updateVisibleRange();
        this.render();
    }

    /**
     * Destroy the virtual scroll instance
     */
    destroy() {
        this.clearRenderedItems();
        this.viewport?.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        this.container.innerHTML = '';
    }

    /**
     * Get scroll position as percentage
     * @returns {number} Scroll percentage (0-100)
     */
    getScrollPercentage() {
        const maxScroll = this.getTotalHeight() - this.containerHeight;
        return maxScroll > 0 ? (this.scrollTop / maxScroll) * 100 : 0;
    }

    /**
     * Set scroll position by percentage
     * @param {number} percentage - Scroll percentage (0-100)
     */
    setScrollPercentage(percentage) {
        const maxScroll = this.getTotalHeight() - this.containerHeight;
        const scrollTop = (percentage / 100) * maxScroll;
        this.viewport.scrollTop = Math.max(0, Math.min(scrollTop, maxScroll));
    }
}

// Export for use in other modules
window.VirtualScroll = VirtualScroll; 