import "reflect-metadata";
import { AWSError, Request, SecretsManager, Service } from "aws-sdk";
import { SecretsManagerProvider } from "../../../src/aws/providers/secrets-manager.provider";
import { Mock } from '../../../src/testing/mock-provider';
import { AwsSecretKey, AwsSecretName, EnvironmentVariable, SecretsManagerService } from "../../../src/asu-core";
import { CacheService } from "../../../src/aws/services/cache.service";
import { valueNotCached, valueCached } from "../../../src/testing/mocked-cache-helper-functions";

describe('SecretsManagerService', () => {
    const expectedRegion = 'us-east-1';
    const expectedStage = 'dev';

    beforeEach(() => {
        process.env = {};
        process.env[EnvironmentVariable.Region] = expectedRegion;
        process.env[EnvironmentVariable.Stage] = expectedStage;
    });

    const secretsManagerReturns = (awsSecretsManager: jest.Mocked<SecretsManager>, secret?: string) => {
        const secretResponseObject = Mock(new Request<SecretsManager.Types.GetSecretValueResponse, AWSError>(Mock(new Service()), null));
        const secretBody = { $response: null };
        if (secret !== undefined) {
            secretBody['SecretString'] = secret
        }
        secretResponseObject.promise.mockResolvedValue(secretBody);
        awsSecretsManager.getSecretValue.mockReturnValue(secretResponseObject);
    };

    const setup = () => {
        const secretsManagerProvider = Mock(new SecretsManagerProvider());
        const awsSecretsManager = Mock(new SecretsManager());
        const cacheService = Mock(new CacheService(null));
        const service = new SecretsManagerService(secretsManagerProvider, cacheService);

        secretsManagerProvider.resolve.mockReturnValue(awsSecretsManager);

        return { service, awsSecretsManager, secretsManagerProvider, cacheService };
    }

    describe('getSecret', () => {
        it('should return simple secret from the correct region and secret name', async () => {
            // Arrange
            const { service, awsSecretsManager, secretsManagerProvider, cacheService } = setup();
            const expectedSecretString = '1234';
            const expectedSecretName = AwsSecretName.AdobeSign;
            const expectedFullSecretName = `${expectedStage}-${expectedSecretName}`;
            
            secretsManagerReturns(awsSecretsManager, expectedSecretString);
            valueNotCached(cacheService);

            // Act
            const result = await service.getSecret(expectedSecretName);

            // Assert
            expect(result).toBe(expectedSecretString);
            expect(secretsManagerProvider.resolve.mock.calls[0][0].region).toBe(expectedRegion);
            expect(awsSecretsManager.getSecretValue.mock.calls[0][0]['SecretId']).toBe(expectedFullSecretName);
        });

        it('should return secret sub key from json secret', async () => {
            // Arrange
            const { service, awsSecretsManager, cacheService } = setup();
            const expectedSecretString = '1234';
            const expectedSecretObject = {
                [AwsSecretKey.AdobeSignIntegrationKey]: expectedSecretString
            };
            
            secretsManagerReturns(awsSecretsManager, JSON.stringify(expectedSecretObject));
            valueNotCached(cacheService);

            // Act
            const result = await service.getSecret(AwsSecretName.AdobeSign, AwsSecretKey.AdobeSignIntegrationKey);

            // Assert
            expect(result).toBe(expectedSecretString);
        });

        it('should return null when SecretString is undefined', async () => {
            // Arrange
            const { service, awsSecretsManager, cacheService } = setup();
            
            secretsManagerReturns(awsSecretsManager);
            valueNotCached(cacheService);

            // Act
            const result = await service.getSecret(AwsSecretName.AdobeSign, AwsSecretKey.AdobeSignIntegrationKey);

            // Assert
            expect(result).toBeNull();
        });

        it('should return null when sub key does not exist in json secret', async () => {
            // Arrange
            const { service, awsSecretsManager, cacheService } = setup();
            const expectedSecretObject = {};
            
            secretsManagerReturns(awsSecretsManager, JSON.stringify(expectedSecretObject));
            valueNotCached(cacheService);

            // Act
            const result = await service.getSecret(AwsSecretName.AdobeSign, AwsSecretKey.AdobeSignIntegrationKey);

            // Assert
            expect(result).toBeNull();
        });

        it('should return null when json secret cannot be parsed', async () => {
            // Arrange
            const { service, awsSecretsManager, cacheService } = setup();
            
            secretsManagerReturns(awsSecretsManager, '{');
            valueNotCached(cacheService);

            // Act
            const result = await service.getSecret(AwsSecretName.AdobeSign, AwsSecretKey.AdobeSignIntegrationKey);

            // Assert
            expect(result).toBeNull();
        });

        it('should return cached secret', async () => {
            // Arrange
            const { service, awsSecretsManager, cacheService } = setup();
            const expectedSecretString = '1234';
            const expectedSecretName = AwsSecretName.AdobeSign;
            
            secretsManagerReturns(awsSecretsManager, expectedSecretString);
            valueCached(cacheService, expectedSecretString);

            // Act
            const result = await service.getSecret(expectedSecretName);

            // Assert
            expect(result).toBe(expectedSecretString);
        });
    });
});