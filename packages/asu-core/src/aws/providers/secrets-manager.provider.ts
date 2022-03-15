import { SecretsManager } from 'aws-sdk';
import { ClientConfiguration } from 'aws-sdk/clients/secretsmanager';

export class SecretsManagerProvider {
    public resolve(config: ClientConfiguration): SecretsManager {
        return new SecretsManager(config);
    }
}