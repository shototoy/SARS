import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIp = getLocalIp();
const envContent = `VITE_API_BASE=http://${localIp}:5001\n`;

fs.writeFileSync(path.resolve(__dirname, '.env.production'), envContent);
console.log(`[PREBUILD] Configured VITE_API_BASE dynamically to http://${localIp}:5001`);
