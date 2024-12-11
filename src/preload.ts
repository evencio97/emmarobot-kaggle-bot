// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from "electron";
import ipcSevice from "./frontend/services/ipcSevice";


contextBridge.exposeInMainWorld('ipcClient', ipcSevice);

contextBridge.exposeInMainWorld('environment', {
  KAGGLE_USER: process.env.KAGGLE_USER || "",
  KAGGLE_PASS: process.env.KAGGLE_PASS || "",
  WEB_FORM_URL: process.env.WEB_FORM_URL || ""
});