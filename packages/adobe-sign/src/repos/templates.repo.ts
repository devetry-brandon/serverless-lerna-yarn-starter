import { Template } from "../models/asu/template";
import { DynamoProvider } from "asu-core";
import { injectable } from "tsyringe";
import { BaseRepo } from "./base.repo";

@injectable()
export class TemplatesRepo extends BaseRepo<Template> {
  constructor(connectionProvider: DynamoProvider) {
    super(connectionProvider, 'templates', 'adobeSignId');
  }

  async getTemplateById(id: string): Promise<Template> {
    const item = await this.getById(id);
    return new Template(item);
  }
}