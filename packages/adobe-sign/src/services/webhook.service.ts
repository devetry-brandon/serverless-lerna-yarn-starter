import { AwsSecretKey, AwsSecretName, DataValidationError, SecretsManagerService, SqsQueues, SqsService } from "asu-core";
import { injectable } from "tsyringe";
import { Webhook } from "../adobe-sign";

@injectable()
export class WebhookService {
  constructor(private secretManager: SecretsManagerService, private sqsService: SqsService) {}

  async validateClientId(clientId: string): Promise<void> {
    const storedClientId = await this.secretManager.getSecret(AwsSecretName.AdobeSign, AwsSecretKey.AdobeSignClientId);

    if (clientId !== storedClientId) {
      throw new DataValidationError(`WebhookService.validateClientId: Given client id, ${clientId}, does not match the client id on record.`);
    }
  }

  async processWebhook(webhook: Webhook): Promise<void> {
    await this.sqsService.queueMessage(
      SqsQueues.AgreementWebhooks,
      JSON.stringify(webhook),
      webhook.agreement.id
    );
  }
}