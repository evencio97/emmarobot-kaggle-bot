import { IFileInfo } from "../../common/models/file";
import { IUser } from "../../common/models/user";


const getKey = (key: string) => {
    const data = localStorage.getItem(key);
    return data? JSON.parse(data):undefined;
}

const setKey = (key: string, data: any | undefined) => {
    return data? localStorage.setItem(key, JSON.stringify(data)):localStorage.removeItem(key);
}

export const getUser = (): IUser | undefined => getKey('user');

export const setUser = (data: IUser | undefined) => setKey('user', data);

export const getFileInfo = (): IFileInfo | undefined => {
    const data = getKey('fileInfo');
    if (data) {
        data.modifiedAt = new Date(data.modifiedAt);
        data.processedAt = new Date(data.processedAt);
    }
    return data;
}

export const setFileInfo = (data: IFileInfo | undefined) => setKey('fileInfo', data);

export default {
    getUser,
    setUser,
    getFileInfo,
    setFileInfo,
};