/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, Tray, Menu, shell, ipcMain, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { exec as execCallback } from 'child_process'
const { promisify } = require('util');

const exec = promisify(execCallback)

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('get-devices', async (event, arg) => {
  const devices = await getAllDeviceInfo()

  runBatteryNotification(devices)

  console.log('devices: ', devices);
  event.reply('receive-devices', devices);
});

function runBatteryNotification (devices) {
  for (let device of devices) {
    if (device.percentage < 20) {
      showLowBatteryNotification(device.model, device.percentage)
    }
    if (device.percentage > 80) {
      showHighBatteryNotification(device.model, device.percentage)
    }
  }
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const showTrayIcon = () => {
  let tray = new Tray(path.join(__dirname, '../../assets/icon.png')); // Path to your tray icon

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: function() {
        mainWindow.show();
      }
    },
    { label: 'Options', submenu: [
        { label: 'Option 1', click: function() {
            console.log('Option 1 clicked');
          }
        },
        { label: 'Option 2', click: function() {
            console.log('Option 2 clicked');
          }
        }
      ]
    },
    { label: 'Quit', click: function() {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Your App Name');
}

async function getDevices() {
  try {
    const { stdout } = await exec("upower -e");

    const result = stdout.split('\n').filter(x => x.trim())
    return result
    // Parse the output for the battery percentage
  } catch (error) {
    console.error(`Error getting battery info: ${error}`);
    throw error;  // Rethrow the error if you want the caller to handle it
  }
}

async function getDeviceInfo(devicePath) {
  try {
    const { stdout } = await exec(`upower -i ${devicePath}`);
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

function transformDeviceInfo (deviceInfo) {
  if (deviceInfo.percentage) {
    deviceInfo.percentage = extractNumberFromString(deviceInfo.percentage)
  }
  return deviceInfo
}

async function getAllDeviceInfo () {
  const devices = await getDevices();
  const result = []
  for (let device of devices) {
    const obj = await getDeviceInfo(device)
    result.push(obj)
  }
  return result.filter(x => x.model).map(transformDeviceInfo)
}

function showLowBatteryNotification(device, percent) {
  showNotification({
    title: `Low battery`,
    body: `${device} battery is at ${percent}%`
  })
}

function showHighBatteryNotification(device, percent) {
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

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  showTrayIcon()

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
