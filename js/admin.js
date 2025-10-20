// ============================================
// ElectroMove Admin Dashboard - Main Script
// ============================================

// API Configuration
const API_BASE_URL = 'https://swp391.up.railway.app/api';
const API_ENDPOINTS = {
    priceTable: `${API_BASE_URL}/pricetable`
};

// Global State Management
const appState = {
    currentSection: 'dashboard',
    currentUser: null,
    isLoggedIn: false,
    priceTableData: []
};

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('Initializing ElectroMove Admin Dashboard...');
    
    // Check authentication
    checkAuthentication();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize UI components
    initializeUI();
    
    // Update time display
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    console.log('Dashboard initialized successfully');
}

// ============================================
// Authentication Management
// ============================================
function checkAuthentication() {
    const token = localStorage.getItem('adminToken');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!token || !userEmail) {
        console.warn('No authentication found, redirecting to login...');
        window.location.href = 'index.html';
        return;
    }
    
    appState.isLoggedIn = true;
    appState.currentUser = { email: userEmail };
    
    // Update profile display
    updateProfileDisplay();
}

function updateProfileDisplay() {
    const profileName = document.querySelector('.profile-name');
    const profileRole = document.querySelector('.profile-role');
    
    if (profileName && appState.currentUser) {
        const email = appState.currentUser.email;
        const name = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
        profileName.textContent = name;
    }
}

function handleLogout() {
    const logoutModal = document.getElementById('logoutModal');
    logoutModal.style.display = 'flex';
}

function confirmLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}

function cancelLogout() {
    const logoutModal = document.getElementById('logoutModal');
    logoutModal.style.display = 'none';
}

// ============================================
// Event Listeners Setup
// ============================================
function setupEventListeners() {
    // Navigation
    setupNavigationListeners();
    
    // Logout functionality
    setupLogoutListeners();
    
    // Sidebar toggle
    setupSidebarToggle();
    
    // Station management
    setupStationManagement();
    
    // Customer management
    setupCustomerManagement();
    
    // Price management
    setupPriceManagement();
    
    // Reports
    setupReportsListeners();
    
    // Modal listeners
    setupModalListeners();
}

// ============================================
// Navigation Management
// ============================================
function setupNavigationListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });
}

function navigateToSection(sectionName) {
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Update active content section
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const activeSection = document.getElementById(`${sectionName}-section`);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = formatSectionTitle(sectionName);
    }
    
    // Update state
    appState.currentSection = sectionName;
    
    // Load section data if needed
    loadSectionData(sectionName);
}

function formatSectionTitle(sectionName) {
    const titles = {
        'dashboard': 'Dashboard',
        'stations': 'Station Management',
        'users': 'Customer Management',
        'reports': 'Reports & Statistics',
        'pricing': 'Price Management'
    };
    
    return titles[sectionName] || sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
}

function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'stations':
            loadStationsData();
            break;
        case 'users':
            loadCustomersData();
            break;
        case 'reports':
            loadReportsData();
            break;
        case 'pricing':
            loadPricingData();
            break;
    }
}

// ============================================
// Sidebar Toggle
// ============================================
function setupSidebarToggle() {
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// ============================================
// Logout Management
// ============================================
function setupLogoutListeners() {
    const logoutBtn = document.querySelector('.logout-btn');
    const confirmLogoutBtn = document.getElementById('confirmLogout');
    const cancelLogoutBtn = document.getElementById('cancelLogout');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', confirmLogout);
    }
    
    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', cancelLogout);
    }
}

// ============================================
// Dashboard Data Management
// ============================================
function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    // Update stat cards with placeholder data
    updateDashboardStats();
}

function updateDashboardStats() {
    const totalStationsEl = document.getElementById('totalStationsCount');
    const activeUsersEl = document.getElementById('activeUsersCount');
    
    if (totalStationsEl) {
        totalStationsEl.textContent = '0';
    }
    
    if (activeUsersEl) {
        activeUsersEl.textContent = '0';
    }
}

// ============================================
// Station Management
// ============================================
function setupStationManagement() {
    const addStationBtn = document.getElementById('addStationBtn');
    const searchStation = document.getElementById('searchStation');
    
    if (addStationBtn) {
        addStationBtn.addEventListener('click', openAddStationModal);
    }
    
    if (searchStation) {
        searchStation.addEventListener('input', handleStationSearch);
    }
}

function loadStationsData() {
    console.log('Loading stations data...');
    const stationsGrid = document.querySelector('.stations-grid');
    
    if (stationsGrid) {
        stationsGrid.innerHTML = '<div class="no-data-message"><i class="fas fa-charging-station"></i><p>No stations available. Click "Add New Station" to get started.</p></div>';
    }
}

function openAddStationModal() {
    const modal = document.getElementById('addStationModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Clear form fields
        document.getElementById('newStationName').value = '';
        document.getElementById('newStationLocation').value = '';
        document.getElementById('newStationLat').value = '';
        document.getElementById('newStationLng').value = '';
    }
}

function closeAddStationModal() {
    const modal = document.getElementById('addStationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function submitNewStation() {
    const name = document.getElementById('newStationName').value.trim();
    const location = document.getElementById('newStationLocation').value.trim();
    const lat = document.getElementById('newStationLat').value;
    const lng = document.getElementById('newStationLng').value;
    
    // Validation
    if (!name || !location || !lat || !lng) {
        alert('Please fill in all required fields');
        return;
    }
    
    // In production, this would make an API call
    console.log('New Station Data:', { name, location, lat, lng });
    
    alert('Station will be added when connected to API');
    closeAddStationModal();
}

function handleStationSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    console.log('Searching stations:', searchTerm);
    
    // In production, this would filter station cards
    // For now, just log the search term
}

// ============================================
// Customer Management
// ============================================
function setupCustomerManagement() {
    const searchCustomer = document.getElementById('searchCustomer');
    
    if (searchCustomer) {
        searchCustomer.addEventListener('input', handleCustomerSearch);
    }
}

function loadCustomersData() {
    console.log('Loading customers data...');
    const tableBody = document.getElementById('userTableBody');
    
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-users" style="font-size: 48px; color: #e5e7eb; margin-bottom: 16px;"></i>
                    <p style="color: #9ca3af; font-size: 16px;">No customer data available</p>
                </td>
            </tr>
        `;
    }
}

function handleCustomerSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    console.log('Searching customers:', searchTerm);
    
    // In production, this would filter customer table rows
}

// ============================================
// Price Management
// ============================================
function setupPriceManagement() {
    const addPriceBtn = document.getElementById('addPriceBtn');
    const refreshPricesBtn = document.getElementById('refreshPricesBtn');
    const closePriceModal = document.getElementById('closePriceModal');
    const cancelPriceForm = document.getElementById('cancelPriceForm');
    const priceForm = document.getElementById('priceForm');
    
    if (addPriceBtn) {
        addPriceBtn.addEventListener('click', openAddPriceModal);
    }
    
    if (refreshPricesBtn) {
        refreshPricesBtn.addEventListener('click', function() {
            loadPricingData();
            showNotification('Price data refreshed!', 'success');
        });
    }
    
    if (closePriceModal) {
        closePriceModal.addEventListener('click', closePriceModalHandler);
    }
    
    if (cancelPriceForm) {
        cancelPriceForm.addEventListener('click', closePriceModalHandler);
    }
    
    if (priceForm) {
        priceForm.addEventListener('submit', handlePriceFormSubmit);
    }
}

async function loadPricingData() {
    console.log('🔄 Loading pricing data from API...');
    console.log('📡 API URL:', API_ENDPOINTS.priceTable);
    
    const priceTableBody = document.getElementById('priceTableBody');
    
    if (!priceTableBody) {
        console.error('❌ Price table body element not found');
        return;
    }
    
    // Show loading state
    priceTableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #00d4ff; margin-bottom: 16px;"></i>
                <p style="color: #9ca3af; font-size: 16px;">Loading price data...</p>
            </td>
        </tr>
    `;
    
    try {
        console.log('🌐 Fetching data...');
        
        const response = await fetch(API_ENDPOINTS.priceTable, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });
        
        console.log('📨 Response status:', response.status);
        console.log('📨 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const priceData = await response.json();
        console.log('✅ Price data loaded successfully:', priceData);
        console.log('📊 Number of records:', priceData.length);
        
        // Store in state
        appState.priceTableData = priceData;
        
        // Display data
        displayPriceTable(priceData);
        
    } catch (error) {
        console.error('❌ Error loading price data:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
                    <p style="color: #ef4444; font-size: 16px; font-weight: 600;">Error loading price data</p>
                    <p style="color: #9ca3af; font-size: 14px; margin-top: 8px;">${error.message}</p>
                    <button onclick="loadPricingData()" style="margin-top: 16px; padding: 8px 16px; background: var(--electric-blue); color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                </td>
            </tr>
        `;
        
        showNotification('Failed to load price data: ' + error.message, 'error');
    }
}

function displayPriceTable(priceData) {
    const priceTableBody = document.getElementById('priceTableBody');
    
    if (!priceTableBody) return;
    
    if (!priceData || priceData.length === 0) {
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-dollar-sign" style="font-size: 48px; color: #e5e7eb; margin-bottom: 16px;"></i>
                    <p style="color: #9ca3af; font-size: 16px;">No price data available. Click "Add New Price" to create pricing rules.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by validFrom date (newest first)
    priceData.sort((a, b) => new Date(b.validFrom) - new Date(a.validFrom));
    
    const rows = priceData.map(price => {
        const statusClass = price.status === 1 ? 'status-active' : 'status-inactive';
        const statusText = price.status === 1 ? 'Active' : 'Inactive';
        
        return `
            <tr data-price-id="${price.id}">
                <td>#${price.id}</td>
                <td>${formatCurrency(price.pricePerKWh / 100)}/kWh</td>
                <td>${formatCurrency(price.penaltyFeePerMinute / 100)}/min</td>
                <td>${formatDate(price.validFrom)}</td>
                <td>${formatDate(price.validTo)}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editPrice(${price.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-toggle" onclick="togglePriceStatus(${price.id}, ${price.status})" title="${price.status === 1 ? 'Deactivate' : 'Activate'}">
                            <i class="fas fa-${price.status === 1 ? 'toggle-on' : 'toggle-off'}"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deletePrice(${price.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    priceTableBody.innerHTML = rows;
}

function openAddPriceModal() {
    const modal = document.getElementById('priceModal');
    const modalTitle = document.getElementById('priceModalTitle');
    
    if (modal) {
        modal.style.display = 'flex';
        
        if (modalTitle) {
            modalTitle.textContent = 'Add New Price';
        }
        
        // Clear form
        document.getElementById('priceForm').reset();
        document.getElementById('priceId').value = '';
        document.getElementById('priceStatus').value = '1';
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('validFrom').value = today;
    }
}

function closePriceModalHandler() {
    const modal = document.getElementById('priceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function handlePriceFormSubmit(e) {
    e.preventDefault();
    
    const priceId = document.getElementById('priceId').value;
    const priceData = {
        pricePerKWh: parseFloat(document.getElementById('pricePerKwh').value) * 100, // Convert to cents
        penaltyFeePerMinute: parseFloat(document.getElementById('penaltyFee').value) * 100, // Convert to cents
        validFrom: document.getElementById('validFrom').value + 'T00:00:00',
        validTo: document.getElementById('validTo').value + 'T00:00:00',
        status: parseInt(document.getElementById('priceStatus').value) || 1
    };
    
    console.log('Submitting price data:', priceData);
    
    try {
        let response;
        
        if (priceId) {
            // Update existing price (PUT request)
            response = await fetch(`${API_ENDPOINTS.priceTable}/${priceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...priceData, id: parseInt(priceId) })
            });
        } else {
            // Create new price (POST request)
            response = await fetch(API_ENDPOINTS.priceTable, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(priceData)
            });
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Price saved successfully:', result);
        
        showNotification(priceId ? 'Price updated successfully!' : 'Price created successfully!', 'success');
        closePriceModalHandler();
        
        // Reload price data
        await loadPricingData();
        
    } catch (error) {
        console.error('Error saving price:', error);
        showNotification('Error saving price: ' + error.message, 'error');
    }
}

async function editPrice(priceId) {
    console.log('Editing price:', priceId);
    
    // Find price data from state
    const priceData = appState.priceTableData.find(p => p.id === priceId);
    
    if (!priceData) {
        showNotification('Price data not found', 'error');
        return;
    }
    
    // Open modal
    const modal = document.getElementById('priceModal');
    const modalTitle = document.getElementById('priceModalTitle');
    
    if (modal) {
        modal.style.display = 'flex';
        
        if (modalTitle) {
            modalTitle.textContent = 'Edit Price';
        }
        
        // Fill form with existing data
        document.getElementById('priceId').value = priceData.id;
        document.getElementById('pricePerKwh').value = (priceData.pricePerKWh / 100).toFixed(2);
        document.getElementById('penaltyFee').value = (priceData.penaltyFeePerMinute / 100).toFixed(2);
        document.getElementById('validFrom').value = priceData.validFrom.split('T')[0];
        document.getElementById('validTo').value = priceData.validTo.split('T')[0];
        document.getElementById('priceStatus').value = priceData.status;
    }
}

async function togglePriceStatus(priceId, currentStatus) {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const action = newStatus === 1 ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this price?`)) {
        return;
    }
    
    try {
        // Find the price data
        const priceData = appState.priceTableData.find(p => p.id === priceId);
        
        if (!priceData) {
            throw new Error('Price data not found');
        }
        
        // Update status
        const response = await fetch(`${API_ENDPOINTS.priceTable}/${priceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...priceData, status: newStatus })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showNotification(`Price ${action}d successfully!`, 'success');
        
        // Reload price data
        await loadPricingData();
        
    } catch (error) {
        console.error('Error toggling price status:', error);
        showNotification('Error updating price status: ' + error.message, 'error');
    }
}

async function deletePrice(priceId) {
    if (!confirm('Are you sure you want to delete this price? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.priceTable}/${priceId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showNotification('Price deleted successfully!', 'success');
        
        // Reload price data
        await loadPricingData();
        
    } catch (error) {
        console.error('Error deleting price:', error);
        showNotification('Error deleting price: ' + error.message, 'error');
    }
}

// ============================================
// Reports Management
// ============================================
function setupReportsListeners() {
    const reportPeriod = document.getElementById('reportPeriod');
    const exportReportBtn = document.getElementById('exportReportBtn');
    
    if (reportPeriod) {
        reportPeriod.addEventListener('change', function() {
            console.log('Report period changed:', this.value);
            loadReportsData();
        });
    }
    
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', exportReport);
    }
}

//THIS FUNCTION DIDN'T HAD API YET
function loadReportsData() {
    console.log('Loading reports data...');
    
    // Update report statistics
    updateReportStats();
    
    // Update report tables
    updateReportTables();
}

function updateReportStats() {
    const stats = {
        totalSessions: 0,
        totalRevenue: 0,
        totalEnergy: 0,
        avgSessionTime: 0
    };
    
    document.getElementById('totalSessions').textContent = stats.totalSessions;
    document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue}`;
    document.getElementById('totalEnergy').textContent = `${stats.totalEnergy} kWh`;
    document.getElementById('avgSessionTime').textContent = `${stats.avgSessionTime} min`;
}

function updateReportTables() {
    const topStationsBody = document.getElementById('topStationsTableBody');
    const topVehiclesBody = document.getElementById('topVehiclesTableBody');
    const topCustomersBody = document.getElementById('topCustomersTableBody');
    
    const noDataMessage = '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">No data available for selected period</td></tr>';
    
    if (topStationsBody) {
        topStationsBody.innerHTML = noDataMessage;
    }
    
    if (topVehiclesBody) {
        topVehiclesBody.innerHTML = noDataMessage;
    }
    
    if (topCustomersBody) {
        topCustomersBody.innerHTML = noDataMessage;
    }
}

function exportReport() {
    console.log('Exporting report...');
    alert('Report export functionality will be available when connected to API');
}

// ============================================
// Modal Management
// ============================================
function setupModalListeners() {
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Close buttons
    const closeButtons = document.querySelectorAll('.close, .close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// ============================================
// UI Utilities
// ============================================
function initializeUI() {
    // Load initial section (dashboard)
    loadDashboardData();
}

function updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        timeElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// ============================================
// Utility Functions
// ============================================
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    const colorMap = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#00d4ff'
    };
    
    notification.innerHTML = `
        <i class="fas ${iconMap[type] || iconMap.info}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colorMap[type] || colorMap.info};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        min-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// Global Functions (for HTML onclick events)
// ============================================
window.openAddStationModal = openAddStationModal;
window.closeAddStationModal = closeAddStationModal;
window.submitNewStation = submitNewStation;
window.editPrice = editPrice;
window.togglePriceStatus = togglePriceStatus;
window.deletePrice = deletePrice;
window.loadPricingData = loadPricingData;

// ============================================
// Error Handling
// ============================================
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});

console.log('Admin.js loaded successfully');
