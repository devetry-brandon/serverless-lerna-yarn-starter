import { Agreement } from "../models/agreement";

export class AdobeSignService {
    public getAgreement(): Agreement {
        return new Agreement();
    }
}