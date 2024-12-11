import { BrowserWindow } from 'electron';


let mainWindow: Readonly<BrowserWindow>;

export const createMainWindow = (preload_entry: string, main_entry: string): void => {
  if (mainWindow) return;
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1080,
    webPreferences: {
      preload: preload_entry,
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    },
  });
  mainWindow.removeMenu();
  // mainWindow.maximize();
  // and load the index.html of the app.
  mainWindow.loadURL(main_entry);
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

export const getMainWindow = () => mainWindow;

export const sendMainWindowEvent = (channel: string, ...args: any[]) => mainWindow.webContents.send(channel, ...args);