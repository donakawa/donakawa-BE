import { StoragePort } from "./storage.port";
import { S3 } from "aws-sdk";
import path from "node:path";
export class S3StorageAdapter implements StoragePort {
  private readonly s3: S3;
  private readonly BUCKET_NAME: string;
  constructor(param: { config: S3.ClientConfiguration; bucketName: string }) {
    this.s3 = new S3(param.config);
    this.BUCKET_NAME = param.bucketName;
  }
  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
    filePath: string,
  ): Promise<void> {
    const params = {
      Bucket: this.BUCKET_NAME,
      Key: `${filePath}/${fileName}`,
      Body: file.buffer,
    };
    this.s3.putObject(params, (err: Error) => {
      if (err) throw err;
    });
  }
  async deleteFile(path: string): Promise<void> {
    const params = {
      Bucket: this.BUCKET_NAME,
      Key: path,
    };
    this.s3.deleteObject(params, (err: Error) => {
      if (err) throw err;
    });
  }
  async getPresignedUrl(path: string, expiry: number): Promise<string> {
    const params = {
      Bucket: this.BUCKET_NAME,
      Key: path,
      Expires: expiry,
    };
    return this.s3.getSignedUrlPromise("getObject", params);
  }
}
