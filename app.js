class HealthDashboard {
    constructor() {
        this.currentView = 'user-data';
        this.apiConfig = {
            baseURL: window.location.hostname === 'localhost' ? 'http://localhost:3000' : '/api',
            endpoints: {
                submissions: '/api/submissions'
            }
        };
        this.init();
    }

    init() {
        this.initNavigation();
        this.initThemeToggle();
        this.initUserDataForm();
        this.loadUserRecords();
        this.switchView('user-data'); // Start with user-data view
    }

    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const views = document.querySelectorAll('.view');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetView = link.dataset.view;
                this.switchView(targetView);

                navLinks.forEach(nl => nl.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    switchView(viewName) {
        const views = document.querySelectorAll('.view');
        const pageTitle = document.getElementById('page-title');

        views.forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }

        const titles = {
            dashboard: 'Health Dashboard',
            analytics: 'Analytics & Trends',
            academic: 'Academic Integration',
            lifestyle: 'Lifestyle Tracking',
            alerts: 'Alerts & Notifications',
            reports: 'Reports & Insights',
            'user-data': 'User Data Management',
            profile: 'Profile & Settings'
        };

        if (pageTitle) {
            pageTitle.textContent = titles[viewName] || 'Dashboard';
        }
        this.currentView = viewName;

        if (viewName === 'user-data') {
            this.loadUserRecords();
        }
    }

    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');

            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-color-scheme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-color-scheme', newTheme);
                if (icon) {
                    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            });
        }
    }

    initUserDataForm() {
        const form = document.getElementById('user-data-form');
        const refreshBtn = document.getElementById('refresh-records');

        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadUserRecords());
        }

        const inputs = form?.querySelectorAll('input, textarea') || [];
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const name = field.name;
        let isValid = true;
        let errorMessage = '';

        this.clearFieldError(field);

        switch (name) {
            case 'name':
                if (!value) {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters long';
                    isValid = false;
                } else if (value.length > 100) {
                    errorMessage = 'Name must be less than 100 characters';
                    isValid = false;
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    errorMessage = 'Name can only contain letters and spaces';
                    isValid = false;
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    errorMessage = 'Email is required';
                    isValid = false;
                } else if (!emailRegex.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;

            case 'message':
                if (!value) {
                    errorMessage = 'Message is required';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters long';
                    isValid = false;
                } else if (value.length > 1000) {
                    errorMessage = 'Message must be less than 1000 characters';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
            field.classList.add('invalid');
            field.classList.remove('valid');
        } else {
            field.classList.add('valid');
            field.classList.remove('invalid');
        }

        return isValid;
    }

    showFieldError(field, message) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    clearFieldError(field) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
        field.classList.remove('invalid', 'valid');
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = document.getElementById('submit-btn');
        const formData = new FormData(form);

        const fields = form.querySelectorAll('input, textarea');
        let isFormValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showMessage('Please fix the errors above before submitting.', 'error');
            return;
        }

        const data = {
            name: formData.get('name').trim(),
            email: formData.get('email').trim(),
            message: formData.get('message').trim()
        };

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        }

        try {
            const response = await fetch(`${this.apiConfig.baseURL}/api/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Data submitted successfully!', 'success');
                form.reset();

                fields.forEach(field => {
                    field.classList.remove('valid', 'invalid');
                });

                this.loadUserRecords();
            } else {
                this.showMessage(result.message || 'An error occurred while submitting data.', 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Data';
            }
        }
    }

    async loadUserRecords() {
        const loadingEl = document.getElementById('loading-records');
        const recordsList = document.getElementById('records-list');
        const noRecordsEl = document.getElementById('no-records');

        if (!loadingEl || !recordsList) return;

        loadingEl.style.display = 'block';
        recordsList.style.display = 'none';
        noRecordsEl.style.display = 'none';

        try {
            const response = await fetch(`${this.apiConfig.baseURL}/api/submissions`);
            let records = [];

            if (response.ok) {
                const result = await response.json();
                records = result.data || result;
            }

            loadingEl.style.display = 'none';

            if (Array.isArray(records) && records.length > 0) {
                this.renderRecords(records);
                recordsList.style.display = 'block';
            } else {
                noRecordsEl.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading records:', error);
            loadingEl.style.display = 'none';
            noRecordsEl.style.display = 'block';
            this.showMessage('Error loading records. Please try again.', 'error');
        }
    }

    renderRecords(records) {
        const recordsList = document.getElementById('records-list');
        if (!recordsList) return;

        recordsList.innerHTML = records.map(record => {
            const date = new Date(record.created_at).toLocaleString();
            return `
                <div class="record-item" data-id="${record.id}">
                    <div class="record-header">
                        <div class="record-meta">
                            <div class="record-name">${this.escapeHtml(record.name)}</div>
                            <div class="record-email">${this.escapeHtml(record.email)}</div>
                        </div>
                        <div class="record-date">${date}</div>
                    </div>
                    <div class="record-message">${this.escapeHtml(record.message)}</div>
                    <div class="record-actions">
                        <button 
                            class="btn btn--danger btn--xs" 
                            onclick="dashboard.deleteRecord(${record.id})"
                        >
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async deleteRecord(recordId) {
        if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiConfig.baseURL}/api/submissions/${recordId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const recordElement = document.querySelector(`[data-id="${recordId}"]`);
                if (recordElement) {
                    recordElement.style.transition = 'all 0.3s ease';
                    recordElement.style.opacity = '0';
                    recordElement.style.transform = 'translateX(-100%)';

                    setTimeout(() => {
                        recordElement.remove();

                        const remainingRecords = document.querySelectorAll('.record-item');
                        if (remainingRecords.length === 0) {
                            document.getElementById('no-records').style.display = 'block';
                            document.getElementById('records-list').style.display = 'none';
                        }
                    }, 300);
                }

                this.showMessage('Record deleted successfully.', 'success');
            } else {
                const result = await response.json();
                this.showMessage(result.message || 'Error deleting record.', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        const existingMessage = document.querySelector('.temp-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `temp-message ${type === 'success' ? 'success-message' : 'form-error'} show`;
        messageEl.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i> ${message}`;

        const form = document.getElementById('user-data-form');
        if (form) {
            form.parentNode.insertBefore(messageEl, form);
        }

        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.classList.remove('show');
                setTimeout(() => messageEl.remove(), 300);
            }
        }, 5000);
    }
}

let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    dashboard = new HealthDashboard();
});

window.dashboard = dashboard;