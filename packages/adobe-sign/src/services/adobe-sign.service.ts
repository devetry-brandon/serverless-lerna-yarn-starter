import { injectable } from "tsyringe";
import { AdobeSignApi } from "../apis/adobe-sign-api";
import { Agreement } from "../models/agreement";
import { TemplatesRepo } from "../repos/templates.repo";

@injectable()
export class AdobeSignService {
    constructor(private adobeSignApi: AdobeSignApi, private templateRepo: TemplatesRepo) { }

    public async getAgreement(id: string): Promise<Agreement> {
        return await this.adobeSignApi.getAgreement(id);
    }
}