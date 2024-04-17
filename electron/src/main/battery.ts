import { Notification } from 'electron';
import { exec as execCallback } from 'child_process';

const { promisify } = require('util');

const exec = promisify(execCallback);

async function getDevices() {
  try {
    const { stdout } = await exec('upower -e');

    const result = stdout.split('\n').filter((x) => x.trim());
    return result;
    // Parse the output for the battery percentage
  } catch (error) {
    console.error(`Error getting battery info: ${error}`);
    throw error; // Rethrow the error if you want the caller to handle it
  }
}

function parseOutput(output) {
  const deviceInfo = {};
  output
    .split('\n')
    .filter((line) => line.trim() !== '')
    .forEach((line) => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        deviceInfo[key.trim()] = valueParts.join(':').trim();
      }
    });
  return deviceInfo;
}

async function getDeviceInfo(devicePath) {
  try {
    const { stdout } = await exec(`upower -i ${devicePath}`);
    return parseOutput(stdout.toString());
  } catch (error) {
    console.error(`Error getting device info: ${error}`);
    throw error;
  }
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
    const obj = await getDeviceInfo(device);
    if (obj['native-path']) {
      result[obj['native-path']] = transformDeviceInfo(obj);
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
