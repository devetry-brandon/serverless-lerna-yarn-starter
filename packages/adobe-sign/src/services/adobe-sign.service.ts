import { injectable } from "tsyringe";
import { AdobeSignApi } from "../apis/adobe-sign-api";
import { Agreement } from "../models/agreement";

@injectable()
export class AdobeSignService {
    constructor(private adobeSignApi: AdobeSignApi) { }

    public async getAgreement(id: string): Promise<Agreement> {
        return await this.adobeSignApi.getAgreement(id);
    }
}