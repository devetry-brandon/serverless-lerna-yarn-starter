import { Template } from "../models/template";
import { BaseRepo } from "./base.repo";
import { NotFoundError } from "asu-core";
import { injectable } from "tsyringe";
import { MysqlConnectionProvider } from "../providers/mysql-connection.provider";

@injectable()
export class TemplatesRepo extends BaseRepo {
  constructor(connectionProvider: MysqlConnectionProvider) {
    super(connectionProvider);
  }

  async getTemplateById(id: number): Promise<Template> {
    const sql = `
      SELECT *
      FROM templates
      WHERE id = ?;
    `;

    const templates = await this.query<Partial<Template>>(sql, [id]);

    if (templates.length === 0) {
      throw new NotFoundError(`No template found with id: ${id}`);
    }

    return new Template(templates[0]);
  }

  async getTemplateByExternalId(id: string): Promise<Template> {
    const sql = `
      SELECT *
      FROM template
      WHERE adobeSignId = ?;
    `;
    
    const templates = await this.query<Partial<Template>>(sql, [id]);

    if (templates.length === 0) {
      throw new NotFoundError(`No template found with adobeSignId: ${id}`);
    }

    return new Template(templates[0]);
  }

  async createTemplate(template: Template): Promise<Template> {
    const sql = `
      INSERT INTO templates (name, adobeSignId) 
      VALUES (?, ?)
    `;

    template.id = await this.insert(sql, [
      template.name,
      template.adobeSignId
    ]);
    
    return template;
  }
}