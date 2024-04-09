/*

Reads battery info from the linux kernel power supply files
https://www.kernel.org/doc/Documentation/ABI/testing/sysfs-class-power

 */

import { extractNumberFromString } from './battery';

const fs = require('fs');
const fsPromise = require('fs/promises');
const path = require('path');

const directoryPath = '/sys/class/power_supply';

const keys = ['capacity', 'manufacturer', 'serial_number', 'type',
  'model_name', 'status',
  'online', 'scope', 'present',
];

// TODO filter type: battery

function transformDeviceInfo (deviceInfo) {
  if (deviceInfo.capacity) {
    deviceInfo.capacity = extractNumberFromString(deviceInfo.capacity)
  }
  return deviceInfo
}

export async function observe() {
  const devices = fs.readdirSync(directoryPath);
  let results = await Promise.all(devices.map(readDevice));
  results = results.map(transformDeviceInfo)
  console.log('results: ', results);
  return results
}

async function readProp(dirPath, file) {
  const filePath = path.join(dirPath, file);
  try {
    const value = await fsPromise.readFile(filePath);
    const strValue = value.toString().trim();
    return strValue;
  } catch (e) {
    // console.log('e: ', e, filePath);
    return '';
  }
}

async function readDevice(device) {
  const dirPath = path.join(directoryPath, device);
  const values = await Promise.all(keys.map(file => readProp(dirPath, file)));


  const result = {};

  for (let i = 0; i < keys.length; i++) {
    result[keys[i]] = values[i];
  }
  result['native-path'] = device
  return result;
}
