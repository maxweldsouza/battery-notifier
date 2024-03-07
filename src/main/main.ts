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
import {app, BrowserWindow, ipcMain, Menu, shell, Tray} from 'electron';
import {autoUpdater} from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import {resolveHtmlPath} from './util';
import {getAllDeviceInfo, showHighBatteryNotification, showLowBatteryNotification} from "./battery";
import Store from 'electron-store';

const store = new Store();

const MIN_IN_MILISECONDS = 60 * 1000
const BATTERY_CHECK_INTERVAL = 10 * MIN_IN_MILISECONDS

/* TODO

Exponential backoff
Warning preferences
UI

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

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('get-devices', async (event, arg) => {
  const devices = await getAllDeviceInfo()
  event.reply('receive-devices', devices);
});

ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = store.get(val);
});
ipcMain.on('electron-store-set', async (event, key, val) => {
  store.set(key, val);
});


const task = async function () {
  const devices = await getAllDeviceInfo()
  const preferences = store.get('battery')
  runBatteryNotification(devices, preferences)
}

task().then()
setInterval(task, BATTERY_CHECK_INTERVAL)

function runBatteryNotification (devices, preferences) {
  if (devices.length <= 0) return

  for (let device of devices) {
    if (device.percentage <= 20 && preferences[device['native-path']].low !== false) {
      showLowBatteryNotification(device.model, device.percentage)
    }
    if (device.percentage >= 80 && preferences[device['native-path']].high !== false) {
      showHighBatteryNotification(device.model, device.percentage)
    }
  }

  const minBattery = Math.min(devices.map(x => x.percentage))
  if (minBattery <= 20) {
    tray.setIcon(batteryLowIcon)
  } else if (minBattery <= 80) {
    tray.setIcon(batteryHalfIcon)
  } else if (minBattery <= 100) {
    tray.setIcon(batteryFullIcon)
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

export const showTrayIcon = () => {

  tray = new Tray(batteryFullIcon); // Path to your tray icon

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings', click: function () {
        mainWindow.show();
      }
    },
    {
      label: 'Quit', click: function () {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Your App Name');
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const batteryFullIcon = getAssetPath('battery-full.png')
const batteryHalfIcon = getAssetPath('battery-half.png')
const batteryLowIcon = getAssetPath('battery-low.png')


const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('battery.png'),
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

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide(); // Hide the window instead of closing it
      console.log('Hide ', );
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
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
