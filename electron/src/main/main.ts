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
import { app, BrowserWindow, ipcMain, Menu, shell, Tray } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { spawn } from 'child_process';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  getAllDeviceInfo,
  showHighBatteryNotification,
  showLowBatteryNotification,
  transformDeviceInfo,
} from './battery';
import initializeStore from '../shared/electron/store/electronStoreMain';
import debug from './debug';

debug();

const store = initializeStore();

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const batteryFullIcon = getAssetPath('battery-full.png');
const batteryHalfIcon = getAssetPath('battery-half.png');
const batteryLowIcon = getAssetPath('battery-low.png');

/* TODO

Exponential backoff
Warning preferences

 */

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let tray;

function setIcon(icon) {
  tray?.setImage(icon);
}

function getBatteryIcon(devices) {
  const minBattery = Math.min(
    ...Object.values(devices).map((x) => x.percentage)
  );
  if (minBattery <= 20) {
    return batteryLowIcon;
  }
  if (minBattery <= 80) {
    return batteryHalfIcon;
  }
  if (minBattery <= 100) {
    return batteryFullIcon;
  }
  return batteryFullIcon;
}

function runDeviceBatteryNotification(device, preferences) {
  if (
    device.percentage <= 20 &&
    preferences[device['native-path']]?.low !== false &&
    device.state === 'discharging'
  ) {
    showLowBatteryNotification(device.model, device.percentage);
  }
  if (
    device.percentage >= 80 &&
    preferences[device['native-path']]?.high !== false &&
    device.state === 'charging'
  ) {
    showHighBatteryNotification(device.model, device.percentage);
  }
}

function runBatteryNotification(devices, preferences) {
  if (devices.length <= 0) return;

  const keys = Object.keys(devices);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const device = devices[key];
    runDeviceBatteryNotification(device, preferences);
  }

  setIcon(getBatteryIcon(devices));
}

async function batteryTask(devices) {
  const preferences = store.get('battery');
  runBatteryNotification(devices, preferences);
}
const TASK_INTERVAL_MS = 10 * 60 * 1000;

setInterval(async () => {
  const devices = await getAllDeviceInfo();
  await batteryTask(devices);
}, TASK_INTERVAL_MS);

ipcMain.on('get-devices', async (event) => {
  const devices = await getAllDeviceInfo();
  await batteryTask(devices);
  event.reply('receive-devices', devices);
});

function parseDeviceInfo(deviceBlock) {
  const deviceInfo = {};
  const infoLines = deviceBlock
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('['));

  infoLines.forEach((line) => {
    const [key, ...value] = line.split(':');
    if (key && value.length > 0) {
      deviceInfo[key.trim()] = value.join(':').trim();
    }
  });

  if (deviceInfo['native-path']) {
    mainWindow?.webContents.send('device-update', {
      [deviceInfo['native-path']]: transformDeviceInfo(deviceInfo),
    });
  }
}

function watchUpower() {
  const upower = spawn('upower', ['--monitor-detail']);

  let deviceBlock = '';

  upower.stdout.on('data', (data) => {
    const output = data.toString();
    const lines = output.split('\n');

    lines.forEach((line) => {
      if (line.startsWith('[')) {
        if (deviceBlock) {
          parseDeviceInfo(deviceBlock); // Parse the accumulated device info
          deviceBlock = ''; // Reset for the next device block
        }
      }
      deviceBlock += `${line}\n`;
    });
  });

  upower.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  upower.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (deviceBlock) {
      // Parse any remaining device block
      parseDeviceInfo(deviceBlock);
    }
  });
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
      forceDownload
    )
    .catch(console.log);
};

async function showTrayIcon() {
  const devices = await getAllDeviceInfo();
  const icon = getBatteryIcon(devices);
  tray = new Tray(icon); // Path to your tray icon

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click() {
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click() {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  setIcon(batteryHalfIcon);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Battery Notifier');
}

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('battery-notifier.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  showTrayIcon();

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

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide(); // Hide the window instead of closing it
    }
    return false;
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
    watchUpower();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
