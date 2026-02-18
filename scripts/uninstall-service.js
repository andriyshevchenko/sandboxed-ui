#!/usr/bin/env node

import { execSync } from 'child_process';
import { unlinkSync, existsSync } from 'fs';
import { homedir, platform } from 'os';
import { join } from 'path';

const platformName = platform();

console.log('🔧 Uninstalling SecureVault system service...\n');

if (platformName === 'linux') {
  uninstallLinuxService();
} else if (platformName === 'darwin') {
  uninstallMacOSService();
} else if (platformName === 'win32') {
  uninstallWindowsService();
} else {
  console.error('❌ Unsupported platform:', platformName);
  process.exit(1);
}

function uninstallLinuxService() {
  const serviceName = 'securevault';
  const serviceFile = `/etc/systemd/system/${serviceName}.service`;

  try {
    console.log('Stopping service...');
    try {
      execSync(`systemctl stop ${serviceName}`);
    } catch (e) {
      // Service might not be running
    }

    console.log('Disabling service...');
    try {
      execSync(`systemctl disable ${serviceName}`);
    } catch (e) {
      // Service might not be enabled
    }

    console.log('Removing service file...');
    if (existsSync(serviceFile)) {
      unlinkSync(serviceFile);
    }

    console.log('Reloading systemd daemon...');
    execSync('systemctl daemon-reload');

    console.log('\n✅ Service uninstalled successfully!');
  } catch (error) {
    console.error('\n❌ Failed to uninstall service. You may need to run with sudo:');
    console.error('   sudo npm run uninstall-service');
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

function uninstallMacOSService() {
  const plistName = 'com.securevault.app';
  const plistPath = join(homedir(), 'Library', 'LaunchAgents', `${plistName}.plist`);

  try {
    console.log('Stopping service...');
    try {
      execSync(`launchctl stop ${plistName}`);
    } catch (e) {
      // Service might not be running
    }

    console.log('Unloading LaunchAgent...');
    if (existsSync(plistPath)) {
      execSync(`launchctl unload ${plistPath}`);
      
      console.log('Removing plist file...');
      unlinkSync(plistPath);
    }

    console.log('\n✅ Service uninstalled successfully!');
  } catch (error) {
    console.error('\n❌ Failed to uninstall service.');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function uninstallWindowsService() {
  console.log('📝 Windows service uninstallation:');
  console.log('\nTo stop SecureVault from running on startup:');
  console.log('\n1. Press Win+R and type: shell:startup');
  console.log('2. Delete the SecureVault shortcut');
  console.log('\nOr if using Task Scheduler:');
  console.log('1. Open Task Scheduler');
  console.log('2. Find and delete the SecureVault task');
}

export {};
