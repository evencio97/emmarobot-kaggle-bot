import AdmZip from 'adm-zip';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
// import readline from 'readline';
// import { IBabyNameData } from '../../common/models/babyName';


const tempFolderPath = path.join(".", "assets");

// const mapToObject = (line: string): IBabyNameData => {
//     // YearOfBirth, Name, Sex, Number
//     const data = line.split(/\s*,\s*/);

//     return {
//         year: data[0].trim(),
//         name: data[1].trim(),
//         sex: (data[2].trim() as any),
//         number: parseInt(data[3].trim())
//     }
// }

// const read = async (filePath: string) => {
//     // const textEncoder = new TextEncoder();
//     // Read file
//     const readStream = fs.createReadStream(filePath, {encoding: 'binary'});
//     const rl = readline.createInterface({
//         input: readStream,
//         crlfDelay: Infinity
//     });
//     const result: IBabyNameData[] = [];
//     let readedBytes: number = 0;
//     let isHeader = true;
//     // Read data
//     for await (const line of rl) {
//         try {
//             // readedBytes += textEncoder.encode('foo').length;
//             // readedBytes += Buffer.from(line).byteLength;
//             // Skip headline
//             if (isHeader) {
//                 // Skip also empty lines
//                 if (line.trim().length)
//                     isHeader = false;
//                 continue;
//             }
//             // Map data and Save
//             result.push(mapToObject(line));
//             // Break condition
//             if (result.length >= 500 )
//                 break;
//         } catch (error) {
//             continue;
//         }
//     }
//     rl.close();
//     readStream.close();
//     console.log(readedBytes);

//     return result;
// };

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