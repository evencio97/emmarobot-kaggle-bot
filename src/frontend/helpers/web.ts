import { IIPCClient } from "../models/ipcClient";

export const getFormHTMLData = (elements: EventTarget) => {
  const data:{[k:string]: any} = {};
  for (const e of elements as any) {
    if (!e.name) continue;
    data[e.name] = e.value;
  }
  return data;
}

export const getIPCClient = () => <IIPCClient>(<any>window).ipcClient;

export const mapDateToString = (date: Date) => `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;