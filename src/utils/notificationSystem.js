/**
 * Enhanced Notification System
 * 
 * Provides rich, interactive notifications for the Team Analyzer application.
 * Supports different notification types, priorities, actions, and advanced features
 * like stacking, queuing, and persistence.
 * 
 * Features:
 * - Multiple notification types (success, error, warning, info)
 * - Priority-based queuing and display
 * - Interactive notifications with action buttons
 * - Notification stacking and grouping
 * - Persistent notifications that survive page reloads
 * - Progress notifications for long-running operations
 * - Toast notifications with auto-dismiss
 * - Sound notifications (optional)
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.isInitialized = false;
        this.soundEnabled = false;
        
        // Notification types with their configurations
        this.types = {
            SUCCESS: {
                name: 'success',
                icon: '✅',
                color: '#28a745',
                sound: 'success.mp3',
                defaultDuration: 4000
            },
            ERROR: {
                name: 'error',
                icon: '❌',
                color: '#dc3545',
                sound: 'error.mp3',
                defaultDuration: 8000
            },
            WARNING: {
                name: 'warning',
                icon: '⚠️',
                color: '#ffc107',
                sound: 'warning.mp3',
                defaultDuration: 6000
            },
            INFO: {
                name: 'info',
                icon: 'ℹ️',
                color: '#17a2b8',
                sound: 'info.mp3',
                defaultDuration: 5000
            },
            PROGRESS: {
                name: 'progress',
                icon: '⏳',
                color: '#6c757d',
                sound: null,
                defaultDuration: 0 // Persistent until manually dismissed
            }
        };
        
        // Priority levels
        this.priorities = {
            LOW: 1,
            NORMAL: 2,
            HIGH: 3,
            CRITICAL: 4
        };
        
        this.init();
    }

    /**
     * Initialize the notification system
     */
    init() {
        if (this.isInitialized) return;
        
        this.createContainer();
        this.loadPersistentNotifications();
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('Enhanced Notification System initialized');
    }

    /**
     * Create the notifications container
     */
    createContainer() {
        // Remove existing container if it exists
        const existingContainer = document.getElementById('notifications');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        this.container = document.createElement('div');
        this.container.id = 'notifications';
        this.container.className = 'notifications-container enhanced';
        
        // Add container styles
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            max-width: 400px;
            pointer-events: none;
        `;
        
        document.body.appendChild(this.container);
    }

    /**
     * Show a notification
     * @param {string} message - The notification message
     * @param {string} type - Notification type (success, error, warning, info, progress)
     * @param {Object} options - Additional options
     */
    show(message, type = 'info', options = {}) {
        const notificationType = this.types[type.toUpperCase()] || this.types.INFO;
        
        const notification = {
            id: this.generateId(),
            message,
            type: notificationType,
            priority: options.priority || this.priorities.NORMAL,
            duration: options.duration !== undefined ? options.duration : notificationType.defaultDuration,
            persistent: options.persistent || false,
            actions: options.actions || [],
            progress: options.progress || null,
            groupId: options.groupId || null,
            timestamp: Date.now(),
            dismissed: false,
            ...options
        };
        
        // Add to notifications array
        this.notifications.push(notification);
        
        // Sort by priority and timestamp
        this.sortNotifications();
        
        // Render the notification
        this.renderNotification(notification);
        
        // Play sound if enabled
        if (this.soundEnabled && notificationType.sound) {
            this.playSound(notificationType.sound);
        }
        
        // Auto-dismiss if duration is set
        if (notification.duration > 0) {
            setTimeout(() => {
                this.dismiss(notification.id);
            }, notification.duration);
        }
        
        // Manage notification count
        this.manageNotificationCount();
        
        // Save persistent notifications
        if (notification.persistent) {
            this.savePersistentNotifications();
        }
        
        return notification.id;
    }

    /**
     * Show a success notification
     * @param {string} message - Success message
     * @param {Object} options - Additional options
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    /**
     * Show an error notification
     * @param {string} message - Error message
     * @param {Object} options - Additional options
     */
    error(message, options = {}) {
        return this.show(message, 'error', {
            priority: this.priorities.HIGH,
            ...options
        });
    }

    /**
     * Show a warning notification
     * @param {string} message - Warning message
     * @param {Object} options - Additional options
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    /**
     * Show an info notification
     * @param {string} message - Info message
     * @param {Object} options - Additional options
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * Show a progress notification
     * @param {string} message - Progress message
     * @param {number} progress - Progress percentage (0-100)
     * @param {Object} options - Additional options
     */
    progress(message, progress = 0, options = {}) {
        return this.show(message, 'progress', {
            progress: Math.max(0, Math.min(100, progress)),
            persistent: true,
            ...options
        });
    }

    /**
     * Update a progress notification
     * @param {string} id - Notification ID
     * @param {number} progress - New progress percentage
     * @param {string} message - Optional new message
     */
    updateProgress(id, progress, message = null) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && notification.type.name === 'progress') {
            notification.progress = Math.max(0, Math.min(100, progress));
            if (message) {
                notification.message = message;
            }
            
            // Re-render the notification
            this.renderNotification(notification);
            
            // Auto-dismiss when complete
            if (progress >= 100) {
                setTimeout(() => {
                    this.dismiss(id);
                }, 2000);
            }
        }
    }

    /**
     * Render a notification element
     * @param {Object} notification - Notification object
     */
    renderNotification(notification) {
        // Remove existing element if it exists
        const existingElement = document.getElementById(`notification-${notification.id}`);
        if (existingElement) {
            existingElement.remove();
        }
        
        const element = document.createElement('div');
        element.id = `notification-${notification.id}`;
        element.className = `notification enhanced ${notification.type.name}`;
        element.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 1rem 1.5rem;
            margin-bottom: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-left: 4px solid ${notification.type.color};
            animation: slideIn 0.3s ease;
            pointer-events: auto;
            position: relative;
            max-width: 100%;
            word-wrap: break-word;
        `;
        
        // Create notification content
        let content = `
            <div class="notification-header" style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                <span class="notification-icon" style="margin-right: 0.5rem; font-size: 1.2rem;">
                    ${notification.type.icon}
                </span>
                <span class="notification-title" style="font-weight: 600; color: #495057;">
                    ${this.getTypeTitle(notification.type.name)}
                </span>
                <button class="notification-close" style="
                    margin-left: auto;
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: #6c757d;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                " onclick="window.notificationSystem.dismiss('${notification.id}')">×</button>
            </div>
            <div class="notification-message" style="color: #495057; margin-bottom: 0.5rem;">
                ${notification.message}
            </div>
        `;
        
        // Add progress bar if it's a progress notification
        if (notification.type.name === 'progress' && notification.progress !== null) {
            content += `
                <div class="notification-progress" style="margin-bottom: 0.5rem;">
                    <div class="progress-bar" style="
                        background: #e9ecef;
                        border-radius: 4px;
                        height: 6px;
                        overflow: hidden;
                    ">
                        <div class="progress-fill" style="
                            background: ${notification.type.color};
                            height: 100%;
                            width: ${notification.progress}%;
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                    <div class="progress-text" style="
                        font-size: 0.8rem;
                        color: #6c757d;
                        text-align: center;
                        margin-top: 0.25rem;
                    ">${notification.progress}%</div>
                </div>
            `;
        }
        
        // Add action buttons if any
        if (notification.actions && notification.actions.length > 0) {
            content += '<div class="notification-actions" style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">';
            notification.actions.forEach(action => {
                content += `
                    <button class="notification-action" style="
                        background: ${action.primary ? notification.type.color : 'transparent'};
                        color: ${action.primary ? 'white' : notification.type.color};
                        border: 1px solid ${notification.type.color};
                        border-radius: 4px;
                        padding: 0.25rem 0.75rem;
                        font-size: 0.8rem;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    " onclick="window.notificationSystem.handleAction('${notification.id}', '${action.id}')">
                        ${action.label}
                    </button>
                `;
            });
            content += '</div>';
        }
        
        // Add timestamp for persistent notifications
        if (notification.persistent) {
            const timeString = new Date(notification.timestamp).toLocaleTimeString();
            content += `
                <div class="notification-timestamp" style="
                    font-size: 0.7rem;
                    color: #6c757d;
                    margin-top: 0.5rem;
                    text-align: right;
                ">${timeString}</div>
            `;
        }
        
        element.innerHTML = content;
        
        // Insert at the correct position based on priority
        this.insertNotificationElement(element, notification);
    }

    /**
     * Insert notification element at correct position
     * @param {HTMLElement} element - Notification element
     * @param {Object} notification - Notification object
     */
    insertNotificationElement(element, notification) {
        const existingNotifications = Array.from(this.container.children);
        let insertIndex = 0;
        
        // Find correct position based on priority
        for (let i = 0; i < existingNotifications.length; i++) {
            const existingId = existingNotifications[i].id.replace('notification-', '');
            const existingNotification = this.notifications.find(n => n.id === existingId);
            
            if (existingNotification && notification.priority > existingNotification.priority) {
                insertIndex = i;
                break;
            }
            insertIndex = i + 1;
        }
        
        if (insertIndex >= existingNotifications.length) {
            this.container.appendChild(element);
        } else {
            this.container.insertBefore(element, existingNotifications[insertIndex]);
        }
    }

    /**
     * Dismiss a notification
     * @param {string} id - Notification ID
     */
    dismiss(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification || notification.dismissed) return;
        
        notification.dismissed = true;
        
        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        }
        
        // Remove from notifications array
        this.notifications = this.notifications.filter(n => n.id !== id);
        
        // Update persistent notifications
        this.savePersistentNotifications();
    }

    /**
     * Dismiss all notifications
     */
    dismissAll() {
        this.notifications.forEach(notification => {
            this.dismiss(notification.id);
        });
    }

    /**
     * Handle action button clicks
     * @param {string} notificationId - Notification ID
     * @param {string} actionId - Action ID
     */
    handleAction(notificationId, actionId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        const action = notification.actions.find(a => a.id === actionId);
        if (!action) return;
        
        // Execute action callback
        if (action.callback && typeof action.callback === 'function') {
            action.callback(notification, action);
        }
        
        // Dismiss notification if action specifies
        if (action.dismiss !== false) {
            this.dismiss(notificationId);
        }
    }

    /**
     * Sort notifications by priority and timestamp
     */
    sortNotifications() {
        this.notifications.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority; // Higher priority first
            }
            return b.timestamp - a.timestamp; // Newer first
        });
    }

    /**
     * Manage notification count to prevent overflow
     */
    manageNotificationCount() {
        const visibleNotifications = this.notifications.filter(n => !n.dismissed);
        
        if (visibleNotifications.length > this.maxNotifications) {
            // Remove oldest, lowest priority notifications
            const toRemove = visibleNotifications
                .sort((a, b) => a.priority - b.priority || a.timestamp - b.timestamp)
                .slice(0, visibleNotifications.length - this.maxNotifications);
            
            toRemove.forEach(notification => {
                this.dismiss(notification.id);
            });
        }
    }

    /**
     * Get type title for display
     * @param {string} type - Notification type
     * @returns {string} Display title
     */
    getTypeTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information',
            progress: 'Progress'
        };
        return titles[type] || 'Notification';
    }

    /**
     * Generate unique notification ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Play notification sound
     * @param {string} soundFile - Sound file name
     */
    playSound(soundFile) {
        try {
            const audio = new Audio(`/sounds/${soundFile}`);
            audio.volume = 0.3;
            audio.play().catch(e => {
                // Ignore audio play errors (user interaction required)
            });
        } catch (e) {
            // Ignore audio errors
        }
    }

    /**
     * Enable/disable sound notifications
     * @param {boolean} enabled - Whether to enable sounds
     */
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('teamAnalyzer_soundEnabled', enabled.toString());
    }

    /**
     * Save persistent notifications to localStorage
     */
    savePersistentNotifications() {
        const persistentNotifications = this.notifications.filter(n => n.persistent && !n.dismissed);
        try {
            localStorage.setItem('teamAnalyzer_persistentNotifications', JSON.stringify(persistentNotifications));
        } catch (e) {
            console.warn('Could not save persistent notifications:', e);
        }
    }

    /**
     * Load persistent notifications from localStorage
     */
    loadPersistentNotifications() {
        try {
            const saved = localStorage.getItem('teamAnalyzer_persistentNotifications');
            if (saved) {
                const persistentNotifications = JSON.parse(saved);
                
                // Filter out old notifications (older than 24 hours)
                const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
                const validNotifications = persistentNotifications.filter(n => n.timestamp > dayAgo);
                
                // Add to current notifications and render
                validNotifications.forEach(notification => {
                    this.notifications.push(notification);
                    this.renderNotification(notification);
                });
                
                // Update saved notifications
                if (validNotifications.length !== persistentNotifications.length) {
                    this.savePersistentNotifications();
                }
            }
            
            // Load sound preference
            const soundEnabled = localStorage.getItem('teamAnalyzer_soundEnabled');
            if (soundEnabled !== null) {
                this.soundEnabled = soundEnabled === 'true';
            }
        } catch (e) {
            console.warn('Could not load persistent notifications:', e);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .notification-action:hover {
                opacity: 0.8;
                transform: translateY(-1px);
            }
            
            .notification-close:hover {
                background: rgba(0,0,0,0.1) !important;
                border-radius: 50%;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Get notification statistics
     * @returns {Object} Statistics
     */
    getStats() {
        const typeStats = {};
        const priorityStats = {};
        
        this.notifications.forEach(notification => {
            typeStats[notification.type.name] = (typeStats[notification.type.name] || 0) + 1;
            priorityStats[notification.priority] = (priorityStats[notification.priority] || 0) + 1;
        });
        
        return {
            total: this.notifications.length,
            visible: this.notifications.filter(n => !n.dismissed).length,
            persistent: this.notifications.filter(n => n.persistent).length,
            typeStats,
            priorityStats
        };
    }
}

// Create global instance
const notificationSystem = new NotificationSystem();

// Create backward-compatible global function
window.showNotification = (message, type = 'info', duration = 5000) => {
    return notificationSystem.show(message, type, { duration });
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
} else {
    window.NotificationSystem = NotificationSystem;
    window.notificationSystem = notificationSystem;
}