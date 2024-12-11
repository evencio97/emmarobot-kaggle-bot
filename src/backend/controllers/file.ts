import AdmZip from 'adm-zip';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';


const tempFolderPath = path.join(".", "assets");

export const unzip = async (data: ArrayBuffer) => {
    const zip = new AdmZip(Buffer.from(data));
    const zipExtractAll = promisify(zip.extractAllToAsync);
    await zipExtractAll(tempFolderPath, true, false);
    return path.join(tempFolderPath, zip.getEntries()[0].entryName);
}

export const removeFile = async (path: string) => {
    try {
        await promisify(fs.unlink)(path);
    } catch (error) {}
}