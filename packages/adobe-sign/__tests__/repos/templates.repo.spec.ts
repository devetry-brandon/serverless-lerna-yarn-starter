import "reflect-metadata";
import { DynamoProvider, Mock } from "asu-core";
import { TemplatesRepo } from "../../src/repos/templates.repo";
import { Template } from "../../src/models/asu/template";
import { DynamoDB, Service, Request } from "aws-sdk";
import { GetItemOutput } from "aws-sdk/lib/dynamodb/types";
import { AWSError } from "aws-sdk/lib/error";
import { dynamoGetReturns } from "../mocks/mock-dynamo";

describe('TemplatesRepo', () => {
  function setup() {
    const connectionProvider = Mock(new DynamoProvider());
    const dynamo = Mock(new DynamoDB.DocumentClient());
    const repo = new TemplatesRepo(connectionProvider);

    connectionProvider.resolve.mockReturnValue(dynamo);

    return { repo, dynamo }
  }

  describe('getTemplateById', () => {
    it('should call base with given id and return Template Object', async () => {
      // Arrange
      const { repo, dynamo } = setup();
      const returnedItem = {
        adobeSignId: "123",
        name: "Test"
      };

      dynamoGetReturns(dynamo, { Item: returnedItem });

      // Act 
      const result = await repo.getTemplateById(returnedItem.adobeSignId);

      // Assert
      expect(result).toBeInstanceOf(Template);
      expect(result.adobeSignId).toBe(returnedItem.adobeSignId);
      expect(result.name).toBe(returnedItem.name);
    });
  });
});