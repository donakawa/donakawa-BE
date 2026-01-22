import { FileTypeEnum } from "../enum/file-type.enum";

export class SaveFileCommand {
  type!: FileTypeEnum;
  name!: string;
  constructor(type: FileTypeEnum, name: string) {
    this.type = type;
    this.name = name;
  }
}
