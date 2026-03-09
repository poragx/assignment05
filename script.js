let allIssues = [];
let currentFilter = 'all';

// Login Functionality
function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        fetchIssues();
    } else {
        alert('Invalid credentials! Please use Username: admin and Password: admin123');
    }
}

// Fetch All Issues
async function fetchIssues() {
    showLoader(true);
    try {
        const res = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const result = await res.json();
        allIssues = result.data;
        displayIssues(allIssues);
    } catch (error) {
        console.error("Error fetching issues:", error);
        alert("Failed to load issues. Please check your internet connection.");
    } finally {
        showLoader(false);
    }
}

// Display Cards
function displayIssues(issues) {
    const grid = document.getElementById('issues-grid');
    const countEl = document.getElementById('issue-count');
    grid.innerHTML = '';
    countEl.innerText = issues.length;

    issues.forEach(issue => {
        // Condition for Top Border Color based on category (Challenge Part)
        const borderTopColor = issue.status === 'open' ? 'border-green-500' : 'border-purple-500';
        
        // Priority color mapping
        let priorityColor = 'bg-gray-100 text-gray-700';
        if (issue.priority === 'high') priorityColor = 'bg-red-50 text-red-500';
        if (issue.priority === 'medium') priorityColor = 'bg-yellow-50 text-yellow-600';
        if (issue.priority === 'low') priorityColor = 'bg-blue-50 text-blue-500';

        const card = document.createElement('div');
        card.className = `bg-white p-5 rounded-lg shadow-sm border border-gray-100 border-t-4 ${borderTopColor} hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full`;
        card.onclick = () => openModal(issue.id);

        // Labels mapping
        const labelsHTML = issue.labels.map(label => {
            let labelStyle = 'bg-orange-50 text-orange-600 border border-orange-200';
            if(label.toLowerCase() === 'enhancement') labelStyle = 'bg-green-50 text-green-600 border border-green-200';
            if(label.toLowerCase() === 'documentation') labelStyle = 'bg-yellow-50 text-yellow-600 border border-yellow-200';
            return `<span class="text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide ${labelStyle}">${label}</span>`;
        }).join('');

        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <span class="text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${priorityColor}">${issue.priority}</span>
                <span class="text-xs text-gray-400 font-medium">#${issue.id}</span>
            </div>
            <h4 class="font-bold text-gray-800 mb-2 leading-tight flex-grow">${issue.title}</h4>
            <p class="text-xs text-gray-500 mb-4 line-clamp-2">${issue.description}</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${labelsHTML}
            </div>
            <div class="text-[11px] text-gray-500 border-t pt-3 mt-auto">
                <p>By <span class="font-semibold text-gray-700">${issue.author}</span></p>
                <p class="mt-1">Updated: ${new Date(issue.updatedAt).toLocaleDateString()}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Tab Filtering
function filterIssues(status) {
    currentFilter = status;
    
    // UI Update for Active Tab (Challenge Part)
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        btn.classList.remove('active-tab');
        btn.classList.add('text-gray-600');
    });
    
    const activeTab = document.getElementById(`tab-${status}`);
    activeTab.classList.add('active-tab');
    activeTab.classList.remove('text-gray-600');

    // Filter Logic
    if (status === 'all') {
        displayIssues(allIssues);
    } else {
        const filtered = allIssues.filter(item => item.status === status);
        displayIssues(filtered);
    }
}

// Search Functionality (Challenge Part)
async function handleSearch() {
    const text = document.getElementById('search-input').value;
    if (!text) {
        return filterIssues(currentFilter); // If search is empty, go back to current tab
    }

    showLoader(true);
    try {
        const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${text}`);
        const result = await res.json();
        
        // Ensure UI stays on "All" tab when searching to avoid confusion
        document.querySelectorAll('[id^="tab-"]').forEach(btn => btn.classList.remove('active-tab', 'text-gray-600'));
        document.getElementById(`tab-all`).classList.add('active-tab');

        displayIssues(result.data);
    } catch (error) {
        alert("Search failed! Please try again.");
    } finally {
        showLoader(false);
    }
}

// Modal Logic
async function openModal(id) {
    const modal = document.getElementById('issue-modal');
    const content = document.getElementById('modal-content');
    
    // Fixed: Properly showing modal without breaking layout
    modal.classList.remove('hidden');
    modal.classList.add('flex'); 
    content.innerHTML = '<div class="text-center py-10"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div><p class="font-bold text-gray-600">Loading details...</p></div>';

    try {
        const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
        const result = await res.json();
        const data = result.data;

        // Modal Header Badge Color
        const statusColor = data.status === 'open' ? 'bg-green-500' : 'bg-purple-500';
        
        // Priority Badge Color for Modal
        let priorityBadge = 'bg-gray-100 text-gray-800';
        if (data.priority === 'high') priorityBadge = 'bg-red-500 text-white';
        if (data.priority === 'medium') priorityBadge = 'bg-yellow-500 text-white';
        if (data.priority === 'low') priorityBadge = 'bg-blue-500 text-white';

        content.innerHTML = `
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-3 pr-8">${data.title}</h2>
                <div class="flex items-center gap-3 text-sm text-gray-500 border-b pb-4">
                    <span class="px-3 py-1 rounded-full text-white font-semibold text-xs capitalize ${statusColor}">
                        ${data.status}
                    </span>
                    <span>Opened by <strong class="text-gray-700">${data.author}</strong></span>
                    <span>•</span>
                    <span>${new Date(data.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div class="mb-6">
                 <div class="flex flex-wrap gap-2 mb-4">
                    ${data.labels.map(label => `<span class="text-xs bg-gray-100 border text-gray-600 px-2 py-1 rounded font-semibold uppercase">${label}</span>`).join('')}
                </div>
                <p class="text-gray-600 text-base leading-relaxed bg-gray-50 p-4 rounded-lg">${data.description}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                <div>
                    <p class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Assignee</p>
                    <p class="font-bold text-gray-800 text-lg">${data.assignee || 'Unassigned'}</p>
                </div>
                <div>
                    <p class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Priority</p>
                    <span class="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${priorityBadge}">${data.priority}</span>
                </div>
            </div>

            <div class="mt-6 flex justify-end">
                <button onclick="closeModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">Close</button>
            </div>
        `;
    } catch (error) {
        content.innerHTML = '<p class="text-red-500 text-center font-bold py-10">Failed to load issue details.</p>';
    }
}

function closeModal() {
    const modal = document.getElementById('issue-modal');
    // Fixed: Hide modal properly
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function showLoader(status) {
    const loader = document.getElementById('loader');
    const grid = document.getElementById('issues-grid');
    if (status) {
        loader.classList.remove('hidden');
        grid.classList.add('hidden');
    } else {
        loader.classList.add('hidden');
        grid.classList.remove('hidden');
    }
}