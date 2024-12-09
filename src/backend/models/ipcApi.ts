import { IpcMainInvokeEvent } from "electron";
import { IIPCFnAuhtArgs } from '../../common/models/ipc';
import { IFileInfo } from "../../common/models/file";


type IIPCApiFn<Args, T> = (event: IpcMainInvokeEvent, args: Args) => Promise<T>;

export type ILoginToKaggleFn = IIPCApiFn<IIPCFnAuhtArgs, string>

export type ISyncKaggleCSVFn = IIPCApiFn<IIPCFnAuhtArgs, IFileInfo>

export type ISyncDataToWebFormFn = (event: IpcMainInvokeEvent) => Promise<void>

export interface IIPCApi {
  loginToKaggle: ILoginToKaggleFn
  syncKaggleCSV: ISyncKaggleCSVFn
  syncDataToWebForm: ISyncDataToWebFormFn,
}