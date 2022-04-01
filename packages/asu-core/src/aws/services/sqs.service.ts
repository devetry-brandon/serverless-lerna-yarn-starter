import { injectable } from "tsyringe";
import { EnvironmentVariable } from "../../asu-core";
import { SqsProvider } from "../providers/sqs.provider";

export const SqsQueues = {
  AgreementWebhooks: process.env[EnvironmentVariable.AgreementWebhookQueueUrl]
};

@injectable()
export class SqsService {
  constructor(private sqsProvider: SqsProvider) {}

  async queueMessage(url: string, body: string, groupId: string): Promise<void> {
    const sqs = this.sqsProvider.resolve();
    try {
      await sqs.sendMessage({
        QueueUrl: url,
        MessageGroupId: groupId,
        MessageBody: body
      }).promise();
    }
    catch(error) {
      console.log(`SqsService.queueMessage: Error while sending message to ${url}. GroupID: ${groupId}. Body: ${body}`);
      throw error;
    }
  }
}