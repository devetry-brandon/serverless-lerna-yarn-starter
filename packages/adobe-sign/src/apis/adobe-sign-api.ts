import { Agreement } from "../models/agreement";

export class AdobeSignApi {
    public getAgreement(id: string): Promise<Agreement> {
        return new Promise((resolve, reject) => {
            let agreement = new Agreement();
            agreement.id = id;
            resolve(agreement);
        });
    }
}