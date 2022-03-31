import { ObjectWithId } from "../repos/base.repo";
export class Template implements ObjectWithId {
  id: string;
  name: string;
  adobeSignId: string;

  constructor(data?: Partial<Template>) {
    this.id = data.id;
    this.name = data.name;
    this.adobeSignId = data.adobeSignId;
  }
}