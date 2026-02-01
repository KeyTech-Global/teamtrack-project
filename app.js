// TeamTrack Application - Frontend Logic
// For GitHub Pages Deployment

// API Configuration
const API_BASE = ''; // Empty for GitHub Pages

// Global State
let currentUser = null;
let appData = {
    users: [],
    teams: [],
    projects: [],
    tasks: []
};

// DOM Elements
const elements = {
    // Screens
    loginScreen: document.getElementById('loginScreen'),
    appScreen: document.getElementById('appScreen'),
    
    // Login
    loginBtn: document.getElementById('loginBtn'),
    userName: document.getElementById('userName'),
    userRole: document.getElementById('userRole'),
    
    // App
    logoutBtn: document.getElementById('logoutBtn'),
    menuToggle: document.getElementById('menuToggle'),
    sidebar: document.getElementById('sidebar'),
    userInfo: document.getElementById('userInfo'),
    roleBadge: document.getElementById('roleBadge'),
    
    // Views
    views: {
        dashboard: document.getElementById('dashboardView'),
        teams: document.getElementById('teamsView'),
        projects: document.getElementById('projectsView'),
        tasks: document.getElementById('tasksView'),
        profile: document.getElementById('profileView')
    },
    
    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    
    // Stats
    statTeams: document.getElementById('statTeams'),
    statProjects: document.getElementById('statProjects'),
    statTasks: document.getElementById('statTasks'),
    statMyTasks: document.getElementById('statMyTasks'),
    
    // Lists
    teamsList: document.getElementById('teamsList'),
    projectsList: document.getElementById('projectsList'),
    tasksList: document.getElementById('tasksList'),
    
    // Buttons
    createTeamBtn: document.getElementById('createTeamBtn'),
    createProjectBtn: document.getElementById('createProjectBtn'),
    createTaskBtn: document.getElementById('createTaskBtn'),
    addTeamBtn: document.getElementById('addTeamBtn'),
    addProjectBtn: document.getElementById('addProjectBtn'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    saveProfileBtn: document.getElementById('saveProfileBtn'),
    
    // Modals
    teamModal: document.getElementById('teamModal'),
    projectModal: document.getElementById('projectModal'),
    taskModal: document.getElementById('taskModal'),
    
    // Forms
    teamForm: document.getElementById('teamForm'),
    teamName: document.getElementById('teamName'),
    teamMembers: document.getElementById('teamMembers'),
    
    projectForm: document.getElementById('projectForm'),
    projectName: document.getElementById('projectName'),
    projectTeam: document.getElementById('projectTeam'),
    projectDescription: document.getElementById('projectDescription'),
    projectStatus: document.getElementById('projectStatus'),
    
    taskForm: document.getElementById('taskForm'),
    taskTitle: document.getElementById('taskTitle'),
    taskProject: document.getElementById('taskProject'),
    taskAssignee: document.getElementById('taskAssignee'),
    taskPriority: document.getElementById('taskPriority'),
    taskStatus: document.getElementById('taskStatus'),
    taskDescription: document.getElementById('taskDescription'),
    
    profileName: document.getElementById('profileName'),
    profileRole: document.getElementById('profileRole'),
    
    // Modal cancel buttons
    cancelTeamBtn: document.getElementById('cancelTeamBtn'),
    cancelProjectBtn: document.getElementById('cancelProjectBtn'),
    cancelTaskBtn: document.getElementById('cancelTaskBtn'),
    
    // Loading
    loadingOverlay: document.getElementById('loadingOverlay')
};

// API Function for GitHub Pages
async function apiRequest(endpoint, options = {}) {
    try {
        // Use mock backend for GitHub Pages
        const result = await window.mockApi.request(endpoint, options);
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showMessage('Something went wrong. Please try again.', 'error');
        throw error;
    }
}

// Load all app data
async function loadAppData() {
    showLoading(true);
    try {
        const data = await apiRequest('/api/data');
        appData = data;
        updateStats();
        populateSelectors();
        renderTeams();
        renderProjects();
        renderTasks();
    } catch (error) {
        console.error('Failed to load data:', error);
    } finally {
        showLoading(false);
    }
}

// Save data
async function saveData(type, data) {
    try {
        const result = await apiRequest(`/api/${type}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return result;
    } catch (error) {
        console.error('Save failed:', error);
        throw error;
    }
}

// Delete data
async function deleteData(type, id) {
    try {
        const result = await apiRequest(`/api/delete/${type}/${id}`, {
            method: 'DELETE'
        });
        return result;
    } catch (error) {
        console.error('Delete failed:', error);
        throw error;
    }
}

// UI Functions
function showLoading(show) {
    elements.loadingOverlay.classList.toggle('hidden', !show);
}

function showMessage(message, type = 'info') {
    // Simple alert for demo
    if (type === 'error') {
        alert('Error: ' + message);
    } else {
        alert(message);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

function showView(viewName) {
    // Hide all views
    Object.values(elements.views).forEach(view => {
        view?.classList.remove('active');
    });
    
    // Show selected view
    if (elements.views[viewName]) {
        elements.views[viewName].classList.add('active');
    }
    
    // Update navigation
    elements.navLinks.forEach(link => {
        link.classList.toggle('active', 
            link.getAttribute('data-view') === viewName
        );
    });
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('open');
    }
}

function updateStats() {
    elements.statTeams.textContent = appData.teams.length;
    elements.statProjects.textContent = appData.projects.length;
    elements.statTasks.textContent = appData.tasks.length;
    
    const myTasks = appData.tasks.filter(task => 
        task.assigneeId === currentUser?.id
    ).length;
    elements.statMyTasks.textContent = myTasks;
}

function populateSelectors() {
    // Project team selector
    elements.projectTeam.innerHTML = '<option value="">Select Team</option>' +
        appData.teams.map(team => 
            `<option value="${team.id}">${escapeHtml(team.name)}</option>`
        ).join('');
    
    // Task project selector
    elements.taskProject.innerHTML = '<option value="">Select Project</option>' +
        appData.projects.map(project => 
            `<option value="${project.id}">${escapeHtml(project.name)}</option>`
        ).join('');
    
    // Task assignee selector
    const assignees = appData.users.filter(user => user.role !== 'guest');
    elements.taskAssignee.innerHTML = '<option value="">Unassigned</option>' +
        assignees.map(user => 
            `<option value="${user.id}">${escapeHtml(user.name)}</option>`
        ).join('');
}

// Render Functions
function renderTeams() {
    if (appData.teams.length === 0) {
        elements.teamsList.innerHTML = '<p class="empty-state">No teams created yet.</p>';
        return;
    }
    
    elements.teamsList.innerHTML = appData.teams.map(team => {
        const members = appData.users.filter(user => 
            team.members?.includes(user.id)
        );
        const projectCount = appData.projects.filter(p => p.teamId === team.id).length;
        
        const canManage = currentUser?.role === 'client';
        
        return `
            <div class="card" data-id="${team.id}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <h4>${escapeHtml(team.name)}</h4>
                    <div>
                        ${canManage ? `<button onclick="editTeam('${team.id}')" style="background: none; border: none; color: #4f46e5; cursor: pointer; margin-left: 10px;" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${canManage ? `<button onclick="deleteTeam('${team.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; margin-left: 10px;" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
                <p><strong>Members:</strong> ${members.length}</p>
                <p><strong>Projects:</strong> ${projectCount}</p>
                <div style="margin-top: 10px; font-size: 12px; color: #6b7280;">
                    ${members.map(m => 
                        `<span style="background: #e5e7eb; padding: 2px 8px; border-radius: 10px; margin-right: 5px; display: inline-block; margin-bottom: 5px;">
                            ${escapeHtml(m.name)}
                        </span>`
                    ).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderProjects() {
    if (appData.projects.length === 0) {
        elements.projectsList.innerHTML = '<p class="empty-state">No projects created yet.</p>';
        return;
    }
    
    elements.projectsList.innerHTML = appData.projects.map(project => {
        const team = appData.teams.find(t => t.id === project.teamId);
        const taskCount = appData.tasks.filter(t => t.projectId === project.id).length;
        const statusColor = getStatusColor(project.status);
        
        const canManage = currentUser?.role === 'client';
        
        return `
            <div class="card" data-id="${project.id}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <h4>${escapeHtml(project.name)}</h4>
                    <div>
                        ${canManage ? `<button onclick="editProject('${project.id}')" style="background: none; border: none; color: #4f46e5; cursor: pointer; margin-left: 10px;" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${canManage ? `<button onclick="deleteProject('${project.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; margin-left: 10px;" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
                <p>${escapeHtml(project.description || 'No description')}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 14px;">
                    <div>
                        <div style="color: #6b7280;">Team: ${team ? escapeHtml(team.name) : 'None'}</div>
                        <div style="color: #6b7280;">Tasks: ${taskCount}</div>
                    </div>
                    <div style="background: ${statusColor}; color: white; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">
                        ${project.status}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTasks() {
    if (appData.tasks.length === 0) {
        elements.tasksList.innerHTML = '<p class="empty-state">No tasks created yet.</p>';
        return;
    }
    
    elements.tasksList.innerHTML = appData.tasks.map(task => {
        const project = appData.projects.find(p => p.id === task.projectId);
        const assignee = appData.users.find(u => u.id === task.assigneeId);
        const priorityColor = getPriorityColor(task.priority);
        const statusColor = getStatusColor(task.status);
        
        const canEdit = currentUser?.role === 'client' || 
                       (currentUser?.role === 'member' && task.assigneeId === currentUser.id);
        const canDelete = currentUser?.role === 'client';
        
        return `
            <div class="card" data-id="${task.id}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <h4>${escapeHtml(task.title)}</h4>
                    <div>
                        ${canEdit ? `<button onclick="editTask('${task.id}')" style="background: none; border: none; color: #4f46e5; cursor: pointer; margin-left: 10px;" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${canDelete ? `<button onclick="deleteTask('${task.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; margin-left: 10px;" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
                <p>${escapeHtml(task.description || 'No description')}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 14px;">
                    <div>
                        <div style="color: #6b7280;">Project: ${project ? escapeHtml(project.name) : 'None'}</div>
                        <div style="color: #6b7280;">Assignee: ${assignee ? escapeHtml(assignee.name) : 'Unassigned'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: ${priorityColor}; color: white; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; margin-bottom: 5px;">
                            ${task.priority}
                        </div>
                        <div style="background: ${statusColor}; color: white; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">
                            ${task.status}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Helper functions
function getStatusColor(status) {
    const colors = {
        'Planned': '#3b82f6',
        'In Progress': '#f59e0b',
        'Blocked': '#ef4444',
        'Done': '#10b981',
        'Open': '#3b82f6'
    };
    return colors[status] || '#6b7280';
}

function getPriorityColor(priority) {
    const colors = {
        'Low': '#10b981',
        'Medium': '#f59e0b',
        'High': '#ef4444',
        'Critical': '#dc2626'
    };
    return colors[priority] || '#6b7280';
}

// Global functions for onclick events
window.editTeam = function(teamId) {
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can edit teams', 'error');
        return;
    }
    
    const team = appData.teams.find(t => t.id === teamId);
    if (!team) return;
    
    elements.teamName.value = team.name;
    const members = appData.users.filter(u => team.members?.includes(u.id)).map(m => m.name).join(', ');
    elements.teamMembers.value = members;
    
    // Store team ID in a data attribute
    elements.teamForm.dataset.teamId = teamId;
    
    openModal('teamModal');
};

window.deleteTeam = async function(teamId) {
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can delete teams', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this team?')) {
        try {
            await deleteData('teams', teamId);
            showMessage('Team deleted successfully', 'success');
            loadAppData();
        } catch (error) {
            showMessage('Failed to delete team', 'error');
        }
    }
};

window.editProject = function(projectId) {
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can edit projects', 'error');
        return;
    }
    
    const project = appData.projects.find(p => p.id === projectId);
    if (!project) return;
    
    elements.projectName.value = project.name;
    elements.projectTeam.value = project.teamId;
    elements.projectDescription.value = project.description || '';
    elements.projectStatus.value = project.status;
    
    elements.projectForm.dataset.projectId = projectId;
    
    openModal('projectModal');
};

window.deleteProject = async function(projectId) {
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can delete projects', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            await deleteData('projects', projectId);
            showMessage('Project deleted successfully', 'success');
            loadAppData();
        } catch (error) {
            showMessage('Failed to delete project', 'error');
        }
    }
};

window.editTask = function(taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check permissions
    if (currentUser?.role !== 'client' && 
        (currentUser?.role !== 'member' || task.assigneeId !== currentUser.id)) {
        showMessage('You do not have permission to edit this task', 'error');
        return;
    }
    
    elements.taskTitle.value = task.title;
    elements.taskProject.value = task.projectId;
    elements.taskAssignee.value = task.assigneeId || '';
    elements.taskPriority.value = task.priority;
    elements.taskStatus.value = task.status;
    elements.taskDescription.value = task.description || '';
    
    elements.taskForm.dataset.taskId = taskId;
    
    openModal('taskModal');
};

window.deleteTask = async function(taskId) {
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can delete tasks', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await deleteData('tasks', taskId);
            showMessage('Task deleted successfully', 'success');
            loadAppData();
        } catch (error) {
            showMessage('Failed to delete task', 'error');
        }
    }
};

// Update UI based on role
function updateUIForRole() {
    const isClient = currentUser?.role === 'client';
    const isMember = currentUser?.role === 'member';
    const isGuest = currentUser?.role === 'guest';
    
    // Update user info
    elements.userInfo.textContent = `Welcome, ${currentUser?.name}`;
    elements.roleBadge.textContent = currentUser?.role.charAt(0).toUpperCase() + 
                                    currentUser?.role.slice(1);
    
    // Show/hide buttons based on role
    const createButtons = [
        elements.createTeamBtn,
        elements.createProjectBtn,
        elements.createTaskBtn,
        elements.addTeamBtn,
        elements.addProjectBtn,
        elements.addTaskBtn
    ];
    
    createButtons.forEach(btn => {
        if (btn) {
            btn.disabled = isGuest;
            btn.style.opacity = isGuest ? '0.5' : '1';
            btn.style.cursor = isGuest ? 'not-allowed' : 'pointer';
        }
    });
    
    // Update profile form
    elements.profileName.value = currentUser?.name || '';
    elements.profileRole.value = currentUser?.role || 'guest';
}

// Event Handlers
async function handleLogin() {
    const name = elements.userName.value.trim();
    const role = elements.userRole.value;
    
    if (!name) {
        showMessage('Please enter your name', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const user = await apiRequest('/api/login', {
            method: 'POST',
            body: JSON.stringify({ name, role })
        });
        
        currentUser = user;
        
        // Switch to app screen
        elements.loginScreen.classList.add('hidden');
        elements.appScreen.classList.remove('hidden');
        
        // Load app data
        await loadAppData();
        updateUIForRole();
        showView('dashboard');
        
        showMessage(`Welcome, ${user.name}!`, 'success');
        
    } catch (error) {
        showMessage('Login failed', 'error');
    } finally {
        showLoading(false);
    }
}

function handleLogout() {
    currentUser = null;
    elements.appScreen.classList.add('hidden');
    elements.loginScreen.classList.remove('hidden');
    elements.userName.value = '';
    showMessage('Logged out successfully', 'info');
}

async function handleCreateTeam(e) {
    e.preventDefault();
    
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can create teams', 'error');
        return;
    }
    
    const name = elements.teamName.value.trim();
    if (!name) {
        showMessage('Please enter team name', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // Process members
        const membersText = elements.teamMembers.value.trim();
        const memberNames = membersText ? 
            membersText.split(',').map(m => m.trim()).filter(m => m) : [];
        
        const memberIds = [];
        for (const memberName of memberNames) {
            // Check if user exists
            let user = appData.users.find(u => 
                u.name.toLowerCase() === memberName.toLowerCase()
            );
            
            if (!user) {
                // Create new user
                const newUser = await apiRequest('/api/login', {
                    method: 'POST',
                    body: JSON.stringify({ 
                        name: memberName, 
                        role: 'member' 
                    })
                });
                user = newUser;
            }
            
            memberIds.push(user.id);
        }
        
        const teamId = elements.teamForm.dataset.teamId;
        const teamData = {
            id: teamId || undefined, // Let backend generate if new
            name: name,
            members: memberIds
        };
        
        await saveData('teams', teamData);
        
        closeModal('teamModal');
        delete elements.teamForm.dataset.teamId;
        await loadAppData();
        showMessage(teamId ? 'Team updated!' : 'Team created!', 'success');
        
    } catch (error) {
        showMessage('Failed to save team', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleCreateProject(e) {
    e.preventDefault();
    
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can create projects', 'error');
        return;
    }
    
    const name = elements.projectName.value.trim();
    const teamId = elements.projectTeam.value;
    
    if (!name) {
        showMessage('Please enter project name', 'error');
        return;
    }
    
    if (!teamId) {
        showMessage('Please select a team', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const projectId = elements.projectForm.dataset.projectId;
        const projectData = {
            id: projectId || undefined,
            name: name,
            teamId: teamId,
            description: elements.projectDescription.value.trim(),
            status: elements.projectStatus.value
        };
        
        await saveData('projects', projectData);
        
        closeModal('projectModal');
        delete elements.projectForm.dataset.projectId;
        await loadAppData();
        showMessage(projectId ? 'Project updated!' : 'Project created!', 'success');
        
    } catch (error) {
        showMessage('Failed to save project', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleCreateTask(e) {
    e.preventDefault();
    
    if (currentUser?.role !== 'client' && currentUser?.role !== 'member') {
        showMessage('You do not have permission to create tasks', 'error');
        return;
    }
    
    const title = elements.taskTitle.value.trim();
    const projectId = elements.taskProject.value;
    
    if (!title) {
        showMessage('Please enter task title', 'error');
        return;
    }
    
    if (!projectId) {
        showMessage('Please select a project', 'error');
        return;
    }
    
    // Check if member can access this project
    if (currentUser?.role === 'member') {
        const project = appData.projects.find(p => p.id === projectId);
        const userTeams = appData.teams.filter(team => 
            team.members?.includes(currentUser.id)
        ).map(t => t.id);
        
        if (!project || !userTeams.includes(project.teamId)) {
            showMessage('You do not have access to this project', 'error');
            return;
        }
    }
    
    try {
        showLoading(true);
        
        const taskId = elements.taskForm.dataset.taskId;
        const taskData = {
            id: taskId || undefined,
            title: title,
            projectId: projectId,
            assigneeId: elements.taskAssignee.value || null,
            priority: elements.taskPriority.value,
            status: elements.taskStatus.value,
            description: elements.taskDescription.value.trim()
        };
        
        await saveData('tasks', taskData);
        
        closeModal('taskModal');
        delete elements.taskForm.dataset.taskId;
        await loadAppData();
        showMessage(taskId ? 'Task updated!' : 'Task created!', 'success');
        
    } catch (error) {
        showMessage('Failed to save task', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleSaveProfile() {
    const name = elements.profileName.value.trim();
    const role = elements.profileRole.value;
    
    if (!name) {
        showMessage('Please enter your name', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // Update user data
        const userData = {
            id: currentUser.id,
            name: name,
            role: role
        };
        
        await saveData('users', userData);
        currentUser = userData;
        updateUIForRole();
        
        showMessage('Profile updated successfully!', 'success');
        
    } catch (error) {
        showMessage('Failed to update profile', 'error');
    } finally {
        showLoading(false);
    }
}

// Initialize Event Listeners
function initEventListeners() {
    // Login
    elements.loginBtn.addEventListener('click', handleLogin);
    elements.userName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Logout
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // Menu toggle
    elements.menuToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('open');
    });
    
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            showView(viewName);
        });
    });
    
    // Create buttons
    elements.createTeamBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client') {
            delete elements.teamForm.dataset.teamId;
            openModal('teamModal');
        }
    });
    
    elements.createProjectBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client') {
            delete elements.projectForm.dataset.projectId;
            openModal('projectModal');
        }
    });
    
    elements.createTaskBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client' || currentUser?.role === 'member') {
            delete elements.taskForm.dataset.taskId;
            openModal('taskModal');
        }
    });
    
    elements.addTeamBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client') {
            delete elements.teamForm.dataset.teamId;
            openModal('teamModal');
        }
    });
    
    elements.addProjectBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client') {
            delete elements.projectForm.dataset.projectId;
            openModal('projectModal');
        }
    });
    
    elements.addTaskBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client' || currentUser?.role === 'member') {
            delete elements.taskForm.dataset.taskId;
            openModal('taskModal');
        }
    });
    
    // Forms
    elements.teamForm?.addEventListener('submit', handleCreateTeam);
    elements.projectForm?.addEventListener('submit', handleCreateProject);
    elements.taskForm?.addEventListener('submit', handleCreateTask);
    elements.saveProfileBtn?.addEventListener('click', handleSaveProfile);
    
    // Modal cancel buttons
    elements.cancelTeamBtn?.addEventListener('click', () => {
        closeModal('teamModal');
        delete elements.teamForm.dataset.teamId;
    });
    
    elements.cancelProjectBtn?.addEventListener('click', () => {
        closeModal('projectModal');
        delete elements.projectForm.dataset.projectId;
    });
    
    elements.cancelTaskBtn?.addEventListener('click', () => {
        closeModal('taskModal');
        delete elements.taskForm.dataset.taskId;
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
                // Clear stored IDs
                if (modal.id === 'teamModal') delete elements.teamForm.dataset.teamId;
                if (modal.id === 'projectModal') delete elements.projectForm.dataset.projectId;
                if (modal.id === 'taskModal') delete elements.taskForm.dataset.taskId;
            }
        });
    });
}

// Initialize App
function initApp() {
    initEventListeners();
    
    // Check if user is already logged in (from localStorage for demo)
    const savedUser = localStorage.getItem('teamtrack_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            elements.loginScreen.classList.add('hidden');
            elements.appScreen.classList.remove('hidden');
            elements.userName.value = currentUser.name;
            elements.userRole.value = currentUser.role;
            updateUIForRole();
            loadAppData();
        } catch (error) {
            localStorage.removeItem('teamtrack_user');
        }
    }
    
    // Save user to localStorage on login (for demo persistence)
    const originalHandleLogin = handleLogin;
    window.handleLogin = async function() {
        await originalHandleLogin();
        if (currentUser) {
            localStorage.setItem('teamtrack_user', JSON.stringify(currentUser));
        }
    };
    
    // Clear localStorage on logout
    const originalHandleLogout = handleLogout;
    window.handleLogout = function() {
        originalHandleLogout();
        localStorage.removeItem('teamtrack_user');
    };
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);// TeamTrack Application - Frontend Logic
// For GitHub Pages Deployment

// API Configuration
const API_BASE = ''; // Empty for GitHub Pages

// Global State
let currentUser = null;
let appData = {
    users: [],
    teams: [],
    projects: [],
    tasks: []
};

// DOM Elements
const elements = {
    // Screens
    loginScreen: document.getElementById('loginScreen'),
    appScreen: document.getElementById('appScreen'),
    
    // Login
    loginBtn: document.getElementById('loginBtn'),
    userName: document.getElementById('userName'),
    userRole: document.getElementById('userRole'),
    
    // App
    logoutBtn: document.getElementById('logoutBtn'),
    menuToggle: document.getElementById('menuToggle'),
    sidebar: document.getElementById('sidebar'),
    userInfo: document.getElementById('userInfo'),
    roleBadge: document.getElementById('roleBadge'),
    
    // Views
    views: {
        dashboard: document.getElementById('dashboardView'),
        teams: document.getElementById('teamsView'),
        projects: document.getElementById('projectsView'),
        tasks: document.getElementById('tasksView'),
        profile: document.getElementById('profileView')
    },
    
    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    
    // Stats
    statTeams: document.getElementById('statTeams'),
    statProjects: document.getElementById('statProjects'),
    statTasks: document.getElementById('statTasks'),
    statMyTasks: document.getElementById('statMyTasks'),
    
    // Lists
    teamsList: document.getElementById('teamsList'),
    projectsList: document.getElementById('projectsList'),
    tasksList: document.getElementById('tasksList'),
    
    // Buttons
    createTeamBtn: document.getElementById('createTeamBtn'),
    createProjectBtn: document.getElementById('createProjectBtn'),
    createTaskBtn: document.getElementById('createTaskBtn'),
    addTeamBtn: document.getElementById('addTeamBtn'),
    addProjectBtn: document.getElementById('addProjectBtn'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    saveProfileBtn: document.getElementById('saveProfileBtn'),
    
    // Modals
    teamModal: document.getElementById('teamModal'),
    projectModal: document.getElementById('projectModal'),
    taskModal: document.getElementById('taskModal'),
    
    // Forms
    teamForm: document.getElementById('teamForm'),
    teamName: document.getElementById('teamName'),
    teamMembers: document.getElementById('teamMembers'),
    
    projectForm: document.getElementById('projectForm'),
    projectName: document.getElementById('projectName'),
    projectTeam: document.getElementById('projectTeam'),
    projectDescription: document.getElementById('projectDescription'),
    projectStatus: document.getElementById('projectStatus'),
    
    taskForm: document.getElementById('taskForm'),
    taskTitle: document.getElementById('taskTitle'),
    taskProject: document.getElementById('taskProject'),
    taskAssignee: document.getElementById('taskAssignee'),
    taskPriority: document.getElementById('taskPriority'),
    taskStatus: document.getElementById('taskStatus'),
    taskDescription: document.getElementById('taskDescription'),
    
    profileName: document.getElementById('profileName'),
    profileRole: document.getElementById('profileRole'),
    
    // Modal cancel buttons
    cancelTeamBtn: document.getElementById('cancelTeamBtn'),
    cancelProjectBtn: document.getElementById('cancelProjectBtn'),
    cancelTaskBtn: document.getElementById('cancelTaskBtn'),
    
    // Loading
    loadingOverlay: document.getElementById('loadingOverlay')
};

// API Function for GitHub Pages
async function apiRequest(endpoint, options = {}) {
    try {
        // Use mock backend for GitHub Pages
        const result = await window.mockApi.request(endpoint, options);
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showMessage('Something went wrong. Please try again.', 'error');
        throw error;
    }
}

// Load all app data
async function loadAppData() {
    showLoading(true);
    try {
        const data = await apiRequest('/api/data');
        appData = data;
        updateStats();
        populateSelectors();
        renderTeams();
        renderProjects();
        renderTasks();
    } catch (error) {
        console.error('Failed to load data:', error);
    } finally {
        showLoading(false);
    }
}

// Save data
async function saveData(type, data) {
    try {
        const result = await apiRequest(`/api/${type}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return result;
    } catch (error) {
        console.error('Save failed:', error);
        throw error;
    }
}

// Delete data
async function deleteData(type, id) {
    try {
        const result = await apiRequest(`/api/delete/${type}/${id}`, {
            method: 'DELETE'
        });
        return result;
    } catch (error) {
        console.error('Delete failed:', error);
        throw error;
    }
}

// UI Functions
function showLoading(show) {
    elements.loadingOverlay.classList.toggle('hidden', !show);
}

function showMessage(message, type = 'info') {
    // Simple alert for demo
    if (type === 'error') {
        alert('Error: ' + message);
    } else {
        alert(message);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

function showView(viewName) {
    // Hide all views
    Object.values(elements.views).forEach(view => {
        view?.classList.remove('active');
    });
    
    // Show selected view
    if (elements.views[viewName]) {
        elements.views[viewName].classList.add('active');
    }
    
    // Update navigation
    elements.navLinks.forEach(link => {
        link.classList.toggle('active', 
            link.getAttribute('data-view') === viewName
        );
    });
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('open');
    }
}

function updateStats() {
    elements.statTeams.textContent = appData.teams.length;
    elements.statProjects.textContent = appData.projects.length;
    elements.statTasks.textContent = appData.tasks.length;
    
    const myTasks = appData.tasks.filter(task => 
        task.assigneeId === currentUser?.id
    ).length;
    elements.statMyTasks.textContent = myTasks;
}

function populateSelectors() {
    // Project team selector
    elements.projectTeam.innerHTML = '<option value="">Select Team</option>' +
        appData.teams.map(team => 
            `<option value="${team.id}">${escapeHtml(team.name)}</option>`
        ).join('');
    
    // Task project selector
    elements.taskProject.innerHTML = '<option value="">Select Project</option>' +
        appData.projects.map(project => 
            `<option value="${project.id}">${escapeHtml(project.name)}</option>`
        ).join('');
    
    // Task assignee selector
    const assignees = appData.users.filter(user => user.role !== 'guest');
    elements.taskAssignee.innerHTML = '<option value="">Unassigned</option>' +
        assignees.map(user => 
            `<option value="${user.id}">${escapeHtml(user.name)}</option>`
        ).join('');
}

// Render Functions
function renderTeams() {
    if (appData.teams.length === 0) {
        elements.teamsList.innerHTML = '<p class="empty-state">No teams created yet.</p>';
        return;
    }
    
    elements.teamsList.innerHTML = appData.teams.map(team => {
        const members = appData.users.filter(user => 
            team.members?.includes(user.id)
        );
        const projectCount = appData.projects.filter(p => p.teamId === team.id).length;
        
        const canManage = currentUser?.role === 'client';
        
        return `
            <div class="card" data-id="${team.id}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <h4>${escapeHtml(team.name)}</h4>
                    <div>
                        ${canManage ? `<button onclick="editTeam('${team.id}')" style="background: none; border: none; color: #4f46e5; cursor: pointer; margin-left: 10px;" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${canManage ? `<button onclick="deleteTeam('${team.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; margin-left: 10px;" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
                <p><strong>Members:</strong> ${members.length}</p>
                <p><strong>Projects:</strong> ${projectCount}</p>
                <div style="margin-top: 10px; font-size: 12px; color: #6b7280;">
                    ${members.map(m => 
                        `<span style="background: #e5e7eb; padding: 2px 8px; border-radius: 10px; margin-right: 5px; display: inline-block; margin-bottom: 5px;">
                            ${escapeHtml(m.name)}
                        </span>`
                    ).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderProjects() {
    if (appData.projects.length === 0) {
        elements.projectsList.innerHTML = '<p class="empty-state">No projects created yet.</p>';
        return;
    }
    
    elements.projectsList.innerHTML = appData.projects.map(project => {
        const team = appData.teams.find(t => t.id === project.teamId);
        const taskCount = appData.tasks.filter(t => t.projectId === project.id).length;
        const statusColor = getStatusColor(project.status);
        
        const canManage = currentUser?.role === 'client';
        
        return `
            <div class="card" data-id="${project.id}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <h4>${escapeHtml(project.name)}</h4>
                    <div>
                        ${canManage ? `<button onclick="editProject('${project.id}')" style="background: none; border: none; color: #4f46e5; cursor: pointer; margin-left: 10px;" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${canManage ? `<button onclick="deleteProject('${project.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; margin-left: 10px;" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
                <p>${escapeHtml(project.description || 'No description')}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 14px;">
                    <div>
                        <div style="color: #6b7280;">Team: ${team ? escapeHtml(team.name) : 'None'}</div>
                        <div style="color: #6b7280;">Tasks: ${taskCount}</div>
                    </div>
                    <div style="background: ${statusColor}; color: white; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">
                        ${project.status}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTasks() {
    if (appData.tasks.length === 0) {
        elements.tasksList.innerHTML = '<p class="empty-state">No tasks created yet.</p>';
        return;
    }
    
    elements.tasksList.innerHTML = appData.tasks.map(task => {
        const project = appData.projects.find(p => p.id === task.projectId);
        const assignee = appData.users.find(u => u.id === task.assigneeId);
        const priorityColor = getPriorityColor(task.priority);
        const statusColor = getStatusColor(task.status);
        
        const canEdit = currentUser?.role === 'client' || 
                       (currentUser?.role === 'member' && task.assigneeId === currentUser.id);
        const canDelete = currentUser?.role === 'client';
        
        return `
            <div class="card" data-id="${task.id}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <h4>${escapeHtml(task.title)}</h4>
                    <div>
                        ${canEdit ? `<button onclick="editTask('${task.id}')" style="background: none; border: none; color: #4f46e5; cursor: pointer; margin-left: 10px;" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>` : ''}
                        ${canDelete ? `<button onclick="deleteTask('${task.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; margin-left: 10px;" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                    </div>
                </div>
                <p>${escapeHtml(task.description || 'No description')}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 14px;">
                    <div>
                        <div style="color: #6b7280;">Project: ${project ? escapeHtml(project.name) : 'None'}</div>
                        <div style="color: #6b7280;">Assignee: ${assignee ? escapeHtml(assignee.name) : 'Unassigned'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: ${priorityColor}; color: white; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; margin-bottom: 5px;">
                            ${task.priority}
                        </div>
                        <div style="background: ${statusColor}; color: white; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600;">
                            ${task.status}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Helper functions
function getStatusColor(status) {
    const colors = {
        'Planned': '#3b82f6',
        'In Progress': '#f59e0b',
        'Blocked': '#ef4444',
        'Done': '#10b981',
        'Open': '#3b82f6'
    };
    return colors[status] || '#6b7280';
}

function getPriorityColor(priority) {
    const colors = {
        'Low': '#10b981',
        'Medium': '#f59e0b',
        'High': '#ef4444',
        'Critical': '#dc2626'
    };
    return colors[priority] || '#6b7280';
}

// Global functions for onclick events
window.editTeam = function(teamId) {
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can edit teams', 'error');
        return;
    }
    
    const team = appData.teams.find(t => t.id === teamId);
    if (!team) return;
    
    elements.teamName.value = team.name;
    const members = appData.users.filter(u => team.members?.includes(u.id)).map(m => m.name).join(', ');
    elements.teamMembers.value = members;
    
    // Store team ID in a data attribute
    elements.teamForm.dataset.teamId = teamId;
    
    openModal('teamModal');
};

window.deleteTeam = async function(teamId) {
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can delete teams', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this team?')) {
        try {
            await deleteData('teams', teamId);
            showMessage('Team deleted successfully', 'success');
            loadAppData();
        } catch (error) {
            showMessage('Failed to delete team', 'error');
        }
    }
};

window.editProject = function(projectId) {
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can edit projects', 'error');
        return;
    }
    
    const project = appData.projects.find(p => p.id === projectId);
    if (!project) return;
    
    elements.projectName.value = project.name;
    elements.projectTeam.value = project.teamId;
    elements.projectDescription.value = project.description || '';
    elements.projectStatus.value = project.status;
    
    elements.projectForm.dataset.projectId = projectId;
    
    openModal('projectModal');
};

window.deleteProject = async function(projectId) {
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can delete projects', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            await deleteData('projects', projectId);
            showMessage('Project deleted successfully', 'success');
            loadAppData();
        } catch (error) {
            showMessage('Failed to delete project', 'error');
        }
    }
};

window.editTask = function(taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Check permissions
    if (currentUser?.role !== 'client' && 
        (currentUser?.role !== 'member' || task.assigneeId !== currentUser.id)) {
        showMessage('You do not have permission to edit this task', 'error');
        return;
    }
    
    elements.taskTitle.value = task.title;
    elements.taskProject.value = task.projectId;
    elements.taskAssignee.value = task.assigneeId || '';
    elements.taskPriority.value = task.priority;
    elements.taskStatus.value = task.status;
    elements.taskDescription.value = task.description || '';
    
    elements.taskForm.dataset.taskId = taskId;
    
    openModal('taskModal');
};

window.deleteTask = async function(taskId) {
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can delete tasks', 'error');
        return;
    }
    
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await deleteData('tasks', taskId);
            showMessage('Task deleted successfully', 'success');
            loadAppData();
        } catch (error) {
            showMessage('Failed to delete task', 'error');
        }
    }
};

// Update UI based on role
function updateUIForRole() {
    const isClient = currentUser?.role === 'client';
    const isMember = currentUser?.role === 'member';
    const isGuest = currentUser?.role === 'guest';
    
    // Update user info
    elements.userInfo.textContent = `Welcome, ${currentUser?.name}`;
    elements.roleBadge.textContent = currentUser?.role.charAt(0).toUpperCase() + 
                                    currentUser?.role.slice(1);
    
    // Show/hide buttons based on role
    const createButtons = [
        elements.createTeamBtn,
        elements.createProjectBtn,
        elements.createTaskBtn,
        elements.addTeamBtn,
        elements.addProjectBtn,
        elements.addTaskBtn
    ];
    
    createButtons.forEach(btn => {
        if (btn) {
            btn.disabled = isGuest;
            btn.style.opacity = isGuest ? '0.5' : '1';
            btn.style.cursor = isGuest ? 'not-allowed' : 'pointer';
        }
    });
    
    // Update profile form
    elements.profileName.value = currentUser?.name || '';
    elements.profileRole.value = currentUser?.role || 'guest';
}

// Event Handlers
async function handleLogin() {
    const name = elements.userName.value.trim();
    const role = elements.userRole.value;
    
    if (!name) {
        showMessage('Please enter your name', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const user = await apiRequest('/api/login', {
            method: 'POST',
            body: JSON.stringify({ name, role })
        });
        
        currentUser = user;
        
        // Switch to app screen
        elements.loginScreen.classList.add('hidden');
        elements.appScreen.classList.remove('hidden');
        
        // Load app data
        await loadAppData();
        updateUIForRole();
        showView('dashboard');
        
        showMessage(`Welcome, ${user.name}!`, 'success');
        
    } catch (error) {
        showMessage('Login failed', 'error');
    } finally {
        showLoading(false);
    }
}

function handleLogout() {
    currentUser = null;
    elements.appScreen.classList.add('hidden');
    elements.loginScreen.classList.remove('hidden');
    elements.userName.value = '';
    showMessage('Logged out successfully', 'info');
}

async function handleCreateTeam(e) {
    e.preventDefault();
    
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can create teams', 'error');
        return;
    }
    
    const name = elements.teamName.value.trim();
    if (!name) {
        showMessage('Please enter team name', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // Process members
        const membersText = elements.teamMembers.value.trim();
        const memberNames = membersText ? 
            membersText.split(',').map(m => m.trim()).filter(m => m) : [];
        
        const memberIds = [];
        for (const memberName of memberNames) {
            // Check if user exists
            let user = appData.users.find(u => 
                u.name.toLowerCase() === memberName.toLowerCase()
            );
            
            if (!user) {
                // Create new user
                const newUser = await apiRequest('/api/login', {
                    method: 'POST',
                    body: JSON.stringify({ 
                        name: memberName, 
                        role: 'member' 
                    })
                });
                user = newUser;
            }
            
            memberIds.push(user.id);
        }
        
        const teamId = elements.teamForm.dataset.teamId;
        const teamData = {
            id: teamId || undefined, // Let backend generate if new
            name: name,
            members: memberIds
        };
        
        await saveData('teams', teamData);
        
        closeModal('teamModal');
        delete elements.teamForm.dataset.teamId;
        await loadAppData();
        showMessage(teamId ? 'Team updated!' : 'Team created!', 'success');
        
    } catch (error) {
        showMessage('Failed to save team', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleCreateProject(e) {
    e.preventDefault();
    
    if (currentUser?.role !== 'client') {
        showMessage('Only clients can create projects', 'error');
        return;
    }
    
    const name = elements.projectName.value.trim();
    const teamId = elements.projectTeam.value;
    
    if (!name) {
        showMessage('Please enter project name', 'error');
        return;
    }
    
    if (!teamId) {
        showMessage('Please select a team', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const projectId = elements.projectForm.dataset.projectId;
        const projectData = {
            id: projectId || undefined,
            name: name,
            teamId: teamId,
            description: elements.projectDescription.value.trim(),
            status: elements.projectStatus.value
        };
        
        await saveData('projects', projectData);
        
        closeModal('projectModal');
        delete elements.projectForm.dataset.projectId;
        await loadAppData();
        showMessage(projectId ? 'Project updated!' : 'Project created!', 'success');
        
    } catch (error) {
        showMessage('Failed to save project', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleCreateTask(e) {
    e.preventDefault();
    
    if (currentUser?.role !== 'client' && currentUser?.role !== 'member') {
        showMessage('You do not have permission to create tasks', 'error');
        return;
    }
    
    const title = elements.taskTitle.value.trim();
    const projectId = elements.taskProject.value;
    
    if (!title) {
        showMessage('Please enter task title', 'error');
        return;
    }
    
    if (!projectId) {
        showMessage('Please select a project', 'error');
        return;
    }
    
    // Check if member can access this project
    if (currentUser?.role === 'member') {
        const project = appData.projects.find(p => p.id === projectId);
        const userTeams = appData.teams.filter(team => 
            team.members?.includes(currentUser.id)
        ).map(t => t.id);
        
        if (!project || !userTeams.includes(project.teamId)) {
            showMessage('You do not have access to this project', 'error');
            return;
        }
    }
    
    try {
        showLoading(true);
        
        const taskId = elements.taskForm.dataset.taskId;
        const taskData = {
            id: taskId || undefined,
            title: title,
            projectId: projectId,
            assigneeId: elements.taskAssignee.value || null,
            priority: elements.taskPriority.value,
            status: elements.taskStatus.value,
            description: elements.taskDescription.value.trim()
        };
        
        await saveData('tasks', taskData);
        
        closeModal('taskModal');
        delete elements.taskForm.dataset.taskId;
        await loadAppData();
        showMessage(taskId ? 'Task updated!' : 'Task created!', 'success');
        
    } catch (error) {
        showMessage('Failed to save task', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleSaveProfile() {
    const name = elements.profileName.value.trim();
    const role = elements.profileRole.value;
    
    if (!name) {
        showMessage('Please enter your name', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // Update user data
        const userData = {
            id: currentUser.id,
            name: name,
            role: role
        };
        
        await saveData('users', userData);
        currentUser = userData;
        updateUIForRole();
        
        showMessage('Profile updated successfully!', 'success');
        
    } catch (error) {
        showMessage('Failed to update profile', 'error');
    } finally {
        showLoading(false);
    }
}

// Initialize Event Listeners
function initEventListeners() {
    // Login
    elements.loginBtn.addEventListener('click', handleLogin);
    elements.userName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Logout
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // Menu toggle
    elements.menuToggle.addEventListener('click', () => {
        elements.sidebar.classList.toggle('open');
    });
    
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            showView(viewName);
        });
    });
    
    // Create buttons
    elements.createTeamBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client') {
            delete elements.teamForm.dataset.teamId;
            openModal('teamModal');
        }
    });
    
    elements.createProjectBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client') {
            delete elements.projectForm.dataset.projectId;
            openModal('projectModal');
        }
    });
    
    elements.createTaskBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client' || currentUser?.role === 'member') {
            delete elements.taskForm.dataset.taskId;
            openModal('taskModal');
        }
    });
    
    elements.addTeamBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client') {
            delete elements.teamForm.dataset.teamId;
            openModal('teamModal');
        }
    });
    
    elements.addProjectBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client') {
            delete elements.projectForm.dataset.projectId;
            openModal('projectModal');
        }
    });
    
    elements.addTaskBtn?.addEventListener('click', () => {
        if (currentUser?.role === 'client' || currentUser?.role === 'member') {
            delete elements.taskForm.dataset.taskId;
            openModal('taskModal');
        }
    });
    
    // Forms
    elements.teamForm?.addEventListener('submit', handleCreateTeam);
    elements.projectForm?.addEventListener('submit', handleCreateProject);
    elements.taskForm?.addEventListener('submit', handleCreateTask);
    elements.saveProfileBtn?.addEventListener('click', handleSaveProfile);
    
    // Modal cancel buttons
    elements.cancelTeamBtn?.addEventListener('click', () => {
        closeModal('teamModal');
        delete elements.teamForm.dataset.teamId;
    });
    
    elements.cancelProjectBtn?.addEventListener('click', () => {
        closeModal('projectModal');
        delete elements.projectForm.dataset.projectId;
    });
    
    elements.cancelTaskBtn?.addEventListener('click', () => {
        closeModal('taskModal');
        delete elements.taskForm.dataset.taskId;
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
                // Clear stored IDs
                if (modal.id === 'teamModal') delete elements.teamForm.dataset.teamId;
                if (modal.id === 'projectModal') delete elements.projectForm.dataset.projectId;
                if (modal.id === 'taskModal') delete elements.taskForm.dataset.taskId;
            }
        });
    });
}

// Initialize App
function initApp() {
    initEventListeners();
    
    // Check if user is already logged in (from localStorage for demo)
    const savedUser = localStorage.getItem('teamtrack_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            elements.loginScreen.classList.add('hidden');
            elements.appScreen.classList.remove('hidden');
            elements.userName.value = currentUser.name;
            elements.userRole.value = currentUser.role;
            updateUIForRole();
            loadAppData();
        } catch (error) {
            localStorage.removeItem('teamtrack_user');
        }
    }
    
    // Save user to localStorage on login (for demo persistence)
    const originalHandleLogin = handleLogin;
    window.handleLogin = async function() {
        await originalHandleLogin();
        if (currentUser) {
            localStorage.setItem('teamtrack_user', JSON.stringify(currentUser));
        }
    };
    
    // Clear localStorage on logout
    const originalHandleLogout = handleLogout;
    window.handleLogout = function() {
        originalHandleLogout();
        localStorage.removeItem('teamtrack_user');
    };
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);
