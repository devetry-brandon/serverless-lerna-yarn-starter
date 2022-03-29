import { injectable } from "tsyringe";
import { Template } from "../models/template";
import { TemplatesRepo } from "../repos/templates.repo";

@injectable()
export class TemplatesService {
  constructor(private templatesRepo: TemplatesRepo) {}

  async getTemplate(id: number): Promise<Template> {
    return await this.templatesRepo.getTemplateById(id);
  }
}