import { Notification } from 'electron';
import { exec as execCallback } from 'child_process';
import { parseBlock } from './upower';

const { promisify } = require('util');

const exec = promisify(execCallback);

async function getDevices() {
  const { stdout } = await exec('upower -e');
  return stdout.split('\n').filter((x) => x.trim());
}

async function getDeviceInfo(devicePath) {
  const { stdout } = await exec(`upower -i ${devicePath}`);
  return parseBlock(stdout.toString());
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

export async function getAllDeviceInfo() {
  const devices = await getDevices();
  const result = {};
  for (const device of devices) {
    const deviceInfo = await getDeviceInfo(device);
    console.log('deviceInfo: ', deviceInfo);
    if (deviceInfo['native-path']) {
      result[deviceInfo['native-path']] = deviceInfo;
    }
  }
  return result;
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
