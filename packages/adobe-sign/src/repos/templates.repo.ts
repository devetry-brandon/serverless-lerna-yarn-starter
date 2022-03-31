import { Template } from "../models/template";
import { DynamoProvider } from "asu-core";
import { injectable } from "tsyringe";
import { BaseRepo } from "./base.repo";

@injectable()
export class TemplatesRepo extends BaseRepo<Template> {
  constructor(connectionProvider: DynamoProvider) {
    super(connectionProvider, 'templates');
  }

  async getTemplateById(id: string): Promise<Template> {
    const item = await this.getById<Template>(id);
    return new Template(item);
  }
}