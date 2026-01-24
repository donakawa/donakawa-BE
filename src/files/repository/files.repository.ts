import { FileCommand } from "../command/file.command";
import { FileType, Prisma, PrismaClient } from "@prisma/client";

export class FilesRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async saveFile(command: FileCommand, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    return await db.files.create({
      data: {
        type: command.type.toString() as FileType,
        name: command.name,
      },
    });
  }
  async deleteFile(command: FileCommand, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    return await db.files.delete({
      where: {
        type: command.type.toString() as FileType,
        name: command.name,
      },
    });
  }
  async findFileById(id: string, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    return await db.files.findUnique({ where: { id: BigInt(id) } });
  }
}
