import { AwsSecretKey, AwsSecretName, SecretsManagerService } from "asu-core";
import { injectable } from "tsyringe";
import { Agreement } from "../models/agreement";

@injectable()
export class AdobeSignApi {
    constructor(private secretsManagerService: SecretsManagerService) {}

    public async getAgreement(id: string): Promise<Agreement> {
        const integrationKey = await this.secretsManagerService.getSecret(
            AwsSecretName.AdobeSign,
            AwsSecretKey.AdobeSignIntegrationKey
        );
        const agreement = new Agreement();
        agreement.id = id;

        return agreement;
    }
}