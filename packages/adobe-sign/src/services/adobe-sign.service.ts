import { Agreement } from "../models/agreement";

export class AdobeSignService {
    public getAgreement(id: string): Agreement {
        let agreement = new Agreement();

        agreement.id = id;
        
        return agreement;
    }
}