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

