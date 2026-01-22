import path from "path";
import { FileTypeEnum } from "../enum/file-type.enum";
import { FilesRepository } from "../repository/files.repository";
import { StoragePort } from "../storage/storage.port";
import { SaveFileCommand } from "../command/save-file.command";
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
    const command = new SaveFileCommand(type, name);
    const registeredResult = await this.filesRepository.saveFile(command);
    return new FilePayload({
      id: registeredResult.id.toString(),
      name: registeredResult.name,
      createdAt: registeredResult.createdAt,
    });
  }
}
