import { SaveFileCommand } from "../command/save-file.command";
import { FileType, Prisma, PrismaClient } from "@prisma/client";

export class FilesRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async saveFile(command: SaveFileCommand, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    return await db.files.create({
      data: {
        type: command.type.toString() as FileType,
        name: command.name,
      },
    });
  }
}
