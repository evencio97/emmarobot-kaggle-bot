export enum IPCChannels {
  LOGIN_TO_KAGGLE = "kaggle:login",
  SYNC_KAGGLE_CSV = "kaggle:syncCSV",
  SYNC_KAGGLE_UPDATES = "kaggle:syncCSVUpdates",
  SYNC_DATA_TO_WEB_FORM = "webform:sync",
  SYNC_WEB_FORM_UPDATES = "webform:syncUpdates"
};

export type IIPCFnAuhtArgs = {email: string, password: string};