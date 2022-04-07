import "reflect-metadata"
import { AwsSecretKey, AwsSecretName, DataValidationError, Mock, SecretsManagerService, SqsQueue, SqsService } from "asu-core";
import { Webhook } from "../../src/adobe-sign";
import { WebhookEvent } from "../../src/enums/webhook-event";
import { Agreement } from "../../src/models/adobe-sign/agreement";
import { WebhookService } from '../../src/services/webhook.service';

describe('WebhookService', () => {
  const setup = () => {
    const secretManagerService = Mock(new SecretsManagerService(null, null));
    const sqsService = Mock(new SqsService(null));
    const service = new WebhookService(secretManagerService, sqsService);

    return { service, secretManagerService, sqsService };
  };

  describe('validateClientId', () => {
    const storedClientId = "1234";

    it('should throw error if given client id does not match stored secret', async () => {
      // Arrange
      const { service, secretManagerService } = setup();

      secretManagerService.getSecret.mockResolvedValue(storedClientId);
      
      // Act / Assert
      await expect(service.validateClientId("4321")).rejects.toThrow(DataValidationError);
    });

    it('should call the secrets manager for the correct secret and not throw if given client id matches', async () => {
      // Arrange
      const { service, secretManagerService } = setup();

      secretManagerService.getSecret.mockResolvedValue(storedClientId);
      
      // Act 
      await service.validateClientId(storedClientId);

      // Assert
      expect(secretManagerService.getSecret).toBeCalledWith(AwsSecretName.AdobeSign, AwsSecretKey.AdobeSignClientId);
    });
  });

  describe('processWebhook', () => {
    it('should send webhook to the correct queue and group', async () => {
      // Arrange
      const { service, sqsService } = setup();
      const webhook = new Webhook({
        event: WebhookEvent.AgreementCreated,
        agreement: new Agreement({
          id: "9876"
        })
      });
      
      // Act 
      await service.processWebhook(webhook);

      // Assert
      expect(sqsService.sendMessage).toBeCalledWith(
        SqsQueue.AgreementWebhooks,
        JSON.stringify(webhook),
        webhook.agreement.id
      );
    });
  });
});