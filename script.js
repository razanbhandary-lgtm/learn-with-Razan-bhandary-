const API_URL = 'https://phishlab-api.your-worker.workers.dev';

document.getElementById('generateForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const username = document.getElementById('username').value;
    const platform = document.getElementById('platform').value;
    
    // Generate unique link ID
    const linkId = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/p/${linkId}?platform=${platform}`;
    
    // Save to localStorage (for demo)
    let data = JSON.parse(localStorage.getItem('phishData') || '{}');
    data[linkId] = {
        studentId,
        username,
        platform,
        created: new Date().toISOString(),
        clicks: [],
        credentials: []
    };
    localStorage.setItem('phishData', JSON.stringify(data));
    
    // Show result
    document.getElementById('result').style.display = 'block';
    document.getElementById('phishLink').href = link;
    document.getElementById('phishLink').textContent = link;
});

function viewData() {
    const data = JSON.parse(localStorage.getItem('phishData') || '{}');
    const display = document.getElementById('dataDisplay');
    display.textContent = JSON.stringify(data, null, 2);
}