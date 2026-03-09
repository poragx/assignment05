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
