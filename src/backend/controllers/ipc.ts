import { ipcMain } from 'electron';
import { IIPCApi } from '../models/ipcApi';
import kaggleSevice from './kaggle';
import { IPCChannels } from '../../common/models/ipc';


const api: IIPCApi = {
    loginToKaggle: kaggleSevice.login,
    syncKaggleCSV: kaggleSevice.syncCSV,
    syncDataToWebForm: kaggleSevice.syncDataToWebForm,
};

export default {
    init: () =>  {
        // Load events handlers
        ipcMain.handle(IPCChannels.LOGIN_TO_KAGGLE, api.loginToKaggle);
        ipcMain.handle(IPCChannels.SYNC_KAGGLE_CSV, api.syncKaggleCSV);
        ipcMain.handle(IPCChannels.SYNC_DATA_TO_WEB_FORM, api.syncDataToWebForm);
    }
}