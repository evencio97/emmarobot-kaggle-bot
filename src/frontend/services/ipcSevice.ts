import { ipcRenderer } from 'electron';
import { IPCChannels } from '../../common/models/ipc';
import { IIPCClient } from '../models/ipcClient';


const client: IIPCClient = {
    loginToKaggle: (data) => ipcRenderer.invoke(IPCChannels.LOGIN_TO_KAGGLE, data),
    syncKaggleCSV: (data) => ipcRenderer.invoke(IPCChannels.SYNC_KAGGLE_CSV, data),
    syncDataToWebForm: (url) => ipcRenderer.invoke(IPCChannels.SYNC_DATA_TO_WEB_FORM, url),
    listenKaggleSync: (listener) => ipcRenderer.on(IPCChannels.SYNC_KAGGLE_UPDATES, listener),
    unlistenKaggleSync: () => ipcRenderer.removeAllListeners(IPCChannels.SYNC_KAGGLE_UPDATES),
    listenWebFormSync: (listener) => ipcRenderer.on(IPCChannels.SYNC_WEB_FORM_UPDATES, listener),
    unlistenWebFormSync: () => ipcRenderer.removeAllListeners(IPCChannels.SYNC_WEB_FORM_UPDATES),
};

export default client;