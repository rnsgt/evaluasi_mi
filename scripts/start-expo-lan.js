const os = require('os');
const { spawn } = require('child_process');
const net = require('net');

function pickLanIp() {
  const nets = os.networkInterfaces();
  const preferredNames = ['wi-fi', 'wifi', 'wlan'];

  const candidates = [];

  for (const [name, entries] of Object.entries(nets)) {
    for (const entry of entries || []) {
      if (!entry || entry.internal || entry.family !== 'IPv4') {
        continue;
      }
      candidates.push({ name: name.toLowerCase(), address: entry.address });
    }
  }

  if (!candidates.length) {
    return null;
  }

  const preferred = candidates.find((c) => preferredNames.some((p) => c.name.includes(p)));
  return (preferred || candidates[0]).address;
}

const lanIp = pickLanIp();
if (!lanIp) {
  console.error('Tidak menemukan IPv4 LAN aktif. Pastikan Wi-Fi/LAN terhubung.');
  process.exit(1);
}

process.env.REACT_NATIVE_PACKAGER_HOSTNAME = lanIp;
process.env.EXPO_PUBLIC_API_BASE_URL = `http://${lanIp}:3002/api`;

const preferredPort = process.env.EXPO_PORT || '';

function isPortFree(portNumber) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(portNumber, '0.0.0.0');
  });
}

function getRandomFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '0.0.0.0', () => {
      const addr = server.address();
      const freePort = String(addr.port);
      server.close(() => resolve(freePort));
    });
    server.on('error', reject);
  });
}

async function main() {
  let freePort;
  if (preferredPort) {
    freePort = (await isPortFree(Number(preferredPort))) ? preferredPort : await getRandomFreePort();
  } else {
    freePort = await getRandomFreePort();
  }

  console.log(`Expo LAN IP     : ${lanIp}`);
  console.log(`API Base URL    : ${process.env.EXPO_PUBLIC_API_BASE_URL}`);
  console.log(`Metro Port      : ${freePort}`);

  const isWin = process.platform === 'win32';
  const command = isWin ? 'cmd.exe' : 'npx';
  const args = isWin
    ? ['/c', `npx expo start --clear --lan --port ${freePort}`]
    : ['expo', 'start', '--clear', '--lan', '--port', freePort];

  const child = spawn(command, args, {
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main();
