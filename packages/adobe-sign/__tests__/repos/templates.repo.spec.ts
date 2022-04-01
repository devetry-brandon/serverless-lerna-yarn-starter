import "reflect-metadata";
import { DynamoProvider, Mock } from "asu-core";
import { TemplatesRepo } from "../../src/repos/templates.repo";
import { Template } from "../../src/models/asu/template";
import { DynamoDB, Service, Request } from "aws-sdk";
import { GetItemOutput } from "aws-sdk/lib/dynamodb/types";
import { AWSError } from "aws-sdk/lib/error";

describe('TemplatesRepo', () => {
  function setup() {
    const connectionProvider = Mock(new DynamoProvider());
    const dynamo = Mock(new DynamoDB.DocumentClient());
    const repo = new TemplatesRepo(connectionProvider);

    connectionProvider.resolve.mockReturnValue(dynamo);

    return { repo, dynamo }
  }

  const getReturns = (dynamo: jest.Mocked<DynamoDB.DocumentClient>, returnValue: any) => {
    const getReturn = Mock(new Request<GetItemOutput, AWSError>(Mock(new Service()), null));
    getReturn.promise.mockResolvedValue(returnValue || null);
    dynamo.get.mockReturnValue(getReturn);
  };

  describe('getTemplateById', () => {
    it('should call base with given id and return Template Object', async () => {
      // Arrange
      const { repo, dynamo } = setup();
      const returnedItem = {
        id: "123",
        name: "Test"
      };

      getReturns(dynamo, { Item: returnedItem });

      // Act 
      const result = await repo.getTemplateById(returnedItem.id);

      // Assert
      expect(result).toBeInstanceOf(Template);
      expect(result.id).toBe(returnedItem.id);
      expect(result.name).toBe(returnedItem.name);
    });
  });
});