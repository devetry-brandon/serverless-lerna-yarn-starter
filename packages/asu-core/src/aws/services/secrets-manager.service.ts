import { AwsSecretKey } from "../enums/aws-secret-key";
import { AwsSecretName } from "../enums/aws-secret-name";
import { EnvironmentVariable } from "../../enums/environment-variable";
import { injectable } from "tsyringe";
import { SecretsManagerProvider } from "../providers/secrets-manager.provider";
import { CacheService } from "./cache.service";

@injectable()
export class SecretsManagerService {
    constructor(private secretsManagerProvider: SecretsManagerProvider, private cacheService: CacheService) {}

    public async getSecret(secretName: AwsSecretName, secretKey?: AwsSecretKey): Promise<string> {
        const cacheKey = `AWSSecret-${secretName}${secretKey !== undefined ? `-${secretKey}` : ''}`;

        return this.cacheService.getValue(cacheKey, async (): Promise<string> => {
            const config = {
                region: process.env[EnvironmentVariable.Region]
            }
            const secretsManager = this.secretsManagerProvider.resolve(config);
            const fullSecretName = `${process.env[EnvironmentVariable.Stage]}-${secretName}`;

            console.log(`SecretsManagerService.getSecret: Retrieving secret ${fullSecretName}, from given params: ${secretName}:${secretKey || 'N/A'}`);

            const secretValue = await secretsManager.getSecretValue({ SecretId: fullSecretName }).promise();

            if (secretValue.SecretString == undefined) {
                return null;
            }
            
            if (secretKey == undefined) {
                return secretValue.SecretString;
            }

            try {
                const secretObject = JSON.parse(secretValue.SecretString);
                if (secretKey in secretObject) {
                    return secretObject[secretKey];
                }
            }
            catch(error) {
                console.log(`SecretsManagerService.getSecret: secretKey provided but failed to parse json. ${error}`);
            }
            
            return null;
        });
    }
}