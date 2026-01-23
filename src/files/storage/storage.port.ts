export interface StoragePort {
  uploadFile(
    file: Express.Multer.File,
    fileName: string,
    filePath: string,
  ): Promise<void>;
  deleteFile(path: string): Promise<void>;
  getPresignedUrl(path: string, expiry: number): Promise<string>;
}
