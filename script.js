const WORKER_URL = 'https://phishlab-api.your-worker.workers.dev';

document.getElementById('generateForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const username = document.getElementById('username').value;
    const platform = document.getElementById('platform').value;
    
    // Generate unique link ID
    const linkId = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/p/${linkId}?platform=${platform}`;
    
    // Save to Cloudflare Worker
    const response = await fetch(WORKER_URL + '/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId, studentId, username, platform })
    });
    
    if (response.ok) {
        document.getElementById('result').style.display = 'block';
        document.getElementById('phishLink').href = link;
        document.getElementById('phishLink').textContent = link;
    }
});

async function viewData() {
    const response = await fetch(WORKER_URL + '/data');
    const data = await response.json();
    document.getElementById('dataDisplay').textContent = JSON.stringify(data, null, 2);
}