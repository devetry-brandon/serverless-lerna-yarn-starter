import { injectable } from "tsyringe";
import { Template } from "../models/asu/template";
import { TemplatesRepo } from "../repos/templates.repo";

@injectable()
export class TemplatesService {
  constructor(private templatesRepo: TemplatesRepo) {}

  async getTemplate(id: string): Promise<Template> {
    return await this.templatesRepo.getTemplateById(id);
  }

  async createTemplate(template: Template): Promise<Template> {
    return await this.templatesRepo.put(template);
  }
}