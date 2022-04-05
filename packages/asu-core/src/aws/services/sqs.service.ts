import { injectable } from "tsyringe";
import { EnvironmentVariable } from "../../asu-core";
import { SqsQueue } from "../enums/sqs-queue";
import { SqsProvider } from "../providers/sqs.provider";

const SqsQueueUrls = {
  [SqsQueue.AgreementWebhooks]: process.env[EnvironmentVariable.AgreementWebhookQueueUrl],
  [SqsQueue.WorkdayWebhooks]: process.env[EnvironmentVariable.WorkdayWebhookQueueUrl]
};

@injectable()
export class SqsService {
  constructor(private sqsProvider: SqsProvider) {}

  async sendMessage(queue: SqsQueue, body: string, groupId: string): Promise<void> {
    const sqs = this.sqsProvider.resolve();
    const url = SqsQueueUrls[queue];
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