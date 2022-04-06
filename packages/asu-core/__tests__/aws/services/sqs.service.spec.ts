import "reflect-metadata";
import { AWSError, Request, Service, SQS } from "aws-sdk";
import { EnvironmentVariable, Mock, SqsQueue, SqsService } from "../../../src/asu-core";
import { SqsProvider } from "../../../src/aws/providers/sqs.provider";

describe('SqsService', () => {
  const setup = () => {
    const sqsProvider = Mock(new SqsProvider());
    const sqs = Mock(new SQS());
    const service = new SqsService(sqsProvider);

    sqsProvider.resolve.mockReturnValue(sqs);

    return { service, sqs };
  };

  describe('sendMessage', () => {
    it('should send message and throw when SQS throws', async () => {
      // Arrange
      const { service, sqs } = setup();
      const expectedUrl = "url.to.queue";
      const expectedError = new Error("Access Denied");
      const expectedBody = "Body of message";
      const expectedGroupId = "GroupID";
      const mockSendMessageResult = Mock(new Request<SQS.SendMessageResult, AWSError>(new Service(), null));

      mockSendMessageResult.promise.mockRejectedValue(expectedError);
      sqs.sendMessage.mockReturnValue(mockSendMessageResult);

      process.env = {
        [EnvironmentVariable.WorkdayWebhookQueueUrl]: expectedUrl
      };

      // Act / Assert
      expect(service.sendMessage(SqsQueue.WorkdayWebhooks, expectedBody, expectedGroupId)).rejects.toThrowError(expectedError);
      expect(sqs.sendMessage).toBeCalledWith({
        QueueUrl: expectedUrl,
        MessageGroupId: expectedGroupId,
        MessageBody: expectedBody
      });
    });
  });
});