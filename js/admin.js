// ElectroMove Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuthentication()) {
        return; // Stop initialization if not authenticated
    }
    
    // Initialize dashboard
    initializeDashboard();
    initializeNavigation();
    initializeCharts();
    initializeStationManagement();
    initializeUserManagement();
    initializeReports();
    initializePriceManagement();
    initializeLogout();
    updateCurrentTime();
    
    // Update time every minute
    setInterval(updateCurrentTime, 60000);
});

// Authentication Check
function checkAuthentication() {
    console.log('🔒 Checking authentication...');
    
    // Check if user is logged in (session storage)
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        console.warn('User not authenticated');
        showAuthenticationError();
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
        return false;
    }
    
    console.log('User authenticated:', userEmail);
    
    // Update user info in dashboard
    updateUserInfo(userEmail);
    
    return true;
}

function showAuthenticationError() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center; color: white; padding: 40px; background: linear-gradient(135deg, #1a1a1a, #2d2d2d); border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 212, 255, 0.3); max-width: 500px;">
            <i class="fas fa-lock" style="font-size: 64px; color: #ff4444; margin-bottom: 20px;"></i>
            <h2 style="margin-bottom: 16px; color: #ff4444;">Authentication Required</h2>
            <p style="color: #9ca3af; margin-bottom: 24px;">You must be logged in to access the admin dashboard.</p>
            <p style="color: #9ca3af; font-size: 14px;">Redirecting to login page...</p>
            <div style="margin-top: 20px;">
                <div style="width: 40px; height: 40px; border: 4px solid rgba(255, 255, 255, 0.1); border-top-color: #00d4ff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

function updateUserInfo(email) {
    // Update user email display if exists
    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(el => {
        el.textContent = email;
    });
}

// Dashboard Initialization
function initializeDashboard() {
    console.log('🚗 ElectroMove Admin Dashboard Initialized');
    
    // Initialize mock data structure
    window.mockData = {
        stations: [], // Will be loaded from API
        users: [], // Will be loaded from API
        revenue: generateMockRevenue()
    };
    
    // Initialize dashboard stats with 0 counts
    updateDashboardStats();
    
    // Load initial data from APIs
    loadStationsFromAPI(); // Load stations from real API
    loadCustomersFromAPI(); // Load customers from real API
}

// Update dashboard stats
function updateDashboardStats() {
    updateStationsStats();
    updateCustomerStats();
}

// Navigation System
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.querySelector('.page-title');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    // Navigation click handlers
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionName = this.dataset.section;

            // Toggle active on sections
            sections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(sectionName + '-section');
            if (targetSection) targetSection.classList.add('active');

            // Update sidebar active state
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');

            // Update page title if available
            if (pageTitle) pageTitle.textContent = this.textContent.trim();
            
            // Load data when switching to specific sections
            if (sectionName === 'pricing') {
                loadPriceTableData();
            } else if (sectionName === 'reports') {
                updateReportDisplay();
            }
        });
    });

    // Sidebar toggle for small screens
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// Chart Initialization
function initializeCharts() {
    // Revenue by Station Chart
    const revenueByStationCtx = document.getElementById('revenueByStationChart');
    if (revenueByStationCtx) {
        new Chart(revenueByStationCtx, {
            type: 'bar',
            data: {
                labels: ['Downtown Plaza', 'Mall Central', 'Airport Hub', 'University', 'Business Park'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [3248, 2156, 1890, 1645, 1234],
                    backgroundColor: '#00d4ff',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: { 
                        ticks: { color: '#9ca3af' },
                        grid: { display: false }
                    },
                    y: { 
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
    
    // Demand forecast / AI chart removed (section intentionally left out)
}

// Station Management
function initializeStationManagement() {
    // Filter handlers for monitoring tab
    const regionFilter = document.getElementById('regionFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchStation = document.getElementById('searchStation');
    
    if (regionFilter) {
        regionFilter.addEventListener('change', filterStations);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterStations);
    }
    if (searchStation) {
        searchStation.addEventListener('input', filterStations);
    }
}

function loadStationsData() {
    const stationsGrid = document.querySelector('.stations-grid');
    
    if (stationsGrid && window.mockData.stations) {
        stationsGrid.innerHTML = '';
        window.mockData.stations.forEach(station => {
            stationsGrid.appendChild(createStationCard(station));
        });
    }
}

function createStationCard(station) {
    const card = document.createElement('div');
    card.className = 'station-card';
    // Use helper accessors to support multiple API field naming conventions
    const sid = getStationId(station);
    const sname = getStationName(station);
    const slocation = station.location || station.address || station.fullAddress || 'Unknown Location';
    const formatCoord = v => (typeof v === 'number' ? v.toFixed(4) : (parseFloat(v) ? parseFloat(v).toFixed(4) : v));
    const slat = formatCoord(station.latitude || station.lat || 0);
    const slng = formatCoord(station.longitude || station.lng || station.long || 0);

    card.innerHTML = `
        <div class="station-header">
            <div class="station-name">${escapeHtml(sname)}</div>
            <div class="station-id">ID: ${escapeHtml(String(sid))}</div>
        </div>
        <div class="station-info">
            <div class="info-item full-width">
                <div class="info-label">Location</div>
                <div class="info-value">${escapeHtml(slocation)}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Latitude</div>
                <div class="info-value">${escapeHtml(String(slat))}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Longitude</div>
                <div class="info-value">${escapeHtml(String(slng))}</div>
            </div>
        </div>
        <div class="station-actions">
            <button class="action-btn" onclick="viewStationDetails('${escapeJs(sid)}')">View Details</button>
            <button class="action-btn remove-btn" onclick="removeStation('${escapeJs(sid)}')">Remove</button>
        </div>
    `;
    return card;
}

// Helpers to normalize station fields
function getStationId(station) {
    return station.stationid || station.id || station.stationId || station.chargingStationId || station.station_id || '';
}

function getStationName(station) {
    return station.stationname || station.name || station.stationName || station.chargingStationName || 'Unknown Station';
}

// Small escape helpers for safety when inserting data into HTML
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeJs(str) {
    return String(str).replace(/'/g, "\\'");
}

// Natural sort function for sorting IDs like 1.1, 1.2, 1.10 correctly
function naturalSort(a, b) {
    const ax = [], bx = [];
    
    a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
    b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });
    
    while(ax.length && bx.length) {
        const an = ax.shift();
        const bn = bx.shift();
        const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
        if(nn) return nn;
    }
    
    return ax.length - bx.length;
}

function filterStations() {
    const search = document.getElementById('searchStation')?.value.toLowerCase() || '';
    const filteredStations = window.mockData.stations.filter(station => {
        const matchesSearch = !search ||
            getStationName(station).toLowerCase().includes(search) ||
            (station.location || '').toLowerCase().includes(search) ||
            String(getStationId(station)).toLowerCase().includes(search);
        return matchesSearch;
    });
    const stationsGrid = document.querySelector('.stations-grid');
    if (stationsGrid) {
        stationsGrid.innerHTML = '';
        filteredStations.forEach(station => {
            stationsGrid.appendChild(createStationCard(station));
        });
    }
}

function viewStationDetails(stationId) {
    const station = window.mockData.stations.find(s => getStationId(s) == stationId);
    if (station) {
        const modal = document.getElementById('stationModal');
        const details = document.getElementById('stationDetails');

        const sid = getStationId(station);
        const sname = getStationName(station);
        const slocation = station.location || station.address || station.fullAddress || 'Unknown Location';

        // Build points list (if available)
        let pointsHtml = '';
        if (Array.isArray(station.points) && station.points.length > 0) {
            // Sort points by ID (numerical sort)
            const sortedPoints = station.points.slice().sort((a, b) => {
                const idA = String(a.id || a.pointId || a.point || '');
                const idB = String(b.id || b.pointId || b.point || '');
                return naturalSort(idA, idB);
            });
            
            pointsHtml += `<h4>Points (${sortedPoints.length}) <button class="small-btn" onclick="addNewPoint('${escapeJs(sid)}')" style="margin-left: 10px;">Add New Point</button></h4>`;
            pointsHtml += '<div class="points-container">';
            sortedPoints.forEach(point => {
                const pid = point.id || point.pointId || point.point || '';
                pointsHtml += `
                    <div class="point-item">
                        <div class="point-info">
                            <strong>Point ID:</strong> ${escapeHtml(String(pid))}
                        </div>
                        <div class="point-actions">
                            <button class="small-btn" onclick="viewPointDetails('${escapeJs(sid)}','${escapeJs(pid)}')">View Details</button>
                            <button class="small-btn remove-btn" onclick="removePoint('${escapeJs(sid)}','${escapeJs(pid)}')">Remove</button>
                        </div>
                    </div>`;
            });
            pointsHtml += '</div>';
        } else {
            pointsHtml = `<h4>Points (0) <button class="small-btn" onclick="addNewPoint('${escapeJs(sid)}')" style="margin-left: 10px;">Add New Point</button></h4>`;
            pointsHtml += '<p>No points data available for this station.</p>';
        }

        details.innerHTML = `
            <h3>${escapeHtml(sname)}</h3>
            <p><strong>Station ID:</strong> ${escapeHtml(String(sid))}</p>
            <p><strong>Location:</strong> ${escapeHtml(slocation)}</p>
            ${pointsHtml}
        `;

        modal.style.display = 'block';
    }
}

function viewPointDetails(stationId, pointId) {
    const station = window.mockData.stations.find(s => getStationId(s) == stationId);
    if (!station) return showNotification('Station not found', 'error');

    const point = (station.points || []).find(p => (p.id || p.pointId || p.point) == pointId);
    if (!point) return showNotification('Point not found', 'error');

    // Build ports table
    let portsHtml = '';
    if (Array.isArray(point.ports) && point.ports.length > 0) {
        // Sort ports by ID (numerical sort)
        const sortedPorts = point.ports.slice().sort((a, b) => {
            const idA = String(a.id || a.portId || '');
            const idB = String(b.id || b.portId || '');
            return naturalSort(idA, idB);
        });
        
        portsHtml += '<h4>Ports</h4>';
        portsHtml += '<div class="ports-container">';
        portsHtml += '<table class="ports-table"><thead><tr><th>ID</th><th>Connector</th><th>Power (kW)</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        sortedPorts.forEach(port => {
            const portId = port.id || port.portId || '';
            const currentPower = port.power !== undefined ? port.power : 0;
            const currentStatus = port.status || 'Maintenance';
            portsHtml += `
                <tr>
                    <td>${escapeHtml(String(portId))}</td>
                    <td>${escapeHtml(String(port.connectorName || port.connector || ''))}</td>
                    <td>
                        <input type="number" id="power_${escapeHtml(String(portId))}" value="${currentPower}" 
                               style="width: 70px; padding: 2px;" min="1" max="350" />
                    </td>
                    <td>
                        <select id="status_${escapeHtml(String(portId))}" style="width: 120px; padding: 2px;">
                            <option value="InUse" ${currentStatus === 'InUse' ? 'selected' : ''}>In Use</option>
                            <option value="Faulty" ${currentStatus === 'Faulty' ? 'selected' : ''}>Faulty</option>
                            <option value="Maintenance" ${currentStatus === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                        </select>
                    </td>
                    <td>
                        <button class="small-btn" onclick="savePortChanges('${escapeJs(stationId)}','${escapeJs(pointId)}','${escapeJs(portId)}')">Save</button>
                    </td>
                </tr>`;
        });
        portsHtml += '</tbody></table>';
        portsHtml += '</div>';
    } else {
        portsHtml = '<p>No ports available for this point.</p>';
    }

    // Reuse station modal to show point -> ports info
    const modal = document.getElementById('stationModal');
    const details = document.getElementById('stationDetails');
    details.innerHTML = `
        <h3>Station: ${escapeHtml(getStationName(station))}</h3>
        <p><strong>Point ID:</strong> ${escapeHtml(String(pointId))}</p>
        ${portsHtml}
        <div style="margin-top:12px;"><button class="btn" onclick="viewStationDetails('${escapeJs(stationId)}')">Back to Station</button></div>
    `;
    modal.style.display = 'block';
}

// User Management
async function loadCustomersFromAPI() {
    try {
        showTableLoading();
        
        // Use local API proxy instead of external API directly
        const response = await fetch('/api/customers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const customers = await response.json();
        console.log('API Response:', customers); // For debugging
        
        // Transform API data to match your table structure
        window.allUsers = customers.map(customer => ({
            id: customer.customerId || customer.id || customer.customerID,
            name: customer.customerName || customer.name || customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
            email: customer.email || customer.emailAddress || 'N/A',
            phone: customer.phoneNumber || customer.phone || customer.mobile || 'N/A',
            address: customer.address || customer.fullAddress || `${customer.street || ''}, ${customer.city || ''}`.trim() || 'N/A'
        }));
        
        // Update customer count
        updateCustomerStats();
        
        // Load the data into the table
        loadUsersData();
        
        showNotification(`Successfully loaded ${customers.length} customers`, 'success');
        
    } catch (error) {
        handleAPIError(error);
    }
}

// Load Stations from API
async function loadStationsFromAPI() {
    try {
        showStationsLoading();
        
        console.log('Loading stations from API...');
        
        // Use local API proxy for stations
        const response = await fetch('/api/stations', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const stations = await response.json();
        console.log('Stations API Response:', stations); // For debugging
        
        // Transform API data to match your station structure
        window.mockData.stations = stations.map(station => ({
            id: station.id || station.stationId || station.chargingStationId,
            name: station.name || station.stationName || station.chargingStationName || 'Unknown Station',
            location: station.location || station.address || station.fullAddress || 'Unknown Location',
            latitude: station.latitude || station.lat || 0,
            longitude: station.longitude || station.lng || station.long || 0,
            points: station.points || [], // Preserve the points array structure
            status: station.status || (station.isActive ? 'active' : 'inactive') || 'unknown',
            power: station.power || station.powerOutput || station.maxPower || '50kW',
            type: station.type || station.chargerType || 'DC Fast',
            available: station.available || station.availableChargers || 0,
            total: station.total || station.totalChargers || 1
        }));
        
        // Update the displays
        loadStationsData();
        updateStationsStats();
        
        showNotification(`✅ Successfully loaded ${stations.length} charging stations`, 'success');
        
    } catch (error) {
        console.error('Stations API Error:', error);
        handleStationsAPIError(error);
    }
}

function showStationsLoading() {
    const stationsGrid = document.querySelector('.stations-grid');
    if (stationsGrid) {
        stationsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div style="color: var(--text-secondary);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px; color: var(--electric-blue);"></i>
                    <br>Loading charging stations from API...
                </div>
            </div>
        `;
    }
}

function handleStationsAPIError(error) {
    console.error('Stations API Error:', error);
    showNotification('Failed to load stations data: ' + error.message, 'error');
    
    const stationsGrid = document.querySelector('.stations-grid');
    if (stationsGrid) {
        stationsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <div style="color: var(--error-red);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
                    <br>Failed to load stations data
                    <br><small>${error.message}</small>
                    <br><button onclick="loadStationsFromAPI()" style="margin-top: 10px; padding: 8px 16px; background: var(--electric-blue); color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
                </div>
            </div>
        `;
    }
}

function updateStationsStats() {
    if (window.mockData && window.mockData.stations) {
        const totalStations = window.mockData.stations.length;
        const activeStations = window.mockData.stations.filter(s => s.status === 'active' || s.status === 'online').length;
        
        // Update dashboard stat card
        const totalStationsElement = document.getElementById('totalStationsCount');
        if (totalStationsElement) {
            totalStationsElement.textContent = totalStations.toLocaleString();
        }
        
        // Update any other station count displays in the dashboard
        const stationCountElements = document.querySelectorAll('.station-count');
        stationCountElements.forEach(el => {
            el.textContent = totalStations;
        });
        
        const activeStationElements = document.querySelectorAll('.active-stations');
        activeStationElements.forEach(el => {
            el.textContent = activeStations;
        });
    }
}

function showTableLoading() {
    const tableBody = document.getElementById('userTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <div style="color: var(--text-secondary);">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px; color: var(--electric-blue);"></i>
                        <br>Loading customers from API...
                    </div>
                </td>
            </tr>
        `;
    }
}

function handleAPIError(error) {
    console.error('API Error:', error);
    showNotification('Failed to load customer data: ' + error.message, 'error');
    
    const tableBody = document.getElementById('userTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <div style="color: var(--error-red);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
                        <br>Failed to load customer data
                        <br><small style="color: var(--text-muted); margin: 10px 0; display: block;">${error.message}</small>
                        <button onclick="loadCustomersFromAPI()" style="margin-top: 15px; padding: 10px 20px; background: var(--electric-blue); border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 14px;">
                            <i class="fas fa-redo"></i> Retry Connection
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

function updateCustomerStats() {
    const totalCustomers = window.allUsers ? window.allUsers.length : 0;
    
    // Update dashboard stat card
    const activeUsersElement = document.getElementById('activeUsersCount');
    if (activeUsersElement) {
        activeUsersElement.textContent = totalCustomers.toLocaleString();
    }
    
    // Update any other customer count displays
    const statsElement = document.querySelector('.stat-number');
    if (statsElement) {
        statsElement.textContent = totalCustomers.toLocaleString();
    }
}

async function testAPIConnection() {
    try {
        console.log('🧪 Testing API connections through local proxy...');
        
        // Test customers API
        console.log('Testing customers API: /api/customers');
        const customersResponse = await fetch('/api/customers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!customersResponse.ok) {
            throw new Error(`Customers API error: ${customersResponse.status} - ${customersResponse.statusText}`);
        }
        
        const customersData = await customersResponse.json();
        console.log('✅ Customers API successful!', customersData.length, 'customers found');
        
        // Test stations API
        console.log('Testing stations API: /api/stations');
        const stationsResponse = await fetch('/api/stations', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!stationsResponse.ok) {
            throw new Error(`Stations API error: ${stationsResponse.status} - ${stationsResponse.statusText}`);
        }
        
        const stationsData = await stationsResponse.json();
        console.log('✅ Stations API successful!', stationsData.length, 'stations found');
        
        // Show success message
        showNotification(`🎉 All APIs connected! Found ${customersData.length} customers and ${stationsData.length} charging stations`, 'success');
        
        return {
            customers: customersData,
            stations: stationsData
        };
        
    } catch (error) {
        console.error('❌ API connection failed:', error);
        showNotification('API connection failed: ' + error.message, 'error');
        throw error;
    }
}

function addRefreshButton() {
    const sectionHeader = document.querySelector('#users-section .section-header');
    if (sectionHeader && !document.getElementById('refreshCustomers')) {
        
        // Test API button
        const testBtn = document.createElement('button');
        testBtn.id = 'testAPI';
        testBtn.className = 'btn btn-warning';
        testBtn.innerHTML = '<i class="fas fa-plug"></i> Test API';
        testBtn.onclick = testAPIConnection;
        testBtn.style.marginRight = '12px';
        
        // Refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'refreshCustomers';
        refreshBtn.className = 'btn btn-info';
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
        refreshBtn.onclick = () => {
            showNotification('Refreshing customer data...', 'info');
            loadCustomersFromAPI();
        };
        
        sectionHeader.appendChild(testBtn);
        sectionHeader.appendChild(refreshBtn);
    }
}

function initializeUserManagement() {
    console.log('Initializing User Management with API connection...');
    
    // Load real customer data from API
    loadCustomersFromAPI();
    
    // Add refresh and test buttons
    addRefreshButton();
    
    // Customer filter handlers
    const searchCustomer = document.getElementById('searchCustomer');
    
    if (searchCustomer) {
        searchCustomer.addEventListener('input', filterCustomers);
    }
}

function loadUsersData() {
    const userTableBody = document.getElementById('userTableBody');
    if (userTableBody && window.allUsers) {
        userTableBody.innerHTML = '';
        window.allUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.address}</td>
                <td>
                    <button class="action-btn" onclick="editUser('${user.id}')">Edit</button>
                    <button class="action-btn" onclick="deleteUser('${user.id}')">Delete</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    }
}

function filterCustomers() {
    const search = document.getElementById('searchCustomer')?.value.toLowerCase() || '';
    
    const filteredUsers = window.allUsers ? window.allUsers.filter(user => {
        const matchesSearch = !search || 
            user.name.toLowerCase().includes(search) || 
            user.email.toLowerCase().includes(search) ||
            user.phone.toLowerCase().includes(search) ||
            user.address.toLowerCase().includes(search);
        
        return matchesSearch;
    }) : [];
    
    const userTableBody = document.getElementById('userTableBody');
    if (userTableBody) {
        userTableBody.innerHTML = '';
        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.address}</td>
                <td>
                    <button class="action-btn" onclick="editUser('${user.id}')">Edit</button>
                    <button class="action-btn" onclick="deleteUser('${user.id}')">Delete</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    }
}

function editUser(userId) {
    showNotification(`Edit customer ${userId} functionality would be implemented here`, 'info');
}

function deleteUser(userId) {
    showNotification(`Delete customer ${userId} functionality would be implemented here`, 'warning');
}

// Reports & Statistics
function initializeReports() {
    console.log('📊 Initializing Reports...');
    
    // Setup event listeners
    const reportPeriod = document.getElementById('reportPeriod');
    const exportReportBtn = document.getElementById('exportReportBtn');
    
    if (reportPeriod) {
        reportPeriod.addEventListener('change', loadReportData);
    }
    
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', exportReport);
    }
    
    // Load initial report data
    loadReportData();
}

// Load Report Data from API
async function loadReportData() {
    console.log('📊 Loading report data from API...');
    
    try {
        // Determine API URL based on environment
        const isLocalServer = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = isLocalServer ? 'http://localhost:3000/api' : 'https://swp391.up.railway.app/api';
        
        // Load sessions, vehicles, customers, and stations data
        const [sessionsRes, vehiclesRes, customersRes, stationsRes] = await Promise.all([
            fetch(`${baseUrl}/sessions`),
            fetch(`${baseUrl}/vehicles`),
            fetch(`${baseUrl}/customers`),
            fetch(`${baseUrl}/stations`)
        ]);
        
        if (!sessionsRes.ok || !vehiclesRes.ok || !customersRes.ok || !stationsRes.ok) {
            throw new Error('Failed to load data from API');
        }
        
        const sessions = await sessionsRes.json();
        const vehicles = await vehiclesRes.json();
        const customers = await customersRes.json();
        const stations = await stationsRes.json();
        
        // Store data globally
        window.reportData = {
            sessions: Array.isArray(sessions) ? sessions : [],
            vehicles: Array.isArray(vehicles) ? vehicles : [],
            customers: Array.isArray(customers) ? customers : [],
            stations: Array.isArray(stations) ? stations : []
        };
        
        console.log('✅ Report data loaded:', window.reportData);
        
        // Update display
        updateReportDisplay();
        
        showNotification('✅ Report data loaded successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Failed to load report data:', error);
        showNotification('⚠️ Failed to load report data', 'error');
        
        // Initialize empty data
        window.reportData = {
            sessions: [],
            vehicles: [],
            customers: [],
            stations: []
        };
        
        updateReportDisplay();
    }
}

function updateReportDisplay() {
    console.log('📊 Updating report display...');
    
    if (!window.reportData || !window.reportData.sessions) {
        console.warn('⚠️ No report data available');
        return;
    }
    
    // Calculate statistics
    const sessions = window.reportData.sessions;
    const completedSessions = sessions.filter(s => {
        const status = s.status || s.Status || '';
        return status.toLowerCase() === 'completed';
    });
    
    const totalSessions = sessions.length;
    const totalRevenue = completedSessions.reduce((sum, s) => {
        const cost = s.totalCost || s.TotalCost || 0;
        return sum + parseFloat(cost);
    }, 0);
    
    const totalEnergy = completedSessions.reduce((sum, s) => {
        const energy = s.energyConsumed || s.EnergyConsumed || 0;
        return sum + parseFloat(energy);
    }, 0);
    
    // Calculate average session time
    let totalMinutes = 0;
    let validSessions = 0;
    
    completedSessions.forEach(session => {
        const startTime = session.startTime || session.StartTime;
        const endTime = session.endTime || session.EndTime;
        
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const minutes = (end - start) / (1000 * 60);
            if (minutes > 0) {
                totalMinutes += minutes;
                validSessions++;
            }
        }
    });
    
    const avgSessionTime = validSessions > 0 ? Math.round(totalMinutes / validSessions) : 0;
    
    // Update stat cards
    const totalSessionsEl = document.getElementById('totalSessions');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalEnergyEl = document.getElementById('totalEnergy');
    const avgSessionTimeEl = document.getElementById('avgSessionTime');
    
    if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
    if (totalRevenueEl) totalRevenueEl.textContent = '$' + totalRevenue.toFixed(2);
    if (totalEnergyEl) totalEnergyEl.textContent = totalEnergy.toFixed(1) + ' kWh';
    if (avgSessionTimeEl) avgSessionTimeEl.textContent = avgSessionTime + ' min';
    
    // Update tables
    updateTopStationsTable();
    updateTopVehiclesTable();
    updateTopCustomersTable();
}

function updateTopStationsTable() {
    const stationStats = {};
    
    window.reportData.sessions.forEach(session => {
        // Handle field name variations
        const sessionStationId = session.stationId || session.StationId || session.StationID;
        const sessionStatus = session.status || session.Status;
        const sessionEnergy = session.energyConsumed || session.EnergyConsumed || 0;
        const sessionCost = session.totalCost || session.TotalCost || 0;
        const sessionStart = session.startTime || session.StartTime;
        const sessionEnd = session.endTime || session.EndTime;
        
        const station = window.reportData.stations.find(s => {
            const stationId = s.id || s.Id || s.ID || s.stationId || s.StationId || s.StationID;
            return stationId === sessionStationId;
        });
        
        if (station) {
            const stationId = station.id || station.Id || station.ID || station.stationId || station.StationId || station.StationID;
            const stationName = station.name || station.Name || station.stationName || station.StationName || 'Unknown Station';
            
            if (!stationStats[stationId]) {
                stationStats[stationId] = {
                    name: stationName,
                    sessions: 0,
                    energy: 0,
                    revenue: 0,
                    totalMinutes: 0
                };
            }
            
            stationStats[stationId].sessions++;
            
            if (sessionStatus === 'Completed') {
                stationStats[stationId].energy += sessionEnergy;
                stationStats[stationId].revenue += sessionCost;
                
                if (sessionStart && sessionEnd) {
                    const start = new Date(sessionStart);
                    const end = new Date(sessionEnd);
                    const minutes = (end - start) / (1000 * 60);
                    if (minutes > 0) {
                        stationStats[stationId].totalMinutes += minutes;
                    }
                }
            }
        }
    });
    
    const sortedStations = Object.values(stationStats).sort((a, b) => b.revenue - a.revenue);
    
    const tbody = document.getElementById('topStationsTableBody');
    if (tbody) {
        tbody.innerHTML = sortedStations.length > 0 ? sortedStations.map(station => `
            <tr>
                <td><strong>${station.name}</strong></td>
                <td>${station.sessions}</td>
                <td>${station.energy.toFixed(1)} kWh</td>
                <td><strong style="color: #00ff88;">$${station.revenue.toFixed(2)}</strong></td>
                <td>${station.sessions > 0 ? Math.round(station.totalMinutes / station.sessions) : 0} min</td>
            </tr>
        `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">No station data available</td></tr>';
    }
}

function updateTopVehiclesTable() {
    const vehicleStats = {};
    
    window.reportData.sessions.forEach(session => {
        // Handle field name variations
        const sessionVehicleId = session.vehicleId || session.VehicleId || session.VehicleID;
        const sessionStatus = session.status || session.Status;
        const sessionEnergy = session.energyConsumed || session.EnergyConsumed || 0;
        const sessionCost = session.totalCost || session.TotalCost || 0;
        
        const vehicle = window.reportData.vehicles.find(v => {
            const vehicleId = v.id || v.Id || v.ID || v.vehicleId || v.VehicleId || v.VehicleID;
            return vehicleId === sessionVehicleId;
        });
        
        if (vehicle) {
            const vehicleId = vehicle.id || vehicle.Id || vehicle.ID || vehicle.vehicleId || vehicle.VehicleId || vehicle.VehicleID;
            const vehicleName = vehicle.name || vehicle.Name || vehicle.vehicleName || vehicle.VehicleName || 'Unknown Vehicle';
            const vehiclePlate = vehicle.licensePlate || vehicle.LicensePlate || vehicle.licenseplate || 'N/A';
            
            if (!vehicleStats[vehicleId]) {
                vehicleStats[vehicleId] = {
                    name: vehicleName,
                    licensePlate: vehiclePlate,
                    sessions: 0,
                    energy: 0,
                    cost: 0
                };
            }
            
            vehicleStats[vehicleId].sessions++;
            
            if (sessionStatus === 'Completed') {
                vehicleStats[vehicleId].energy += sessionEnergy;
                vehicleStats[vehicleId].cost += sessionCost;
            }
        }
    });
    
    const sortedVehicles = Object.values(vehicleStats).sort((a, b) => b.sessions - a.sessions);
    
    const tbody = document.getElementById('topVehiclesTableBody');
    if (tbody) {
        tbody.innerHTML = sortedVehicles.length > 0 ? sortedVehicles.map(vehicle => `
            <tr>
                <td><strong>${vehicle.name}</strong></td>
                <td>${vehicle.licensePlate}</td>
                <td>${vehicle.sessions}</td>
                <td>${vehicle.energy.toFixed(1)} kWh</td>
                <td><strong style="color: #00ff88;">$${vehicle.cost.toFixed(2)}</strong></td>
            </tr>
        `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">No vehicle data available</td></tr>';
    }
}

function updateTopCustomersTable() {
    const customerStats = {};
    
    window.reportData.sessions.forEach(session => {
        // Handle field name variations
        const sessionVehicleId = session.vehicleId || session.VehicleId || session.VehicleID;
        const sessionStatus = session.status || session.Status;
        const sessionCost = session.totalCost || session.TotalCost || 0;
        const sessionStart = session.startTime || session.StartTime;
        
        const vehicle = window.reportData.vehicles.find(v => {
            const vehicleId = v.id || v.Id || v.ID || v.vehicleId || v.VehicleId || v.VehicleID;
            return vehicleId === sessionVehicleId;
        });
        
        if (vehicle) {
            const vehicleCustomerId = vehicle.customerId || vehicle.CustomerId || vehicle.CustomerID || vehicle.customerid;
            
            const customer = window.reportData.customers.find(c => {
                const customerId = c.id || c.Id || c.ID || c.customerId || c.CustomerId || c.CustomerID;
                return customerId === vehicleCustomerId;
            });
            
            if (customer) {
                const customerId = customer.id || customer.Id || customer.ID || customer.customerId || customer.CustomerId || customer.CustomerID;
                const customerName = customer.name || customer.Name || customer.fullName || customer.FullName || 'Unknown Customer';
                const customerEmail = customer.email || customer.Email || 'N/A';
                
                if (!customerStats[customerId]) {
                    customerStats[customerId] = {
                        name: customerName,
                        email: customerEmail,
                        sessions: 0,
                        spent: 0,
                        lastSession: sessionStart
                    };
                }
                
                customerStats[customerId].sessions++;
                
                if (sessionStatus === 'Completed') {
                    customerStats[customerId].spent += sessionCost;
                }
                
                if (sessionStart && new Date(sessionStart) > new Date(customerStats[customerId].lastSession)) {
                    customerStats[customerId].lastSession = sessionStart;
                }
            }
        }
    });
    
    const sortedCustomers = Object.values(customerStats).sort((a, b) => b.spent - a.spent);
    
    const tbody = document.getElementById('topCustomersTableBody');
    if (tbody) {
        tbody.innerHTML = sortedCustomers.length > 0 ? sortedCustomers.map(customer => `
            <tr>
                <td><strong>${customer.name}</strong></td>
                <td>${customer.email}</td>
                <td>${customer.sessions}</td>
                <td><strong style="color: #00ff88;">$${customer.spent.toFixed(2)}</strong></td>
                <td>${formatPriceDate(customer.lastSession)}</td>
            </tr>
        `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">No customer data available</td></tr>';
    }
}

function exportReport() {
    showNotification('📊 Report exported successfully!', 'success');
    // In real implementation, this would generate a PDF or Excel file
}

// AI Forecasting removed

// Utility Functions
function updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleString();
    }
}

// Logout Functionality
function initializeLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');

    // Show logout confirmation modal
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logoutModal.style.display = 'block';
        });
    }

    // Handle Yes button (confirm logout)
    if (confirmLogout) {
        confirmLogout.addEventListener('click', function() {
            console.log('🚪 Logging out...');
            
            // Clear session storage
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userEmail');
            sessionStorage.removeItem('loginTime');
            
            // Clear all session data
            sessionStorage.clear();
            
            console.log('✅ Session cleared');
            
            // Show logout notification
            showNotification('👋 Logged out successfully', 'success');
            
            // Redirect to login page after short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
        });
    }

    // Handle No button (cancel logout)
    if (cancelLogout) {
        cancelLogout.addEventListener('click', function() {
            logoutModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
    
    // Manual close
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #00d4ff, #0ea5e9)'
    };
    return colors[type] || colors.info;
}

// Mock Data Generators
function generateMockRevenue() {
    return {
        total: 47392,
        byStation: [3248, 2156, 1890, 1645, 1234],
        byRegion: [12000, 15000, 10000, 10392]
    };
}

// Modal handlers
document.addEventListener('click', function(e) {
    const modal = document.getElementById('stationModal');
    if (e.target === modal || e.target.classList.contains('close')) {
        modal.style.display = 'none';
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    }
    
    .user-status.active { color: #10b981; }
    .user-status.inactive { color: #f59e0b; }
    .user-status.suspended { color: #ef4444; }
    
    .station-control-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        margin-bottom: 12px;
    }
    
    .control-info {
        flex: 1;
    }
    
    .control-name {
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }
    
    .control-actions {
        display: flex;
        gap: 8px;
    }
    
    .btn-sm {
        padding: 8px 12px;
        font-size: 12px;
    }
    
    .package-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
    }
`;
document.head.appendChild(style);

// === Add New Station Modal Functions ===
let addStationData = {};

// Compute next available numeric Station ID (highest station ID + 1)
function computeNextStationId() {
    try {
        let maxId = 0;
        if (window.mockData && Array.isArray(window.mockData.stations)) {
            window.mockData.stations.forEach(s => {
                const sid = getStationId(s);
                const num = Number(sid);
                if (Number.isInteger(num) && num > 0) {
                    maxId = Math.max(maxId, num);
                }
            });
        }
        return maxId + 1;
    } catch (e) {
        console.warn('Failed to compute next station id, fallback to 1', e);
        return 1;
    }
}

function openAddStationModal() {
    var modal = document.getElementById('addStationModal');
    var step1 = document.getElementById('addStationStep1');
    if (modal) modal.style.display = 'block';
    if (step1) step1.style.display = 'block';
    addStationData = {};
    // Clear all form fields
    var nameInput = document.getElementById('newStationName');
    var locationInput = document.getElementById('newStationLocation');
    var latInput = document.getElementById('newStationLat');
    var lngInput = document.getElementById('newStationLng');
    if (nameInput) nameInput.value = '';
    if (locationInput) locationInput.value = '';
    if (latInput) latInput.value = '';
    if (lngInput) lngInput.value = '';
}

function closeAddStationModal() {
    document.getElementById('addStationModal').style.display = 'none';
}

function backAddStationStep() {
    document.getElementById('addStationStep1').style.display = 'block';
    document.getElementById('addStationStep2').style.display = 'none';
}

function renderPointsInput() {
    const area = document.getElementById('pointsInputArea');
    area.innerHTML = `
        <div style="margin-bottom: 15px;">
            <label><strong>Number of Points:</strong> 
                <input type="number" id="pointCount" min="1" max="10" value="1" onchange="renderPointsInputFields()" style="width: 60px; margin-left: 10px;" />
            </label>
        </div>
        <div id="pointsFields"></div>
    `;
    renderPointsInputFields();
}

function renderPointsInputFields() {
    const count = parseInt(document.getElementById('pointCount').value) || 1;
    const fields = document.getElementById('pointsFields');
    fields.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const pointId = `${addStationData.id}.${i}`;
        fields.innerHTML += `
            <div style="border: 1px solid rgba(255,255,255,0.1); margin: 10px 0; padding: 15px; border-radius: 6px; background: rgba(255,255,255,0.02);">
                <h4 style="color: var(--electric-blue); margin-bottom: 10px;">Point ID: ${pointId}</h4>
                <label><strong>Number of Ports:</strong> 
                    <input type="number" id="portCount${i}" min="1" max="5" value="3" onchange="renderPortsInputFields(${i},'${pointId}')" style="width: 60px; margin-left: 10px;" />
                </label>
                <div id="portsFields${i}" style="margin-top: 10px;"></div>
            </div>
        `;
        renderPortsInputFields(i, pointId);
    }
}

function renderPortsInputFields(pointIdx, pointId) {
    const count = parseInt(document.getElementById(`portCount${pointIdx}`).value) || 3;
    const fields = document.getElementById(`portsFields${pointIdx}`);
    fields.innerHTML = '';
    
    for (let j = 1; j <= count; j++) {
        const portId = `${pointId}.${j}`;
        fields.innerHTML += `
            <div style="margin: 8px 0; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; align-items: center;">
                    <div><strong>Port ID:</strong> ${portId}</div>
                    <div>
                        <label>Connector:</label>
                        <select id="connector${pointIdx}_${j}" style="width: 100%; padding: 4px;">
                            <option value="AC">AC</option>
                            <option value="CCS">CCS</option>
                            <option value="CHAdeMO">CHAdeMO</option>
                        </select>
                    </div>
                    <div>
                        <label>Power (kW):</label>
                        <input type="number" id="power${pointIdx}_${j}" value="22" style="width: 100%; padding: 4px;" />
                    </div>
                    <div>
                        <label>Status:</label>
                        <select id="status${pointIdx}_${j}" style="width: 100%; padding: 4px;">
                            <option value="InUse">InUse</option>
                            <option value="Faulty">Faulty</option>
                            <option value="Maintenance" selected>Maintenance</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
}

function submitNewStation() {
    // Validate required fields
    var nameInput = document.getElementById('newStationName');
    var locationInput = document.getElementById('newStationLocation');
    var latInput = document.getElementById('newStationLat');
    var lngInput = document.getElementById('newStationLng');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const location = locationInput ? locationInput.value.trim() : '';
    const lat = latInput ? latInput.value : '';
    const lng = lngInput ? lngInput.value : '';
    
    if (!name) {
        showNotification('Please enter Station Name', 'error');
        return;
    }
    if (!location) {
        showNotification('Please enter Location', 'error');
        return;
    }
    if (!lat || !lng) {
        showNotification('Please enter Latitude and Longitude', 'error');
        return;
    }
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
        showNotification('Latitude and Longitude must be valid numbers', 'error');
        return;
    }
    
    // Create new station with auto-generated ID (no points initially)
    const newStation = {
        id: computeNextStationId(),
        name: name,
        location: location,
        latitude: latNum,
        longitude: lngNum,
        points: []
    };
    
    // Add the new station to the stations array
    window.mockData.stations.push(newStation);
    
    // Close modal and refresh the stations display
    closeAddStationModal();
    loadStationsData();
    updateStationsStats();
    showNotification(`✅ Station "${newStation.name}" (ID: ${newStation.id}) has been added successfully!`, 'success');
}

// === Remove Functions ===
function removeStation(stationId) {
    if (confirm(`Are you sure you want to remove station ${stationId}? This action cannot be undone.`)) {
        const stationIndex = window.mockData.stations.findIndex(s => getStationId(s) == stationId);
        if (stationIndex !== -1) {
            const stationName = getStationName(window.mockData.stations[stationIndex]);
            window.mockData.stations.splice(stationIndex, 1);
            loadStationsData();
            updateStationsStats();
            showNotification(`✅ Station "${stationName}" has been removed successfully!`, 'success');
        } else {
            showNotification('❌ Station not found!', 'error');
        }
    }
}

function removePoint(stationId, pointId) {
    if (confirm(`Are you sure you want to remove point ${pointId}? This will also remove all its ports.`)) {
        const station = window.mockData.stations.find(s => getStationId(s) == stationId);
        if (station && station.points) {
            const pointIndex = station.points.findIndex(p => (p.id || p.pointId || p.point) == pointId);
            if (pointIndex !== -1) {
                station.points.splice(pointIndex, 1);
                // Refresh the station details view
                viewStationDetails(stationId);
                updateStationsStats();
                showNotification(`✅ Point "${pointId}" has been removed successfully!`, 'success');
            } else {
                showNotification('❌ Point not found!', 'error');
            }
        } else {
            showNotification('❌ Station not found!', 'error');
        }
    }
}

function removePort(stationId, pointId, portId) {
    if (confirm(`Are you sure you want to remove port ${portId}?`)) {
        const station = window.mockData.stations.find(s => getStationId(s) == stationId);
        if (station && station.points) {
            const point = station.points.find(p => (p.id || p.pointId || p.point) == pointId);
            if (point && point.ports) {
                const portIndex = point.ports.findIndex(p => (p.id || p.portId) == portId);
                if (portIndex !== -1) {
                    point.ports.splice(portIndex, 1);
                    // Refresh the point details view
                    viewPointDetails(stationId, pointId);
                    updateStationsStats();
                    showNotification(`✅ Port "${portId}" has been removed successfully!`, 'success');
                } else {
                    showNotification('❌ Port not found!', 'error');
                }
            } else {
                showNotification('❌ Point not found!', 'error');
            }
        } else {
            showNotification('❌ Station not found!', 'error');
        }
    }
// Price Management
function initializePriceManagement() {
    console.log('Initializing Price Management...');
    
    // Initialize empty price data
    window.priceData = [];
    
    // Load price data from API
    loadPriceDataFromAPI();
    
    // Add Price button handler
    const addPriceBtn = document.getElementById('addPriceBtn');
    if (addPriceBtn) {
        addPriceBtn.addEventListener('click', () => openPriceModal());
    }
    
    // Refresh button handler
    const refreshPricesBtn = document.getElementById('refreshPricesBtn');
    if (refreshPricesBtn) {
        refreshPricesBtn.addEventListener('click', () => {
            showNotification('Refreshing price data...', 'info');
            loadPriceDataFromAPI();
        });
    }
    
    // Close modal handlers
    const closePriceModal = document.getElementById('closePriceModal');
    const cancelPriceForm = document.getElementById('cancelPriceForm');
    const priceModal = document.getElementById('priceModal');
    
    if (closePriceModal) {
        closePriceModal.addEventListener('click', () => {
            priceModal.style.display = 'none';
            resetPriceForm();
        });
    }
    
    if (cancelPriceForm) {
        cancelPriceForm.addEventListener('click', () => {
            priceModal.style.display = 'none';
            resetPriceForm();
        });
    }
    
    // Form submit handler
    const priceForm = document.getElementById('priceForm');
    if (priceForm) {
        priceForm.addEventListener('submit', handlePriceFormSubmit);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === priceModal) {
            priceModal.style.display = 'none';
            resetPriceForm();
        }
    });
}

// Load Price Data from API
async function loadPriceDataFromAPI() {
    const priceTableBody = document.getElementById('priceTableBody');
    if (!priceTableBody) return;
    
    // Show loading state
    showPriceTableLoading();
    
    try {
        console.log('Loading price data from API...');
        
        // Try local proxy first (when running with start_server.py)
        const isLocalServer = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocalServer 
            ? 'http://localhost:3000/api/pricetable'
            : 'https://swp391.up.railway.app/api/pricetable';
        
        console.log('API URL:', apiUrl);
        console.log('Using local proxy:', isLocalServer);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache'
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Price data loaded successfully from API:', data);
        console.log('Number of records:', Array.isArray(data) ? data.length : 'Not an array');
        
        // Store in window.priceData
        window.priceData = Array.isArray(data) ? data : [];
        
        if (window.priceData.length > 0) {
            console.log('Sample price record:', window.priceData[0]);
        }
        
        // Render the data
        loadPriceData();
        

    } catch (error) {
        console.error('❌ Failed to load from API, using mock data instead');
        console.error('Error:', error.message);
        
        // Use mock data when API fails (CORS or network error)
        useMockPriceData();
    }
}

// Fallback to mock data when API is unavailable
function useMockPriceData() {
    console.log('📦 Loading mock price data...');
    
    // Mock data based on actual API format
    window.priceData = [
        {
            id: 1,
            pricePerKWh: 3858,
            penaltyFeePerMinute: 1000,
            validFrom: "2024-03-19T00:00:00",
            validTo: "2025-12-31T00:00:00",
            status: 0  // 0 = Deactive, 1 = Active
        },
        {
            id: 2,
            pricePerKWh: 4200,
            penaltyFeePerMinute: 1200,
            validFrom: "2025-01-01T00:00:00",
            validTo: "2025-06-30T00:00:00",
            status: 0
        },
        {
            id: 3,
            pricePerKWh: 4500,
            penaltyFeePerMinute: 1500,
            validFrom: "2025-07-01T00:00:00",
            validTo: "2025-12-31T00:00:00",
            status: 1  // Active
        }
    ];
    
    loadPriceData();
    
    showNotification('⚠️ Using mock data (API unavailable). Run with start_server.py to use real API.', 'warning');
}

function showPriceTableLoading() {
    const priceTableBody = document.getElementById('priceTableBody');
    if (priceTableBody) {
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 16px; display: block; color: var(--electric-blue);"></i>
                    Loading price data...
                </td>
            </tr>
        `;
    }
}

function handlePriceAPIError(error) {
    console.error('Price API Error:', error);
    
    let errorMessage = 'Failed to load price data';
    let errorDetails = '';
    
    if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to API server';
        errorDetails = 'This might be due to CORS policy, network issues, or the server being unavailable. Check the browser console for details.';
    } else if (error.message.includes('HTTP error')) {
        errorMessage = 'API returned an error';
        errorDetails = error.message;
    } else {
        errorDetails = error.message;
    }
    
    showNotification(errorMessage + ': ' + errorDetails, 'error');
    
    const priceTableBody = document.getElementById('priceTableBody');
    if (priceTableBody) {
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; display: block; color: var(--error-red);"></i>
                    <p style="margin-bottom: 8px; font-weight: 600;">${errorMessage}</p>
                    <p style="margin-bottom: 16px; font-size: 14px; color: var(--text-muted);">${errorDetails}</p>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button class="btn btn-primary" onclick="loadPriceDataFromAPI()">
                            <i class="fas fa-sync-alt"></i>
                            Retry
                        </button>
                        <button class="btn btn-info" onclick="window.open('https://swp391.up.railway.app/api/pricetable', '_blank')">
                            <i class="fas fa-external-link-alt"></i>
                            Test API in Browser
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

function loadPriceData() {
    const priceTableBody = document.getElementById('priceTableBody');
    if (!priceTableBody) return;
    
    priceTableBody.innerHTML = '';
    
    if (window.priceData && window.priceData.length > 0) {
        window.priceData.forEach(price => {
            const row = createPriceRow(price);
            priceTableBody.appendChild(row);
        });
    } else {
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-dollar-sign" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                    No price tables found. Click "Add New Price" to create one.
                </td>
            </tr>
        `;
    }
}

function createPriceRow(price) {
    const row = document.createElement('tr');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    // Normalize field names from API
    // API returns: id, pricePerKWh, penaltyFeePerMinute, validFrom, validTo, status (0 or 1)
    const priceId = price.id || price.priceid || price.priceId || price.PriceID;
    const pricePerKwh = price.pricePerKWh || price.priceperkwh || price.pricePerKwh || price.PricePerKWh || 0;
    const penaltyFee = price.penaltyFeePerMinute || price.penaltyfeeperminute || price.penaltyFeePerMinute || price.PenaltyFeePerMinute || 0;
    const validFrom = price.validFrom || price.validfrom || price.ValidFrom;
    const validTo = price.validTo || price.validto || price.ValidTo;
    
    // Status: 0 = Deactive, 1 = Active (or string "Active"/"Deactive")
    let statusValue = price.status;
    if (typeof statusValue === 'number') {
        statusValue = statusValue === 1 ? 'Active' : 'Deactive';
    } else {
        statusValue = statusValue || 'Deactive';
    }
    
    const validFromDate = new Date(validFrom);
    const validToDate = new Date(validTo);
    validFromDate.setHours(0, 0, 0, 0);
    validToDate.setHours(0, 0, 0, 0);
    
    // Determine if price is expired
    const isExpired = validToDate < today;
    
    // Determine actual status
    let displayStatus = statusValue;
    let statusClass = displayStatus.toLowerCase();
    
    // Check if it's expired
    if (isExpired) {
        displayStatus = 'Deactive';
        statusClass = 'deactive';
    }
    
    row.innerHTML = `
        <td>${escapeHtml(String(priceId))}</td>
        <td>$${parseFloat(pricePerKwh).toFixed(2)}</td>
        <td>$${parseFloat(penaltyFee).toFixed(2)}</td>
        <td>${formatDate(validFrom)}</td>
        <td>${formatDate(validTo)}</td>
        <td>
            <span class="price-status ${statusClass}">
                <i class="fas fa-circle"></i>
                ${displayStatus}
            </span>
        </td>
        <td>
            <div class="price-actions">
                <button class="btn btn-edit" 
                    onclick="editPrice(${priceId})" 
                    ${isExpired ? 'disabled title="Cannot edit expired prices"' : ''}>
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                ${displayStatus === 'Deactive' && !isExpired ? `
                    <button class="btn btn-activate" onclick="activatePrice(${priceId})">
                        <i class="fas fa-check"></i>
                        Activate
                    </button>
                ` : ''}
            </div>
        </td>
    `;
    
    return row;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function openPriceModal(priceId = null) {
    const modal = document.getElementById('priceModal');
    const modalTitle = document.getElementById('priceModalTitle');
    
    if (priceId) {
        // Edit mode
        const price = window.priceData.find(p => {
            const pid = p.id || p.priceid || p.priceId || p.PriceID;
            return pid == priceId;
        });
        if (!price) return;
        
        // Normalize field names
        const pricePerKwh = price.pricePerKWh || price.priceperkwh || price.pricePerKwh || price.PricePerKWh || 0;
        const penaltyFee = price.penaltyFeePerMinute || price.penaltyfeeperminute || price.penaltyFeePerMinute || price.PenaltyFeePerMinute || 0;
        const validFrom = price.validFrom || price.validfrom || price.ValidFrom;
        const validTo = price.validTo || price.validto || price.ValidTo;
        
        // Status: convert number to string
        let statusValue = price.status;
        if (typeof statusValue === 'number') {
            statusValue = statusValue === 1 ? 'Active' : 'Deactive';
        } else {
            statusValue = statusValue || 'Deactive';
        }
        
        // Format dates for input[type="date"] (YYYY-MM-DD)
        const validFromFormatted = validFrom ? new Date(validFrom).toISOString().split('T')[0] : '';
        const validToFormatted = validTo ? new Date(validTo).toISOString().split('T')[0] : '';
        
        modalTitle.textContent = 'Edit Price';
        document.getElementById('priceId').value = priceId;
        document.getElementById('pricePerKwh').value = pricePerKwh;
        document.getElementById('penaltyFee').value = penaltyFee;
        document.getElementById('validFrom').value = validFromFormatted;
        document.getElementById('validTo').value = validToFormatted;
        document.getElementById('priceStatus').value = statusValue;
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Price';
        resetPriceForm();
    }
    
    modal.style.display = 'block';
}

function resetPriceForm() {
    const form = document.getElementById('priceForm');
    if (form) {
        form.reset();
        document.getElementById('priceId').value = '';
        document.getElementById('priceStatus').value = '';
    }
}

function handlePriceFormSubmit(e) {
    e.preventDefault();
    
    const priceId = document.getElementById('priceId').value;
    const pricePerKwh = parseFloat(document.getElementById('pricePerKwh').value);
    const penaltyFee = parseFloat(document.getElementById('penaltyFee').value);
    const validFrom = document.getElementById('validFrom').value;
    const validTo = document.getElementById('validTo').value;
    
    // Validation
    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);
    
    if (toDate <= fromDate) {
        showNotification('Valid To date must be after Valid From date', 'error');
        return;
    }
    
    if (priceId) {
        // Update existing price
        updatePrice(parseInt(priceId), pricePerKwh, penaltyFee, validFrom, validTo);
    } else {
        // Add new price
        addNewPrice(pricePerKwh, penaltyFee, validFrom, validTo);
    }
}

function addNewPrice(pricePerKwh, penaltyFee, validFrom, validTo) {
    // Find currently active prices and deactivate them
    const today = new Date();
    const newValidFrom = new Date(validFrom);
    
    window.priceData.forEach(price => {
        if (price.status === 'Active') {
            const priceValidTo = new Date(price.validTo);
            // If the active price is still valid, deactivate it
            if (priceValidTo >= today) {
                price.status = 'Deactive';
                showNotification(`Previous active price (ID: ${price.priceId}) has been deactivated`, 'info');
            }
        }
    });
    
    // Create new price
    const newPrice = {
        priceId: window.priceData.length > 0 ? Math.max(...window.priceData.map(p => p.priceId)) + 1 : 1,
        pricePerKwh: pricePerKwh,
        penaltyFeePerMinute: penaltyFee,
        validFrom: validFrom,
        validTo: validTo,
        status: 'Active' // New price is automatically active
    };
    
    window.priceData.push(newPrice);
    
    // Reload table
    loadPriceData();
    
    // Close modal
    document.getElementById('priceModal').style.display = 'none';
    resetPriceForm();
    
    showNotification('New price added successfully and set as active!', 'success');
}

function updatePrice(priceId, pricePerKwh, penaltyFee, validFrom, validTo) {
    const priceIndex = window.priceData.findIndex(p => p.priceId === priceId);
    if (priceIndex === -1) return;
    
    const price = window.priceData[priceIndex];
    
    // Update price data
    price.pricePerKwh = pricePerKwh;
    price.penaltyFeePerMinute = penaltyFee;
    price.validFrom = validFrom;
    price.validTo = validTo;
    
    // Reload table
    loadPriceData();
    
    // Close modal
    document.getElementById('priceModal').style.display = 'none';
    resetPriceForm();
    
    showNotification('Price updated successfully!', 'success');
}

function editPrice(priceId) {
    const price = window.priceData.find(p => {
        const pid = p.id || p.priceid || p.priceId || p.PriceID;
        return pid == priceId;
    });
    if (!price) return;
    
    // Check if expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const validTo = price.validTo || price.validto || price.ValidTo;
    const validToDate = new Date(validTo);
    validToDate.setHours(0, 0, 0, 0);
    
    if (validToDate < today) {
        showNotification('Cannot edit expired prices', 'error');
        return;
    }
    
    openPriceModal(priceId);
}

function activatePrice(priceId) {
    const price = window.priceData.find(p => {
        const pid = p.id || p.priceid || p.priceId || p.PriceID;
        return pid == priceId;
    });
    if (!price) return;
    
    // Check if expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const validTo = price.validTo || price.validto || price.ValidTo;
    const validToDate = new Date(validTo);
    validToDate.setHours(0, 0, 0, 0);
    
    if (validToDate < today) {
        showNotification('Cannot activate expired prices', 'error');
        return;
    }
    
    // Deactivate all currently active prices
    window.priceData.forEach(p => {
        let pStatus = p.status;
        // Convert number to string for comparison
        if (typeof pStatus === 'number') {
            pStatus = pStatus === 1 ? 'Active' : 'Deactive';
        }
        
        if (pStatus === 'Active' || pStatus === 1) {
            p.status = 0; // Set to Deactive (0)
        }
    });
    
    // Activate this price
    price.status = 1; // Set to Active (1)
    
    // Reload table
    loadPriceData();
    
    showNotification(`Price ID ${priceId} is now active!`, 'success');
}

}

// ============================================================================
// PRICE MANAGEMENT MODULE
// ============================================================================

function initializePriceManagement() {
    console.log('💰 Initializing Price Management...');
    
    // Initialize price data
    window.priceData = [];
    
    // Setup event handlers first
    setupPriceManagementHandlers();
    
    // Load data from API (will use mock data if API fails)
    loadPriceTableData();
}

function setupPriceManagementHandlers() {
    // Add Price button
    const addPriceBtn = document.getElementById('addPriceBtn');
    if (addPriceBtn) {
        addPriceBtn.addEventListener('click', openAddPriceModal);
    }
    
    // Refresh button
    const refreshPricesBtn = document.getElementById('refreshPricesBtn');
    if (refreshPricesBtn) {
        refreshPricesBtn.addEventListener('click', () => {
            showNotification('Refreshing price data...', 'info');
            loadPriceTableData();
        });
    }
    
    // Close modal handlers
    const closePriceModal = document.getElementById('closePriceModal');
    const cancelPriceForm = document.getElementById('cancelPriceForm');
    const priceModal = document.getElementById('priceModal');
    
    if (closePriceModal) {
        closePriceModal.addEventListener('click', () => {
            priceModal.style.display = 'none';
            resetPriceForm();
        });
    }
    
    if (cancelPriceForm) {
        cancelPriceForm.addEventListener('click', () => {
            priceModal.style.display = 'none';
            resetPriceForm();
        });
    }
    
    // Form submit handler
    const priceForm = document.getElementById('priceForm');
    if (priceForm) {
        priceForm.addEventListener('submit', handlePriceFormSubmit);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === priceModal) {
            priceModal.style.display = 'none';
            resetPriceForm();
        }
    });
}

// Load Price Table Data from API
async function loadPriceTableData() {
    console.log('💰 loadPriceTableData() called');
    
    const priceTableBody = document.getElementById('priceTableBody');
    if (!priceTableBody) {
        console.error('❌ priceTableBody element not found!');
        // Try again after a short delay
        setTimeout(() => {
            const retryBody = document.getElementById('priceTableBody');
            if (retryBody) {
                loadPriceTableData();
            } else {
                console.error('❌ priceTableBody still not found after retry');
            }
        }, 500);
        return;
    }
    
    // Show loading state
    showPriceLoading();
    
    try {
        console.log('📊 Loading price data from API...');
        
        // Determine API URL based on environment
        const isLocalServer = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocalServer 
            ? 'http://localhost:3000/api/pricetable'
            : 'https://swp391.up.railway.app/api/pricetable';
        
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Price data loaded from API:', data);
        
        window.priceData = Array.isArray(data) ? data : [];
        renderPriceTable();
        
    } catch (error) {
        console.error('❌ API Error, using mock data:', error.message);
        useMockPriceData();
        showNotification('⚠️ Using mock data (API unavailable)', 'info');
    }
}

// Show loading state
function showPriceLoading() {
    const priceTableBody = document.getElementById('priceTableBody');
    if (priceTableBody) {
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: var(--electric-blue); margin-bottom: 16px; display: block;"></i>
                    <p style="color: var(--text-secondary);">Loading price data...</p>
                </td>
            </tr>
        `;
    }
}

// Use mock data when API fails
function useMockPriceData() {
    console.log('📦 Using mock price data');
    
    window.priceData = [
        {
            id: 1,
            pricePerKWh: 3858,
            penaltyFeePerMinute: 1000,
            validFrom: "2024-01-01T00:00:00",
            validTo: "2024-12-31T00:00:00",
            status: 0  // Expired - Deactive
        },
        {
            id: 2,
            pricePerKWh: 4200,
            penaltyFeePerMinute: 1200,
            validFrom: "2025-01-01T00:00:00",
            validTo: "2025-06-30T00:00:00",
            status: 0  // Valid but Deactive
        },
        {
            id: 3,
            pricePerKWh: 4500,
            penaltyFeePerMinute: 1500,
            validFrom: "2025-07-01T00:00:00",
            validTo: "2025-12-31T00:00:00",
            status: 1  // Active
        },
        {
            id: 4,
            pricePerKWh: 5000,
            penaltyFeePerMinute: 1800,
            validFrom: "2026-01-01T00:00:00",
            validTo: "2026-12-31T00:00:00",
            status: 0  // Future price - Deactive
        }
    ];
    
    renderPriceTable();
    showNotification('⚠️ Using mock data (API unavailable)', 'warning');
}

// Render Price Table
function renderPriceTable() {
    console.log('🎨 renderPriceTable() called');
    
    const priceTableBody = document.getElementById('priceTableBody');
    if (!priceTableBody) {
        console.error('❌ priceTableBody element not found!');
        return;
    }
    
    console.log('📊 Price data:', window.priceData);
    
    priceTableBody.innerHTML = '';
    
    if (!window.priceData || window.priceData.length === 0) {
        console.warn('⚠️ No price data available');
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-dollar-sign" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px; display: block;"></i>
                    <p style="color: var(--text-secondary);">No price records found</p>
                    <button class="btn btn-primary" onclick="openAddPriceModal()" style="margin-top: 16px;">
                        <i class="fas fa-plus"></i> Add First Price
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`✅ Rendering ${window.priceData.length} price records`);
    
    window.priceData.forEach(price => {
        const row = createPriceTableRow(price);
        priceTableBody.appendChild(row);
    });
}

// Create Price Table Row
function createPriceTableRow(price) {
    const row = document.createElement('tr');
    
    // Parse fields
    const priceId = price.id || price.priceId || price.PriceID;
    const pricePerKwh = price.pricePerKWh || price.pricePerKwh || 0;
    const penaltyFee = price.penaltyFeePerMinute || price.penaltyFeePerMinute || 0;
    const validFrom = price.validFrom || price.validfrom;
    const validTo = price.validTo || price.validto;
    let status = price.status;
    
    // Convert status from number to boolean/string
    const isActive = (status === 1 || status === true || status === 'Active');
    
    // Check if expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validToDate = new Date(validTo);
    validToDate.setHours(0, 0, 0, 0);
    const isExpired = validToDate < today;
    
    // Determine display status
    let displayStatus = isActive ? 'Active' : 'Deactive';
    let statusClass = isActive ? 'active' : 'deactive';
    
    row.innerHTML = `
        <td>${priceId}</td>
        <td>$${parseFloat(pricePerKwh).toFixed(2)}</td>
        <td>$${parseFloat(penaltyFee).toFixed(2)}</td>
        <td>${formatPriceDate(validFrom)}</td>
        <td>${formatPriceDate(validTo)}</td>
        <td>
            <span class="price-status ${statusClass}">
                <i class="fas fa-circle"></i>
                ${displayStatus}
            </span>
        </td>
        <td>
            <div class="price-actions">
                <button class="btn btn-edit" onclick="editPriceRecord(${priceId})" ${isExpired ? 'disabled title="Cannot edit expired price"' : ''}>
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                ${!isActive && !isExpired ? `
                    <button class="btn btn-activate" onclick="activatePriceRecord(${priceId})">
                        <i class="fas fa-check-circle"></i>
                        Activate
                    </button>
                ` : ''}
            </div>
        </td>
    `;
    
    return row;
}

// Format date for display
function formatPriceDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Open Add Price Modal
function openAddPriceModal() {
    const modal = document.getElementById('priceModal');
    const modalTitle = document.getElementById('priceModalTitle');
    
    modalTitle.textContent = 'Add New Price';
    resetPriceForm();
    modal.style.display = 'block';
}

// Edit Price Record
function editPriceRecord(priceId) {
    const price = window.priceData.find(p => {
        const pid = p.id || p.priceId || p.PriceID;
        return pid == priceId;
    });
    
    if (!price) {
        showNotification('Price record not found', 'error');
        return;
    }
    
    // Check if expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const priceValidTo = price.validTo || price.validto;
    const validToDate = new Date(priceValidTo);
    validToDate.setHours(0, 0, 0, 0);
    
    if (validToDate < today) {
        showNotification('❌ Cannot edit expired price', 'error');
        return;
    }
    
    // Populate form
    const modal = document.getElementById('priceModal');
    const modalTitle = document.getElementById('priceModalTitle');
    
    modalTitle.textContent = 'Edit Price';
    
    const pricePerKwh = price.pricePerKWh || price.pricePerKwh || 0;
    const penaltyFee = price.penaltyFeePerMinute || price.penaltyFeePerMinute || 0;
    const validFrom = price.validFrom || price.validfrom;
    const validTo = priceValidTo;
    
    document.getElementById('priceId').value = priceId;
    document.getElementById('pricePerKwh').value = pricePerKwh;
    document.getElementById('penaltyFee').value = penaltyFee;
    document.getElementById('validFrom').value = formatDateForInput(validFrom);
    document.getElementById('validTo').value = formatDateForInput(validTo);
    
    modal.style.display = 'block';
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Activate Price Record
function activatePriceRecord(priceId) {
    const price = window.priceData.find(p => {
        const pid = p.id || p.priceId || p.PriceID;
        return pid == priceId;
    });
    
    if (!price) {
        showNotification('Price record not found', 'error');
        return;
    }
    
    // Check if expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validTo = price.validTo || price.validto;
    const validToDate = new Date(validTo);
    validToDate.setHours(0, 0, 0, 0);
    
    if (validToDate < today) {
        showNotification('❌ Cannot activate expired price', 'error');
        return;
    }
    
    // BUSINESS RULE: Deactivate ALL other prices (expired or not)
    window.priceData.forEach(p => {
        p.status = 0; // Set all to inactive
    });
    
    // Activate selected price
    price.status = 1;
    
    // Re-render table
    renderPriceTable();
    
    showNotification(`✅ Price ID ${priceId} is now active. All other prices deactivated.`, 'success');
}

// Handle Form Submit
function handlePriceFormSubmit(e) {
    e.preventDefault();
    
    const priceId = document.getElementById('priceId').value;
    const pricePerKwh = parseFloat(document.getElementById('pricePerKwh').value);
    const penaltyFee = parseFloat(document.getElementById('penaltyFee').value);
    const validFrom = document.getElementById('validFrom').value;
    const validTo = document.getElementById('validTo').value;
    
    // Validation
    if (!validFrom || !validTo) {
        showNotification('❌ Please select valid dates', 'error');
        return;
    }
    
    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);
    
    if (toDate <= fromDate) {
        showNotification('❌ Valid To must be after Valid From', 'error');
        return;
    }
    
    if (priceId) {
        // Update existing
        updatePriceRecord(parseInt(priceId), pricePerKwh, penaltyFee, validFrom, validTo);
    } else {
        // Add new
        addNewPriceRecord(pricePerKwh, penaltyFee, validFrom, validTo);
    }
}

// Add New Price Record
function addNewPriceRecord(pricePerKwh, penaltyFee, validFrom, validTo) {
    // Generate new ID
    const maxId = window.priceData.length > 0 
        ? Math.max(...window.priceData.map(p => p.id || p.priceId || p.PriceID || 0))
        : 0;
    
    const newPrice = {
        id: maxId + 1,
        pricePerKWh: pricePerKwh,
        penaltyFeePerMinute: penaltyFee,
        validFrom: validFrom + 'T00:00:00',
        validTo: validTo + 'T00:00:00',
        status: 0  // New prices start as Deactive
    };
    
    window.priceData.push(newPrice);
    
    // Re-render table
    renderPriceTable();
    
    // Close modal
    document.getElementById('priceModal').style.display = 'none';
    resetPriceForm();
    
    showNotification('✅ New price added successfully!', 'success');
}

// Update Price Record
function updatePriceRecord(priceId, pricePerKwh, penaltyFee, validFrom, validTo) {
    const price = window.priceData.find(p => {
        const pid = p.id || p.priceId || p.PriceID;
        return pid == priceId;
    });
    
    if (!price) {
        showNotification('Price record not found', 'error');
        return;
    }
    
    // Update fields
    if (price.pricePerKWh !== undefined) price.pricePerKWh = pricePerKwh;
    if (price.pricePerKwh !== undefined) price.pricePerKwh = pricePerKwh;
    if (price.penaltyFeePerMinute !== undefined) price.penaltyFeePerMinute = penaltyFee;
    if (price.validFrom !== undefined) price.validFrom = validFrom + 'T00:00:00';
    if (price.validfrom !== undefined) price.validfrom = validFrom + 'T00:00:00';
    if (price.validTo !== undefined) price.validTo = validTo + 'T00:00:00';
    if (price.validto !== undefined) price.validto = validTo + 'T00:00:00';
    
    // Re-render table
    renderPriceTable();
    
    // Close modal
    document.getElementById('priceModal').style.display = 'none';
    resetPriceForm();
    
    showNotification('✅ Price updated successfully!', 'success');
}

// Reset Price Form
function resetPriceForm() {
    const form = document.getElementById('priceForm');
    if (form) {
        form.reset();
        document.getElementById('priceId').value = '';
    }
}

// Add New Point Function
function addNewPoint(stationId) {
    const station = window.mockData.stations.find(s => getStationId(s) == stationId);
    if (!station) {
        showNotification('❌ Station not found!', 'error');
        return;
    }
    
    // Ensure points array exists
    if (!Array.isArray(station.points)) {
        station.points = [];
    }
    
    // Generate new point ID (highest point number + 1)
    let maxPointNum = 0;
    station.points.forEach(point => {
        const pid = point.id || point.pointId || point.point || '';
        const pidStr = String(pid);
        const parts = pidStr.split('.');
        if (parts.length >= 2) {
            const pointNum = parseInt(parts[1]);
            if (!isNaN(pointNum) && pointNum > maxPointNum) {
                maxPointNum = pointNum;
            }
        }
    });

    const newPointId = `${stationId}.${maxPointNum + 1}`;

    // Create new point with 3 predefined ports (AC, CCS, CHAdeMO)
    const newPoint = {
        id: newPointId,
        ports: [
            {
                id: `${newPointId}.1`,
                connectorName: 'AC',
                power: 0,
                status: 'Maintenance'
            },
            {
                id: `${newPointId}.2`,
                connectorName: 'CCS',
                power: 0,
                status: 'Maintenance'
            },
            {
                id: `${newPointId}.3`,
                connectorName: 'CHAdeMO',
                power: 0,
                status: 'Maintenance'
            }
        ]
    };

    // Add the new point to the station
    station.points.push(newPoint);

    // Refresh the station details view
    viewStationDetails(stationId);
    updateStationsStats();
    showNotification(`✅ Point "${newPointId}" has been added with 3 ports (AC, CCS, CHAdeMO)!`, 'success');
}

// Price Management
function initializePriceManagement() {
    console.log('Initializing Price Management...');
    
    // Initialize empty price data
    window.priceData = [];
    
    // Load price data from API
    loadPriceDataFromAPI();
    
    // Add Price button handler
    const addPriceBtn = document.getElementById('addPriceBtn');
    if (addPriceBtn) {
        addPriceBtn.addEventListener('click', () => openPriceModal());
    }
    
    // Refresh button handler
    const refreshPricesBtn = document.getElementById('refreshPricesBtn');
    if (refreshPricesBtn) {
        refreshPricesBtn.addEventListener('click', () => {
            showNotification('Refreshing price data...', 'info');
            loadPriceDataFromAPI();
        });
    }
    
    // Close modal handlers
    const closePriceModal = document.getElementById('closePriceModal');
    const cancelPriceForm = document.getElementById('cancelPriceForm');
    const priceModal = document.getElementById('priceModal');
    
    if (closePriceModal) {
        closePriceModal.addEventListener('click', () => {
            priceModal.style.display = 'none';
            resetPriceForm();
        });
    }
    
    if (cancelPriceForm) {
        cancelPriceForm.addEventListener('click', () => {
            priceModal.style.display = 'none';
            resetPriceForm();
        });
    }
    
    // Form submit handler
    const priceForm = document.getElementById('priceForm');
    if (priceForm) {
        priceForm.addEventListener('submit', handlePriceFormSubmit);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === priceModal) {
            priceModal.style.display = 'none';
            resetPriceForm();
        }
    });
}

// Load Price Data from API
async function loadPriceDataFromAPI() {
    const priceTableBody = document.getElementById('priceTableBody');
    if (!priceTableBody) return;
    
    // Show loading state
    showPriceTableLoading();
    
    try {
        console.log('Loading price data from API...');
        
        // Try local proxy first (when running with start_server.py)
        const isLocalServer = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocalServer 
            ? 'http://localhost:3000/api/pricetable'
            : 'https://swp391.up.railway.app/api/pricetable';
        
        console.log('API URL:', apiUrl);
        console.log('Using local proxy:', isLocalServer);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache'
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Price data loaded successfully from API:', data);
        console.log('Number of records:', Array.isArray(data) ? data.length : 'Not an array');
        
        // Store in window.priceData
        window.priceData = Array.isArray(data) ? data : [];
        
        if (window.priceData.length > 0) {
            console.log('Sample price record:', window.priceData[0]);
        }
        
        // Render the data
        loadPriceData();
        
        showNotification(`✅ Loaded ${window.priceData.length} price records from API!`, 'success');
    } catch (error) {
        console.error('❌ Failed to load from API, using mock data instead');
        console.error('Error:', error.message);
        
        // Use mock data when API fails (CORS or network error)
        useMockPriceData();
    }
}

// Fallback to mock data when API is unavailable
function useMockPriceData() {
    console.log('📦 Loading mock price data...');
    
    // Mock data based on actual API format
    window.priceData = [
        {
            id: 1,
            pricePerKWh: 3858,
            penaltyFeePerMinute: 1000,
            validFrom: "2024-03-19T00:00:00",
            validTo: "2025-12-31T00:00:00",
            status: 0  // 0 = Deactive, 1 = Active
        },
        {
            id: 2,
            pricePerKWh: 4200,
            penaltyFeePerMinute: 1200,
            validFrom: "2025-01-01T00:00:00",
            validTo: "2025-06-30T00:00:00",
            status: 0
        },
        {
            id: 3,
            pricePerKWh: 4500,
            penaltyFeePerMinute: 1500,
            validFrom: "2025-07-01T00:00:00",
            validTo: "2025-12-31T00:00:00",
            status: 1  // Active
        }
    ];
    
    loadPriceData();
    
    showNotification('⚠️ Using mock data (API unavailable). Run with start_server.py to use real API.', 'warning');
}

function showPriceTableLoading() {
    const priceTableBody = document.getElementById('priceTableBody');
    if (priceTableBody) {
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; margin-bottom: 16px; display: block; color: var(--electric-blue);"></i>
                    Loading price data...
                </td>
            </tr>
        `;
    }
}

function handlePriceAPIError(error) {
    console.error('Price API Error:', error);
    
    let errorMessage = 'Failed to load price data';
    let errorDetails = '';
    
    if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to API server';
        errorDetails = 'This might be due to CORS policy, network issues, or the server being unavailable. Check the browser console for details.';
    } else if (error.message.includes('HTTP error')) {
        errorMessage = 'API returned an error';
        errorDetails = error.message;
    } else {
        errorDetails = error.message;
    }
    
    showNotification(errorMessage + ': ' + errorDetails, 'error');
    
    const priceTableBody = document.getElementById('priceTableBody');
    if (priceTableBody) {
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; display: block; color: var(--error-red);"></i>
                    <p style="margin-bottom: 8px; font-weight: 600;">${errorMessage}</p>
                    <p style="margin-bottom: 16px; font-size: 14px; color: var(--text-muted);">${errorDetails}</p>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button class="btn btn-primary" onclick="loadPriceDataFromAPI()">
                            <i class="fas fa-sync-alt"></i>
                            Retry
                        </button>
                        <button class="btn btn-info" onclick="window.open('https://swp391.up.railway.app/api/pricetable', '_blank')">
                            <i class="fas fa-external-link-alt"></i>
                            Test API in Browser
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

function loadPriceData() {
    const priceTableBody = document.getElementById('priceTableBody');
    if (!priceTableBody) return;
    
    priceTableBody.innerHTML = '';
    
    if (window.priceData && window.priceData.length > 0) {
        window.priceData.forEach(price => {
            const row = createPriceRow(price);
            priceTableBody.appendChild(row);
        });
    } else {
        priceTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-dollar-sign" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                    No price tables found. Click "Add New Price" to create one.
                </td>
            </tr>
        `;
    }
}

function createPriceRow(price) {
    const row = document.createElement('tr');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    // Normalize field names from API
    // API returns: id, pricePerKWh, penaltyFeePerMinute, validFrom, validTo, status (0 or 1)
    const priceId = price.id || price.priceid || price.priceId || price.PriceID;
    const pricePerKwh = price.pricePerKWh || price.priceperkwh || price.pricePerKwh || price.PricePerKWh || 0;
    const penaltyFee = price.penaltyFeePerMinute || price.penaltyfeeperminute || price.penaltyFeePerMinute || price.PenaltyFeePerMinute || 0;
    const validFrom = price.validFrom || price.validfrom || price.ValidFrom;
    const validTo = price.validTo || price.validto || price.ValidTo;
    
    // Status: 0 = Deactive, 1 = Active (or string "Active"/"Deactive")
    let statusValue = price.status;
    if (typeof statusValue === 'number') {
        statusValue = statusValue === 1 ? 'Active' : 'Deactive';
    } else {
        statusValue = statusValue || 'Deactive';
    }
    
    const validFromDate = new Date(validFrom);
    const validToDate = new Date(validTo);
    validFromDate.setHours(0, 0, 0, 0);
    validToDate.setHours(0, 0, 0, 0);
    
    // Determine if price is expired
    const isExpired = validToDate < today;
    
    // Determine actual status
    let displayStatus = statusValue;
    let statusClass = displayStatus.toLowerCase();
    
    // Check if it's expired
    if (isExpired) {
        displayStatus = 'Deactive';
        statusClass = 'deactive';
    }
    
    row.innerHTML = `
        <td>${escapeHtml(String(priceId))}</td>
        <td>$${parseFloat(pricePerKwh).toFixed(2)}</td>
        <td>$${parseFloat(penaltyFee).toFixed(2)}</td>
        <td>${formatDate(validFrom)}</td>
        <td>${formatDate(validTo)}</td>
        <td>
            <span class="price-status ${statusClass}">
                <i class="fas fa-circle"></i>
                ${displayStatus}
            </span>
        </td>
        <td>
            <div class="price-actions">
                <button class="btn btn-edit" 
                    onclick="editPrice(${priceId})" 
                    ${isExpired ? 'disabled title="Cannot edit expired prices"' : ''}>
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                ${displayStatus === 'Deactive' && !isExpired ? `
                    <button class="btn btn-activate" onclick="activatePrice(${priceId})">
                        <i class="fas fa-check"></i>
                        Activate
                    </button>
                ` : ''}
            </div>
        </td>
    `;
    
    return row;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function openPriceModal(priceId = null) {
    const modal = document.getElementById('priceModal');
    const modalTitle = document.getElementById('priceModalTitle');
    
    if (priceId) {
        // Edit mode
        const price = window.priceData.find(p => {
            const pid = p.id || p.priceid || p.priceId || p.PriceID;
            return pid == priceId;
        });
        if (!price) return;
        
        // Normalize field names
        const pricePerKwh = price.pricePerKWh || price.priceperkwh || price.pricePerKwh || price.PricePerKWh || 0;
        const penaltyFee = price.penaltyFeePerMinute || price.penaltyfeeperminute || price.penaltyFeePerMinute || price.PenaltyFeePerMinute || 0;
        const validFrom = price.validFrom || price.validfrom || price.ValidFrom;
        const validTo = price.validTo || price.validto || price.ValidTo;
        
        // Status: convert number to string
        let statusValue = price.status;
        if (typeof statusValue === 'number') {
            statusValue = statusValue === 1 ? 'Active' : 'Deactive';
        } else {
            statusValue = statusValue || 'Deactive';
        }
        
        // Format dates for input[type="date"] (YYYY-MM-DD)
        const validFromFormatted = validFrom ? new Date(validFrom).toISOString().split('T')[0] : '';
        const validToFormatted = validTo ? new Date(validTo).toISOString().split('T')[0] : '';
        
        modalTitle.textContent = 'Edit Price';
        document.getElementById('priceId').value = priceId;
        document.getElementById('pricePerKwh').value = pricePerKwh;
        document.getElementById('penaltyFee').value = penaltyFee;
        document.getElementById('validFrom').value = validFromFormatted;
        document.getElementById('validTo').value = validToFormatted;
        document.getElementById('priceStatus').value = statusValue;
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Price';
        resetPriceForm();
    }
    
    modal.style.display = 'block';
}

function resetPriceForm() {
    const form = document.getElementById('priceForm');
    if (form) {
        form.reset();
        document.getElementById('priceId').value = '';
        document.getElementById('priceStatus').value = '';
    }
}

function handlePriceFormSubmit(e) {
    e.preventDefault();
    
    const priceId = document.getElementById('priceId').value;
    const pricePerKwh = parseFloat(document.getElementById('pricePerKwh').value);
    const penaltyFee = parseFloat(document.getElementById('penaltyFee').value);
    const validFrom = document.getElementById('validFrom').value;
    const validTo = document.getElementById('validTo').value;
    
    // Validation
    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);
    
    if (toDate <= fromDate) {
        showNotification('Valid To date must be after Valid From date', 'error');
        return;
    }
    
    if (priceId) {
        // Update existing price
        updatePrice(parseInt(priceId), pricePerKwh, penaltyFee, validFrom, validTo);
    } else {
        // Add new price
        addNewPrice(pricePerKwh, penaltyFee, validFrom, validTo);
    }
}

function addNewPrice(pricePerKwh, penaltyFee, validFrom, validTo) {
    // Deactivate any currently active price that overlaps
    const today = new Date();
    const newValidFrom = new Date(validFrom);
    
    window.priceData.forEach(p => {
        let pStatus = p.status;
        if (typeof pStatus === 'number') {
            pStatus = pStatus === 1 ? 'Active' : 'Deactive';
        }
        const pValidTo = p.validTo || p.ValidTo;
        const pValidToDate = new Date(pValidTo);
        if (pStatus === 'Active' && pValidToDate >= today) {
            p.status = 'Deactive';
        }
    });
    
    // Create new price entry
    const nextId = window.priceData.length > 0
        ? Math.max(...window.priceData.map(p => p.id || p.priceId || p.PriceID || 0)) + 1
        : 1;
    const newPrice = {
        id: nextId,
        pricePerKWh: pricePerKwh,
        penaltyFeePerMinute: penaltyFee,
        validFrom,
        validTo,
        status: 1 // Active
    };
    window.priceData.push(newPrice);
    
    // Reload table and close modal
    loadPriceData();
    const modal = document.getElementById('priceModal');
    if (modal) modal.style.display = 'none';
    resetPriceForm();
    
    showNotification('New price added successfully and set as active!', 'success');
}

// Save Port Changes Function
function savePortChanges(stationId, pointId, portId) {
    const station = window.mockData.stations.find(s => getStationId(s) == stationId);
    if (!station) {
        showNotification('❌ Station not found!', 'error');
        return;
    }
    
    const point = station.points.find(p => (p.id || p.pointId || p.point) == pointId);
    if (!point) {
        showNotification('❌ Point not found!', 'error');
        return;
    }
    
    const port = point.ports.find(p => (p.id || p.portId) == portId);
    if (!port) {
        showNotification('❌ Port not found!', 'error');
        return;
    }
    
    // Get new values from the input fields
    const powerInput = document.getElementById(`power_${portId}`);
    const statusSelect = document.getElementById(`status_${portId}`);
    
    if (!powerInput || !statusSelect) {
        showNotification('❌ Input fields not found!', 'error');
        return;
    }
    
    const newPower = parseInt(powerInput.value);
    const newStatus = statusSelect.value;
    
    // Validate power value
    if (isNaN(newPower) || newPower < 1 || newPower > 350) {
        showNotification('❌ Power must be between 1 and 350 kW!', 'error');
        return;
    }
    
    // Save the changes
    const oldPower = port.power;
    const oldStatus = port.status;
    port.power = newPower;
    port.status = newStatus;
    
    // Update stats if needed
    updateStationsStats();
    
    // Show success notification
    showNotification(`✅ Port "${portId}" updated: ${oldPower}kW→${newPower}kW, ${oldStatus}→${newStatus}`, 'success');
}

function updatePrice(priceId, pricePerKwh, penaltyFee, validFrom, validTo) {
    const priceIndex = window.priceData.findIndex(p => p.priceId === priceId);
    if (priceIndex === -1) return;
    
    const price = window.priceData[priceIndex];
    
    // Update price data
    price.pricePerKwh = pricePerKwh;
    price.penaltyFeePerMinute = penaltyFee;
    price.validFrom = validFrom;
    price.validTo = validTo;
    
    // Reload table
    loadPriceData();
    
    // Close modal
    document.getElementById('priceModal').style.display = 'none';
    resetPriceForm();
    
    showNotification('Price updated successfully!', 'success');
}

function editPrice(priceId) {
    const price = window.priceData.find(p => {
        const pid = p.id || p.priceid || p.priceId || p.PriceID;
        return pid == priceId;
    });
    if (!price) return;
    
    // Check if expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const validTo = price.validTo || price.validto || price.ValidTo;
    const validToDate = new Date(validTo);
    validToDate.setHours(0, 0, 0, 0);
    
    if (validToDate < today) {
        showNotification('Cannot edit expired prices', 'error');
        return;
    }
    
    openPriceModal(priceId);
}

function activatePrice(priceId) {
    const price = window.priceData.find(p => {
        const pid = p.id || p.priceid || p.priceId || p.PriceID;
        return pid == priceId;
    });
    if (!price) return;
    
    // Check if expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const validTo = price.validTo || price.validto || price.ValidTo;
    const validToDate = new Date(validTo);
    validToDate.setHours(0, 0, 0, 0);
    
    if (validToDate < today) {
        showNotification('Cannot activate expired prices', 'error');
        return;
    }
    
    // Deactivate all currently active prices
    window.priceData.forEach(p => {
        let pStatus = p.status;
        // Convert number to string for comparison
        if (typeof pStatus === 'number') {
            pStatus = pStatus === 1 ? 'Active' : 'Deactive';
        }
        
        if (pStatus === 'Active' || pStatus === 1) {
            p.status = 0; // Set to Deactive (0)
        }
    });
    
    // Activate this price
    price.status = 1; // Set to Active (1)
    
    // Reload table
    loadPriceData();
    
    showNotification(`Price ID ${priceId} is now active!`, 'success');
}

console.log('📊 Admin Dashboard Ready!');
console.log('🔧 Available Features:');
console.log('  - Station Management & Control');
console.log('  - User & Package Management');
console.log('  - Reports & Statistics');
console.log('  - Price Management');
