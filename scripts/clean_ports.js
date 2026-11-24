const { execSync } = require('child_process');

function killPort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
      const lines = output.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        // Định dạng TCP 0.0.0.0:8080 ... LISTENING PID
        if (parts.length >= 5 && parts[1].endsWith(`:${port}`)) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== String(process.pid)) {
            pids.add(pid);
          }
        }
      });

      pids.forEach(pid => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`🧹 Đã giải phóng cổng ${port} (đã tắt tiến trình PID: ${pid})`);
        } catch (_) {}
      });
    } else {
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore' });
    }
  } catch (_) {
    // Không có tiến trình nào chiếm cổng, bỏ qua
  }
}

console.log('🔍 Kiểm tra và dọn dẹp các cổng mạng 8080 & 3000...');
killPort(8080);
killPort(3000);
console.log('✨ Các cổng đã sẵn sàng!\n');
