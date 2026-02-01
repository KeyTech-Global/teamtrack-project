// Mock Backend for GitHub Pages Deployment
// This file simulates a backend using localStorage

console.log('Mock Backend Loaded - For GitHub Pages Deployment');

// Mock API Response Function
window.mockApi = {
    // Store data in localStorage
    storage: {
        users: JSON.parse(localStorage.getItem('teamtrack_users')) || [],
        teams: JSON.parse(localStorage.getItem('teamtrack_teams')) || [],
        projects: JSON.parse(localStorage.getItem('teamtrack_projects')) || [],
        tasks: JSON.parse(localStorage.getItem('teamtrack_tasks')) || []
    },

    // Save data to localStorage
    saveToStorage() {
        localStorage.setItem('teamtrack_users', JSON.stringify(this.storage.users));
        localStorage.setItem('teamtrack_teams', JSON.stringify(this.storage.teams));
        localStorage.setItem('teamtrack_projects', JSON.stringify(this.storage.projects));
        localStorage.setItem('teamtrack_tasks', JSON.stringify(this.storage.tasks));
    },

    // Mock API request function
    async request(endpoint, options = {}) {
        console.log('Mock API Call:', endpoint);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Handle different endpoints
        if (endpoint === '/api/data') {
            return {
                users: this.storage.users,
                teams: this.storage.teams,
                projects: this.storage.projects,
                tasks: this.storage.tasks
            };
        }

        if (endpoint === '/api/login') {
            const { name, role } = JSON.parse(options.body);
            
            // Check if user exists
            let user = this.storage.users.find(u => u.name.toLowerCase() === name.toLowerCase());
            
            if (!user) {
                // Create new user
                user = {
                    id: 'user_' + Date.now(),
                    name: name,
                    role: role,
                    createdAt: new Date().toISOString()
                };
                this.storage.users.push(user);
                this.saveToStorage();
            } else if (user.role !== role) {
                // Update role
                user.role = role;
                this.saveToStorage();
            }
            
            return user;
        }

        if (endpoint === '/api/teams' && options.method === 'POST') {
            const teamData = JSON.parse(options.body);
            
            if (!teamData.id) {
                teamData.id = 'team_' + Date.now();
                teamData.createdAt = new Date().toISOString();
            }
            
            teamData.updatedAt = new Date().toISOString();
            
            // Remove old if exists
            this.storage.teams = this.storage.teams.filter(t => t.id !== teamData.id);
            this.storage.teams.push(teamData);
            this.saveToStorage();
            
            return teamData;
        }

        if (endpoint === '/api/projects' && options.method === 'POST') {
            const projectData = JSON.parse(options.body);
            
            if (!projectData.id) {
                projectData.id = 'project_' + Date.now();
                projectData.createdAt = new Date().toISOString();
            }
            
            projectData.updatedAt = new Date().toISOString();
            
            this.storage.projects = this.storage.projects.filter(p => p.id !== projectData.id);
            this.storage.projects.push(projectData);
            this.saveToStorage();
            
            return projectData;
        }

        if (endpoint === '/api/tasks' && options.method === 'POST') {
            const taskData = JSON.parse(options.body);
            
            if (!taskData.id) {
                taskData.id = 'task_' + Date.now();
                taskData.createdAt = new Date().toISOString();
            }
            
            taskData.updatedAt = new Date().toISOString();
            
            this.storage.tasks = this.storage.tasks.filter(t => t.id !== taskData.id);
            this.storage.tasks.push(taskData);
            this.saveToStorage();
            
            return taskData;
        }

        if (endpoint === '/api/users' && options.method === 'POST') {
            const userData = JSON.parse(options.body);
            
            this.storage.users = this.storage.users.filter(u => u.id !== userData.id);
            this.storage.users.push(userData);
            this.saveToStorage();
            
            return userData;
        }

        if (endpoint.startsWith('/api/delete/')) {
            const parts = endpoint.split('/');
            const type = parts[parts.length - 2];
            const id = parts[parts.length - 1];
            
            if (type === 'teams') {
                this.storage.teams = this.storage.teams.filter(t => t.id !== id);
            } else if (type === 'projects') {
                this.storage.projects = this.storage.projects.filter(p => p.id !== id);
            } else if (type === 'tasks') {
                this.storage.tasks = this.storage.tasks.filter(t => t.id !== id);
            }
            
            this.saveToStorage();
            return { success: true };
        }

        if (endpoint === '/api/save') {
            const data = JSON.parse(options.body);
            this.storage.users = data.users || [];
            this.storage.teams = data.teams || [];
            this.storage.projects = data.projects || [];
            this.storage.tasks = data.tasks || [];
            
            this.saveToStorage();
            return { success: true };
        }

        return { error: 'Endpoint not implemented' };
    }
};

// Load sample data on first visit
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('teamtrack_initialized')) {
        const sampleData = {
            users: [
                { id: 'user_1', name: 'Alex Johnson', role: 'client', createdAt: '2024-01-15T10:00:00.000Z' },
                { id: 'user_2', name: 'Sarah Miller', role: 'member', createdAt: '2024-01-15T10:00:00.000Z' },
                { id: 'user_3', name: 'Mike Chen', role: 'member', createdAt: '2024-01-15T10:00:00.000Z' }
            ],
            teams: [
                { 
                    id: 'team_1', 
                    name: 'Development Team', 
                    members: ['user_2', 'user_3'],
                    createdAt: '2024-01-15T10:00:00.000Z'
                }
            ],
            projects: [
                {
                    id: 'project_1',
                    name: 'Website Redesign',
                    teamId: 'team_1',
                    description: 'Redesign company website with modern UI',
                    status: 'In Progress',
                    deadline: '2024-03-15',
                    createdAt: '2024-01-20T09:00:00.000Z'
                }
            ],
            tasks: [
                {
                    id: 'task_1',
                    title: 'Design Homepage',
                    projectId: 'project_1',
                    assigneeId: 'user_2',
                    priority: 'High',
                    status: 'In Progress',
                    dueDate: '2024-02-15',
                    description: 'Create wireframes for homepage',
                    createdAt: '2024-01-21T11:00:00.000Z'
                },
                {
                    id: 'task_2',
                    title: 'Setup Database',
                    projectId: 'project_1',
                    assigneeId: 'user_3',
                    priority: 'Medium',
                    status: 'Open',
                    dueDate: '2024-02-20',
                    description: 'Create database schema',
                    createdAt: '2024-01-22T15:30:00.000Z'
                }
            ]
        };
        
        localStorage.setItem('teamtrack_users', JSON.stringify(sampleData.users));
        localStorage.setItem('teamtrack_teams', JSON.stringify(sampleData.teams));
        localStorage.setItem('teamtrack_projects', JSON.stringify(sampleData.projects));
        localStorage.setItem('teamtrack_tasks', JSON.stringify(sampleData.tasks));
        localStorage.setItem('teamtrack_initialized', 'true');
        
        console.log('Sample data loaded for first-time users');
    }
});
