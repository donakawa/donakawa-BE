import path from "path";
import { FileTypeEnum } from "../enum/file-type.enum";
import { FilesRepository } from "../repository/files.repository";
import { StoragePort } from "../storage/storage.port";
import { FileCommand } from "../command/file.command";
import { FilePayload } from "../payload/file.payload";
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly s3Client: StoragePort,
  ) {}
  async upload(
    file: Express.Multer.File,
    fileName: string,
    type: FileTypeEnum,
  ) {
    const fileType = type.toString();
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${fileName}${ext}`;
    await this.s3Client.uploadFile(file, name, fileType);
    let registeredResult;
    try {
      const command = new FileCommand(type, name);
      registeredResult = await this.filesRepository.saveFile(command);
    } catch (e) {
      await this.s3Client.deleteFile(`${fileType}/${name}`);
      throw e;
    }
    return new FilePayload({
      id: registeredResult.id.toString(),
      name: registeredResult.name,
      createdAt: registeredResult.createdAt,
    });
  }
  async delete(fileName: string, type: FileTypeEnum) {
    const fileType = type.toString();
    const filePath = `${fileType}/${fileName}`;
    await this.s3Client.deleteFile(filePath);
    const command = new FileCommand(type, fileName);
    const deletedResult = await this.filesRepository.deleteFile(command);
    return new FilePayload({
      id: deletedResult.id.toString(),
      name: deletedResult.name,
      deletedAt: new Date(),
    });
  }
}
