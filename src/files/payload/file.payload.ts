export class FilePayload {
  id!: string;
  name!: string;
  createdAt!: Date;
  constructor(param: { id: string; name: string; createdAt: Date }) {
    this.id = param.id;
    this.name = param.name;
    this.createdAt = param.createdAt;
  }
}
