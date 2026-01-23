export class FilePayload {
  id!: string;
  name!: string;
  createdAt?: Date;
  deletedAt?: Date;
  constructor(param: {
    id: string;
    name: string;
    createdAt?: Date;
    deletedAt?: Date;
  }) {
    this.id = param.id;
    this.name = param.name;
    if (param.createdAt) this.createdAt = param.createdAt;
    if (param.deletedAt) this.deletedAt = param.deletedAt;
  }
}
