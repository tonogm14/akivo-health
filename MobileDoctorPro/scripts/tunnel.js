#!/usr/bin/env node
// Start ngrok v3, wait for tunnel URL, then launch Expo with the public hostname.
// Usage: npm run tunnel
// Prereq: ngrok config add-authtoken <YOUR_TOKEN>  (one-time, free at ngrok.com)

const { spawn } = require('child_process');
const http = require('http');

function getTunnelUrl() {
  return new Promise((resolve, reject) => {
    let tries = 0;
    (function poll() {
      http.get('http://localhost:4040/api/tunnels', res => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => {
          try {
            const tunnel = JSON.parse(data).tunnels.find(t => t.proto === 'https');
            if (tunnel) return resolve(tunnel.public_url);
          } catch {}
          if (++tries < 24) setTimeout(poll, 500);
          else reject(new Error('No HTTPS tunnel found after 12 s'));
        });
      }).on('error', () => {
        if (++tries < 24) setTimeout(poll, 500);
        else reject(new Error('ngrok local API not responding after 12 s'));
      });
    })();
  });
}

(async () => {
  const ngrok = spawn('ngrok', ['http', '8081'], { stdio: 'ignore' });

  ngrok.on('error', err => {
    console.error('ngrok not found:', err.message);
    process.exit(1);
  });

  console.log('\n  Waiting for ngrok v3 tunnel...\n');

  let tunnelUrl;
  try {
    tunnelUrl = await getTunnelUrl();
  } catch (err) {
    ngrok.kill();
    console.error('\n  Error:', err.message);
    console.error('  Run once: ngrok config add-authtoken <TOKEN>');
    console.error('  Get a free token at: https://dashboard.ngrok.com/get-started/your-authtoken\n');
    process.exit(1);
  }

  const hostname = new URL(tunnelUrl).hostname;
  console.log(`  Tunnel ready: ${tunnelUrl}\n`);

  const expo = spawn('npx', ['expo', 'start'], {
    stdio: 'inherit',
    env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: hostname },
  });

  expo.on('exit', code => {
    ngrok.kill();
    process.exit(code ?? 0);
  });

  process.on('SIGINT', () => {
    expo.kill('SIGINT');
    ngrok.kill();
  });
})();
