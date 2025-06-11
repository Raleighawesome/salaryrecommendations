/**
 * FileUpload Component
 * 
 * Handles CSV file upload with drag-and-drop functionality,
 * progress indication, and file validation.
 */

class FileUpload {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.onFileProcessed = null; // Callback for when file is processed
        this.maxFileSize = 50 * 1024 * 1024; // 50MB limit
        this.allowedTypes = ['.csv', 'text/csv', 'application/csv'];
        
        this.init();
    }

    /**
     * Initialize the file upload component
     */
    init() {
        if (!this.container) {
            console.error('FileUpload: Container not found');
            return;
        }

        this.render();
        this.attachEventListeners();
    }

    /**
     * Render the file upload UI
     */
    render() {
        this.container.innerHTML = `
            <div class="file-upload-wrapper">
                <div class="file-upload-area" id="file-drop-zone">
                    <div class="file-upload-content">
                        <div class="file-upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14,2 14,8 20,8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10,9 9,9 8,9"></polyline>
                            </svg>
                        </div>
                        <h3>Upload Your Team CSV File</h3>
                        <p class="upload-description">
                            Drag and drop your CSV file here, or click to browse
                        </p>
                        <p class="upload-requirements">
                            Supports CSV files up to 50MB with employee data
                        </p>
                        <button type="button" class="upload-button" id="file-browse-btn">
                            Choose File
                        </button>
                        <input type="file" id="file-input" accept=".csv" style="display: none;">
                    </div>
                </div>

                <!-- Progress Section (initially hidden) -->
                <div class="upload-progress-section hidden" id="upload-progress">
                    <div class="progress-info">
                        <div class="progress-header">
                            <span class="progress-filename" id="progress-filename"></span>
                            <span class="progress-percentage" id="progress-percentage">0%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="progress-bar"></div>
                        </div>
                        <div class="progress-status" id="progress-status">Preparing to upload...</div>
                    </div>
                    <button type="button" class="cancel-button" id="cancel-upload">Cancel</button>
                </div>

                <!-- File Info Section (shown after successful upload) -->
                <div class="file-info-section hidden" id="file-info">
                    <div class="file-info-content">
                        <div class="file-info-icon success">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                        </div>
                        <div class="file-info-details">
                            <h4 id="uploaded-filename">File uploaded successfully</h4>
                            <p id="file-stats">Processing file information...</p>
                        </div>
                        <button type="button" class="upload-another-button" id="upload-another">
                            Upload Different File
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    /**
     * Add component-specific styles
     */
    addStyles() {
        if (document.getElementById('file-upload-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'file-upload-styles';
        styles.textContent = `
            .file-upload-wrapper {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
            }

            .file-upload-area {
                border: 2px dashed #cbd5e0;
                border-radius: 12px;
                padding: 3rem 2rem;
                text-align: center;
                background: #f8f9fa;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .file-upload-area:hover,
            .file-upload-area.drag-over {
                border-color: #667eea;
                background: #f0f4ff;
                transform: translateY(-2px);
            }

            .file-upload-content h3 {
                color: #2d3748;
                margin: 1rem 0 0.5rem 0;
                font-size: 1.25rem;
                font-weight: 600;
            }

            .file-upload-icon {
                color: #667eea;
                margin-bottom: 1rem;
            }

            .upload-description {
                color: #4a5568;
                margin-bottom: 0.5rem;
                font-size: 1rem;
            }

            .upload-requirements {
                color: #718096;
                font-size: 0.875rem;
                margin-bottom: 1.5rem;
            }

            .upload-button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .upload-button:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .upload-progress-section {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 1.5rem;
                margin-top: 1rem;
            }

            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .progress-filename {
                font-weight: 500;
                color: #2d3748;
                font-size: 0.9rem;
            }

            .progress-percentage {
                font-weight: 600;
                color: #667eea;
                font-size: 0.9rem;
            }

            .progress-bar-container {
                width: 100%;
                height: 8px;
                background: #e2e8f0;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 0.5rem;
            }

            .progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                width: 0%;
                transition: width 0.3s ease;
                border-radius: 4px;
            }

            .progress-status {
                font-size: 0.875rem;
                color: #718096;
                margin-bottom: 1rem;
            }

            .cancel-button {
                background: #e53e3e;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-size: 0.875rem;
                cursor: pointer;
                transition: background 0.3s ease;
            }

            .cancel-button:hover {
                background: #c53030;
            }

            .file-info-section {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 1.5rem;
                margin-top: 1rem;
            }

            .file-info-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .file-info-icon.success {
                width: 40px;
                height: 40px;
                background: #48bb78;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .file-info-details {
                flex: 1;
            }

            .file-info-details h4 {
                color: #2d3748;
                margin: 0 0 0.25rem 0;
                font-size: 1rem;
                font-weight: 600;
            }

            .file-info-details p {
                color: #718096;
                margin: 0;
                font-size: 0.875rem;
            }

            .upload-another-button {
                background: #667eea;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-size: 0.875rem;
                cursor: pointer;
                transition: background 0.3s ease;
            }

            .upload-another-button:hover {
                background: #5a67d8;
            }

            @media (max-width: 768px) {
                .file-upload-area {
                    padding: 2rem 1rem;
                }

                .file-info-content {
                    flex-direction: column;
                    text-align: center;
                    gap: 1rem;
                }

                .upload-another-button {
                    margin-top: 0.5rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const dropZone = document.getElementById('file-drop-zone');
        const fileInput = document.getElementById('file-input');
        const browseBtn = document.getElementById('file-browse-btn');
        const cancelBtn = document.getElementById('cancel-upload');
        const uploadAnotherBtn = document.getElementById('upload-another');

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });

        // Browse button click
        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        // Click to browse
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        // Cancel upload
        cancelBtn.addEventListener('click', () => {
            this.cancelUpload();
        });

        // Upload another file
        uploadAnotherBtn.addEventListener('click', () => {
            this.resetUpload();
        });
    }

    /**
     * Handle file selection and validation
     * @param {File} file - The selected file
     */
    handleFile(file) {
        // Validate file type
        if (!this.isValidFileType(file)) {
            window.TeamAnalyzer.showNotification(
                'Please select a valid CSV file.',
                'error'
            );
            return;
        }

        // Validate file size
        if (file.size > this.maxFileSize) {
            window.TeamAnalyzer.showNotification(
                `File size (${this.formatFileSize(file.size)}) exceeds the 50MB limit.`,
                'error'
            );
            return;
        }

        // Start processing
        this.processFile(file);
    }

    /**
     * Validate file type
     * @param {File} file - The file to validate
     * @returns {boolean} Whether the file type is valid
     */
    isValidFileType(file) {
        const fileName = file.name.toLowerCase();
        const fileType = file.type.toLowerCase();
        
        return fileName.endsWith('.csv') || 
               this.allowedTypes.includes(fileType) ||
               fileType.includes('csv');
    }

    /**
     * Process the uploaded file
     * @param {File} file - The file to process
     */
    async processFile(file) {
        try {
            // Show progress section
            this.showProgressSection(file.name);
            
            // Simulate file reading progress
            await this.simulateProgress();
            
            // Read file content
            const content = await this.readFileContent(file);
            
            // Show completion
            this.showFileInfo(file, content);
            
            // Notify parent component
            if (this.onFileProcessed) {
                this.onFileProcessed(file, content);
            }
            
        } catch (error) {
            console.error('File processing error:', error);
            window.TeamAnalyzer.handleError(error, 'File Upload');
            this.resetUpload();
        }
    }

    /**
     * Read file content as text
     * @param {File} file - The file to read
     * @returns {Promise<string>} File content
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Simulate upload progress for better UX
     */
    async simulateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const progressPercentage = document.getElementById('progress-percentage');
        const progressStatus = document.getElementById('progress-status');
        
        const steps = [
            { progress: 20, status: 'Reading file...' },
            { progress: 50, status: 'Validating format...' },
            { progress: 80, status: 'Processing data...' },
            { progress: 100, status: 'Complete!' }
        ];
        
        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            progressBar.style.width = `${step.progress}%`;
            progressPercentage.textContent = `${step.progress}%`;
            progressStatus.textContent = step.status;
        }
    }

    /**
     * Show progress section
     * @param {string} filename - Name of the file being processed
     */
    showProgressSection(filename) {
        const uploadArea = document.getElementById('file-drop-zone');
        const progressSection = document.getElementById('upload-progress');
        const filenameElement = document.getElementById('progress-filename');
        
        uploadArea.style.display = 'none';
        progressSection.classList.remove('hidden');
        filenameElement.textContent = filename;
    }

    /**
     * Show file info after successful upload
     * @param {File} file - The uploaded file
     * @param {string} content - File content
     */
    showFileInfo(file, content) {
        const progressSection = document.getElementById('upload-progress');
        const fileInfoSection = document.getElementById('file-info');
        const filenameElement = document.getElementById('uploaded-filename');
        const statsElement = document.getElementById('file-stats');
        
        // Calculate basic stats
        const lines = content.split('\n').length - 1; // Subtract header
        const fileSize = this.formatFileSize(file.size);
        
        progressSection.classList.add('hidden');
        fileInfoSection.classList.remove('hidden');
        filenameElement.textContent = file.name;
        statsElement.textContent = `${lines} employees • ${fileSize} • Uploaded successfully`;
        
        window.TeamAnalyzer.showNotification(
            `Successfully uploaded ${file.name} with ${lines} employees`,
            'success'
        );
    }

    /**
     * Cancel file upload
     */
    cancelUpload() {
        this.resetUpload();
        window.TeamAnalyzer.showNotification('Upload cancelled', 'warning');
    }

    /**
     * Reset upload component to initial state
     */
    resetUpload() {
        const uploadArea = document.getElementById('file-drop-zone');
        const progressSection = document.getElementById('upload-progress');
        const fileInfoSection = document.getElementById('file-info');
        const fileInput = document.getElementById('file-input');
        
        uploadArea.style.display = 'block';
        progressSection.classList.add('hidden');
        fileInfoSection.classList.add('hidden');
        
        if (fileInput) fileInput.value = '';
        
        // Reset progress
        const progressBar = document.getElementById('progress-bar');
        const progressPercentage = document.getElementById('progress-percentage');
        const progressStatus = document.getElementById('progress-status');
        
        if (progressBar) progressBar.style.width = '0%';
        if (progressPercentage) progressPercentage.textContent = '0%';
        if (progressStatus) progressStatus.textContent = 'Preparing to upload...';
    }

    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Set callback for when file is processed
     * @param {Function} callback - Callback function
     */
    setOnFileProcessed(callback) {
        this.onFileProcessed = callback;
    }
}

// Export for use in other modules
window.FileUpload = FileUpload; 