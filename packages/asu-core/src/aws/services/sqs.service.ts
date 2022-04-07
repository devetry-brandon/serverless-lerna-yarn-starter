import { injectable } from "tsyringe";
import { EnvironmentVariable } from "../../asu-core";
import { SqsQueue } from "../enums/sqs-queue";
import { SqsProvider } from "../providers/sqs.provider";



@injectable()
export class SqsService {
  constructor(private sqsProvider: SqsProvider) {}

  public async sendMessage(queue: SqsQueue, body: string, groupId: string): Promise<void> {
    const sqsQueueUrls = {
      [SqsQueue.AgreementWebhooks]: process.env[EnvironmentVariable.AgreementWebhookQueueUrl],
      [SqsQueue.WorkdayWebhooks]: process.env[EnvironmentVariable.WorkdayWebhookQueueUrl]
    };
    const url = sqsQueueUrls[queue];

    try {
      const sqs = this.sqsProvider.resolve();
      
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