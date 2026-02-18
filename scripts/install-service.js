#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir, platform } from 'os';
import { join } from 'path';

const platformName = platform();

console.log('🔧 Installing SecureVault as a system service...\n');

if (platformName === 'linux') {
  installLinuxService();
} else if (platformName === 'darwin') {
  installMacOSService();
} else if (platformName === 'win32') {
  installWindowsService();
} else {
  console.error('❌ Unsupported platform:', platformName);
  console.log('Please manually configure SecureVault to start on boot.');
  process.exit(1);
}

function installLinuxService() {
  const serviceName = 'securevault';
  const serviceFile = `/etc/systemd/system/${serviceName}.service`;
  const user = process.env.USER || process.env.USERNAME || 'root';
  // Use process.execPath for portability, or 'which node' on Unix systems
  const nodePath = process.execPath || execSync('which node').toString().trim();
  const npmGlobalPath = execSync('npm root -g').toString().trim();
  const securevaultPath = join(npmGlobalPath, 'securevault');

  const serviceContent = `[Unit]
Description=SecureVault - Secure Secret Manager
After=network.target

[Service]
Type=simple
User=${user}
WorkingDirectory=${securevaultPath}
ExecStart=${nodePath} ${join(securevaultPath, 'bin', 'securevault.js')}
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
`;

  try {
    console.log('Creating systemd service file...');
    writeFileSync(serviceFile, serviceContent);
    
    console.log('Reloading systemd daemon...');
    execSync('systemctl daemon-reload');
    
    console.log('Enabling service to start on boot...');
    execSync(`systemctl enable ${serviceName}`);
    
    console.log('\n✅ Service installed successfully!');
    console.log('\nTo manage the service:');
    console.log(`  Start:   sudo systemctl start ${serviceName}`);
    console.log(`  Stop:    sudo systemctl stop ${serviceName}`);
    console.log(`  Status:  sudo systemctl status ${serviceName}`);
    console.log(`  Logs:    sudo journalctl -u ${serviceName} -f`);
  } catch (error) {
    console.error('\n❌ Failed to install service. You may need to run with sudo:');
    console.error('   sudo npm run install-service');
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

function installMacOSService() {
  const plistName = 'com.securevault.app';
  const plistPath = join(homedir(), 'Library', 'LaunchAgents', `${plistName}.plist`);
  // Use process.execPath for portability, or 'which node' on Unix systems
  const nodePath = process.execPath || execSync('which node').toString().trim();
  const npmGlobalPath = execSync('npm root -g').toString().trim();
  const securevaultPath = join(npmGlobalPath, 'securevault');

  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${plistName}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${nodePath}</string>
        <string>${join(securevaultPath, 'bin', 'securevault.js')}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${join(homedir(), 'Library', 'Logs', 'securevault.log')}</string>
    <key>StandardErrorPath</key>
    <string>${join(homedir(), 'Library', 'Logs', 'securevault.error.log')}</string>
    <key>WorkingDirectory</key>
    <string>${securevaultPath}</string>
</dict>
</plist>
`;

  try {
    const launchAgentsDir = join(homedir(), 'Library', 'LaunchAgents');
    if (!existsSync(launchAgentsDir)) {
      mkdirSync(launchAgentsDir, { recursive: true });
    }

    const logsDir = join(homedir(), 'Library', 'Logs');
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }

    console.log('Creating LaunchAgent plist file...');
    writeFileSync(plistPath, plistContent);

    console.log('Loading LaunchAgent...');
    execSync(`launchctl load ${plistPath}`);

    console.log('\n✅ Service installed successfully!');
    console.log('\nTo manage the service:');
    console.log(`  Start:   launchctl start ${plistName}`);
    console.log(`  Stop:    launchctl stop ${plistName}`);
    console.log(`  Unload:  launchctl unload ${plistPath}`);
    console.log(`  Logs:    tail -f ~/Library/Logs/securevault.log`);
  } catch (error) {
    console.error('\n❌ Failed to install service.');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function installWindowsService() {
  console.log('📝 Windows service installation:');
  console.log('\nTo run SecureVault on startup in Windows:');
  console.log('\n1. Press Win+R and type: shell:startup');
  console.log('2. Create a shortcut in the Startup folder with target:');
  console.log('   cmd.exe /c securevault');
  console.log('\nOr use Task Scheduler for more control:');
  console.log('1. Open Task Scheduler');
  console.log('2. Create Basic Task');
  console.log('3. Trigger: When I log on');
  console.log('4. Action: Start a program');
  console.log('5. Program: cmd.exe');
  console.log('6. Arguments: /c securevault');
  console.log('\n⚠️  Automatic installation for Windows is not supported yet.');
}

export {};
