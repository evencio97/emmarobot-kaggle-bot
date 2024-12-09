import { IFileInfo } from "../../common/models/file";
import { IIPCFnAuhtArgs } from "../../common/models/ipc";


type IIPCClientFn<Args, T> = (args: Args) => Promise<T>;

type ipcClientListener = (event: Electron.IpcRendererEvent, args: any) => void;

type IIPCClientListenerFn = (args: ipcClientListener) => any 

export interface IIPCClient {
  loginToKaggle: IIPCClientFn<IIPCFnAuhtArgs, string>
  syncKaggleCSV: IIPCClientFn<IIPCFnAuhtArgs, IFileInfo>
  syncDataToWebForm: () => Promise<void>,
  listenKaggleSync: IIPCClientListenerFn,
  unlistenKaggleSync: () => void,
  listenWebFormSync: IIPCClientListenerFn
  unlistenWebFormSync: () => void,
}