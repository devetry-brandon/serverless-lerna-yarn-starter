import { Template } from "../models/template";
import { DynamoProvider, EnvironmentVariable, NotFoundError } from "asu-core";
import { injectable } from "tsyringe";
import { BaseRepo } from "./base.repo";

@injectable()
export class TemplatesRepo extends BaseRepo {
  constructor(connectionProvider: DynamoProvider) {
    super(connectionProvider, 'templates');
  }

  async getTemplateById(id: number): Promise<Template> {
    return new Template();
  }

  async getTemplateByExternalId(id: string): Promise<Template> {
    return new Template();
  }
}