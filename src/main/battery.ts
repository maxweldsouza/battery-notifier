import {Notification} from "electron";
import {exec as execCallback} from 'child_process'
import dbus from 'dbus-next'

const { promisify } = require('util');

const exec = promisify(execCallback)

async function dbusTest () {
  console.log('dbusTest ', );
 const bus = dbus.systemBus();
 console.log('bus: ', bus);
  const upower = await bus.getProxyObject('org.freedesktop.UPower', '/org/freedesktop/UPower');
  console.log('upower: ', upower);
  const upowerIface = upower.getInterface('org.freedesktop.UPower');
  console.log('upowerIface: ', upowerIface);

  upowerIface.on('DeviceAdded', (path) => {
    console.log(`Device added: ${path}`);
  });

  upowerIface.on('DeviceRemoved', (path) => {
    console.log(`Device removed: ${path}`);
  });
}

async function getDevices() {
  try {
    let {stdout} = await exec("upower -e");

    const result = stdout.split('\n').filter(x => x.trim())
    return result
    // Parse the output for the battery percentage
  } catch (error) {
    console.error(`Error getting battery info: ${error}`);
    // throw error;  // Rethrow the error if you want the caller to handle it
    let out;
    out = await exec('echo $PATH')
    console.log('out.stdout: ', out.stdout);
    out = await exec('which upower')
    console.log('out.stdout: ', out.stdout);
  }
}

async function getDeviceInfo(devicePath) {
  try {
    const {stdout} = await exec(`upower -i ${devicePath}`);
    const infoLines = stdout.toString().split('\n').filter(line => line.trim() !== '');
    const deviceInfo = {};

    infoLines.forEach((line) => {
      const [key, ...value] = line.split(':');
      if (key && value.length > 0) {
        deviceInfo[key.trim()] = value.join('').trim();
      }
    });

    return deviceInfo;
  } catch (error) {
    console.error(`Error getting device info: ${error}`);
    throw error;  // Rethrow the error if you want the caller to handle it
  }
}

function extractNumberFromString(str) {
  const match = str.match(/\d+/); // This regex matches one or more digits
  if (match) {
    return parseInt(match[0], 10); // Convert the matched string to an integer
  } else {
    return null; // Return null if no number is found
  }
}

function transformDeviceInfo(deviceInfo) {
  if (deviceInfo.percentage) {
    deviceInfo.percentage = extractNumberFromString(deviceInfo.percentage)
  }
  return deviceInfo
}

export async function getAllDeviceInfo() {
  const devices = await getDevices();
  const result = []
  for (let device of devices) {
    const obj = await getDeviceInfo(device)
    result.push(obj)
  }
  return result.filter(x => x.model).map(transformDeviceInfo)
}

export function showLowBatteryNotification(device, percent) {

  console.log('Low battery ', );
  showNotification({
    title: `Low battery`,
    body: `${device} battery is at ${percent}%`
  })
}

export function showHighBatteryNotification(device, percent) {
  showNotification({
    title: `Stop charging`,
    body: `${device} battery is at ${percent}%`
  })
}

function showNotification(options) {
  const notification = new Notification({
    sound: '../../assets/message.mp3',
    ...options,
  });
  notification.show();
}
