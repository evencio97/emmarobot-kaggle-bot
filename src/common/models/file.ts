export interface IFileWithData {
  url: string, mime: string, size: string, modifiedAt: Date, data?: ArrayBuffer
}

export interface IFileInfo {
  url: string, mime: string, size: string,
  modifiedAt: Date, processedAt: Date,
  recordsCount: number
  syncRecordsCount: number
}