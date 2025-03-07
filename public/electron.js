const electron = require('electron');
const path = require('path');
const url = require('url');

// [security] Used for inputs.js (dialog call) to succeed.
require('@electron/remote/main').initialize();

const {app} = electron;
const {BrowserWindow} = electron;
const {ipcMain} = require('electron');
const nativeImage = electron.nativeImage;

const service = process.env.DEV ?
  require('../public/service') :
  require(path.join(__dirname, '../build/service'));

// Launch python service.
const service = new Service();
if (!process.env.DEV) {
  service.startup().then((error) => {
    if (error) {
      console.info('[SERVICE] eeg2bids-service failed');
    } else {
      console.info('[SERVICE] eeg2bids-service success');
    }
  });
}

if (process.env.DEV) {
  const {
    default: installExtension,
    REDUX_DEVTOOLS,
    REACT_DEVELOPER_TOOLS,
  } = require('electron-devtools-installer');

  app.whenReady().then(() => {
    installExtension(REDUX_DEVTOOLS).then((name) =>
      console.info(`Added Extension:  ${name}`),
    );
    installExtension(REACT_DEVELOPER_TOOLS).then((name) =>
      console.info(`Added Extension:  ${name}`),
    );
  });
}

const icon = nativeImage.createFromPath(
    path.join(__dirname, 'app_icon.png')
);
let mainWindow;
/**
 * Create Main Window.
 */
const createMainWindow = () => {
  const startUrl = process.env.DEV ?
    'http://localhost:3000?app' :
    `${url.pathToFileURL(path.join(
        __dirname, '/../build/index.html')).href}?app`;
  mainWindow = new BrowserWindow({
    show: false,
    icon,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
      nativeWindowOpen: true,
    },
    width: 900,
    height: 880,
    minWidth: 900,
    minHeight: 880,
    backgroundColor: '#094580',
  });
  mainWindow.removeMenu(); // Hides menu on Linux & Windows
  // mainWindow.maximize();
  mainWindow.show();

  mainWindow.loadURL(startUrl).then(() => {
    // if (process.env.DEV) mainWindow.webContents.openDevTools();
  });

  mainWindow.on('closed', function() {
    service.shutdown();
    mainWindow = null;
  });
};
let settingsWindow;
/**
 * Create Settings Window.
 */
const createSettingsWindow = () => {
  const startUrl = process.env.DEV ?
    'http://localhost:3000?settings' :
    `${url.pathToFileURL(path.join(
        __dirname, '/../build/index.html')).href}?settings`;
  settingsWindow = new BrowserWindow({
    icon,
    show: true,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
      nativeWindowOpen: true,
    },
    width: 600,
    height: 500,
    minWidth: 600,
    minHeight: 500,
    backgroundColor: '#0A826E',
  });
  settingsWindow.removeMenu(); // Hides menu on Linux & Windows
  settingsWindow.show();

  settingsWindow.loadURL(startUrl).then(() => {
    process.env.DEV && settingsWindow.webContents.openDevTools();
  });

  settingsWindow.on('closed', function() {
    settingsWindow = null;
  });
};

app.on('ready', async () => {
  createMainWindow();
  ipcMain.on('openSettingsWindow', (event, arg) => {
    if (settingsWindow === undefined || settingsWindow === null) {
      createSettingsWindow();
    }
  });
});

app.on('window-all-closed', () => {
  service.shutdown();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined || mainWindow === null) {
    createMainWindow();
  }
});
