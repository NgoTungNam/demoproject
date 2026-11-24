const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');

console.log('🧹 Dọn cổng 8080...');
try {
  execSync('node scripts/clean_ports.js', { cwd: ROOT, stdio: 'inherit' });
} catch (_) {}

console.log('🚀 Đang bật Backend MySQL (cổng 8080)...');
const serverProc = spawn('node', ['server/index.js'], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
});

serverProc.stdout.on('data', (d) => process.stdout.write(`[SERVER] ${d}`));
serverProc.stderr.on('data', (d) => process.stderr.write(`[SERVER] ${d}`));

console.log('🌐 Đang mở Cloudflare Tunnel...');
const tunnelCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const tunnelProc = spawn(tunnelCmd, ['--no-install', 'cloudflared', 'tunnel', '--url', 'http://localhost:8080'], {
  cwd: ROOT,
  shell: process.platform === 'win32',
  stdio: ['ignore', 'pipe', 'pipe'],
});

let deployed = false;

function handleTunnelOutput(chunk) {
  const text = chunk.toString();
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
  if (match && !deployed) {
    deployed = true;
    const tunnelUrl = match[0];
    console.log(`\n✅ Đã có link Tunnel: ${tunnelUrl}`);

    // Cập nhật VITE_API_URL trong .env
    let envContent = fs.readFileSync(ENV_PATH, 'utf8');
    if (/^VITE_API_URL=.*/m.test(envContent)) {
      envContent = envContent.replace(/^VITE_API_URL=.*/m, `VITE_API_URL=${tunnelUrl}`);
    } else {
      envContent = `VITE_API_URL=${tunnelUrl}\n` + envContent;
    }
    fs.writeFileSync(ENV_PATH, envContent, 'utf8');
    console.log('📝 Đã tự động cập nhật .env!');

    console.log('☁️  Đang build và đẩy lên Cloudflare Workers (npm run deploy)...');
    const deployProc = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'deploy'], {
      cwd: ROOT,
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });

    deployProc.on('close', (code) => {
      if (code === 0) {
        console.log('\n========================================================');
        console.log('🎉 HOÀN TẤT! WEB ONLINE ĐÃ NỐI THẲNG MYSQL!');
        console.log('👉 Mở web: https://euroasia-kitchen-frontend.namngoa4k16.workers.dev');
        console.log('⚠️  Giữ cửa sổ này mở khi dùng web. Nhấn Ctrl+C để tắt.');
        console.log('========================================================\n');
      } else {
        console.error(`❌ Deploy thất bại với mã lỗi ${code}`);
      }
    });
  }
}

tunnelProc.stdout.on('data', handleTunnelOutput);
tunnelProc.stderr.on('data', handleTunnelOutput);

function cleanup() {
  console.log('\n🛑 Đang tắt Server và Tunnel...');
  try { serverProc.kill(); } catch (_) {}
  try { tunnelProc.kill(); } catch (_) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
