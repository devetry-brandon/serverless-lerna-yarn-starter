import { injectable } from "tsyringe";
import { Template } from "../models/asu/template";
import { TemplatesRepo } from "../repos/templates.repo";

@injectable()
export class TemplatesService {
  constructor(private templatesRepo: TemplatesRepo) {}

  public async getTemplate(id: string): Promise<Template> {
    return await this.templatesRepo.getTemplateById(id);
  }

  public async putTemplate(template: Template): Promise<Template> {
    return await this.templatesRepo.put(template);
  }
}