import { Notification } from 'electron';
import { exec as execCallback } from 'child_process';

const { promisify } = require('util');

const exec = promisify(execCallback);

export function parseHeaderLine(line) {
  const parts = line
    .split(/\s+/)
    .filter((x) => x)
    .map((x) => x.trim());
  return {
    fullPath: parts[3],
    type: parts[2].replace(':', ''),
  };
}

export function parseBodyLine(line) {
  const [key, ...value] = line.split(':');
  if (!key || value.length === 0) {
    return { key: '', value: '' };
  }
  return {
    key: key.trim(),
    value: value.join(':').trim(),
  };
}

export function splitLines(block) {
  return block
    .split('\n')
    .map((x) => x.trim())
    .filter((x) => x);
}

function extractNumberFromString(str) {
  const match = str.match(/\d+/); // This regex matches one or more digits
  if (match) {
    return parseInt(match[0], 10); // Convert the matched string to an integer
  }
  return null; // Return null if no number is found
}

export function transformDeviceInfo(deviceInfo) {
  if (deviceInfo.percentage) {
    deviceInfo.percentage = extractNumberFromString(deviceInfo.percentage);
  }
  return deviceInfo;
}

export function parseBlock(lines, path) {
  const deviceInfo = { path };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const { key, value } = parseBodyLine(line);
    if (key && value) {
      deviceInfo[key] = value;
    }
  }
  return transformDeviceInfo(deviceInfo);
}

export async function getDevices() {
  const { stdout } = await exec('upower -e');
  return stdout.split('\n').filter((x) => x.trim());
}

export async function getDeviceInfo(devicePath) {
  const { stdout } = await exec(`upower -i ${devicePath}`);
  return parseBlock(splitLines(stdout.toString()), devicePath);
}

export function showNotification(options) {
  const notification = new Notification({
    sound: '../../assets/message.mp3',
    ...options,
  });
  notification.show();
}

export function showLowBatteryNotification(device, percent) {
  showNotification({
    title: `Low battery`,
    body: `${device} battery is at ${percent}%`,
  });
}

export function showHighBatteryNotification(device, percent) {
  showNotification({
    title: `Stop charging`,
    body: `${device} battery is at ${percent}%`,
  });
}
