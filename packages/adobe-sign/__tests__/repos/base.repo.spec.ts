import "reflect-metadata";
import { DynamoProvider, EnvironmentVariable, Mock, NotFoundError } from "asu-core";
import { TemplatesRepo } from "../../src/repos/templates.repo";
import { DynamoDB, Service, Request } from "aws-sdk";
import { PutItemOutput, GetItemOutput } from "aws-sdk/lib/dynamodb/types";
import { AWSError } from "aws-sdk/lib/error";
import { Template } from "../../src/models/asu/template";

describe('BaseRepo', () => {
  const expectedStage = "dev";

  function setup() {
    const connectionProvider = Mock(new DynamoProvider());
    const dynamo = Mock(new DynamoDB.DocumentClient());
    const repo = new TemplatesRepo(connectionProvider);

    connectionProvider.resolve.mockReturnValue(dynamo);

    return { repo, dynamo }
  }

  beforeEach(() => {
    process.env = {};
    process.env[EnvironmentVariable.Stage] = expectedStage;
  });

  const putReturns = (dynamo: jest.Mocked<DynamoDB.DocumentClient>, returnValue?: any) => {
    const putReturn = Mock(new Request<PutItemOutput, AWSError>(Mock(new Service()), null));
    putReturn.promise.mockResolvedValue(returnValue || null);
    dynamo.put.mockReturnValue(putReturn);
  };

  const getReturns = (dynamo: jest.Mocked<DynamoDB.DocumentClient>, returnValue: any) => {
    const getReturn = Mock(new Request<GetItemOutput, AWSError>(Mock(new Service()), null));
    getReturn.promise.mockResolvedValue(returnValue || null);
    dynamo.get.mockReturnValue(getReturn);
  };

  /**
   * BaseRepo is an abstract class so we are testing it through
   * the TemplatesRepo.
   */
  describe('put', () => {
    it('should throw when dynamo throws', async () => {
      // Arrange
      const { repo, dynamo } = setup();
      const expectedError = new Error("Error");
      const template = new Template();

      dynamo.put.mockImplementation(() => { throw expectedError; });

      // Act / Assert
      await expect(repo.put(template)).rejects.toThrow(expectedError);
    });

    it('should put and return the item', async () => {
      // Arrange
      const { repo, dynamo } = setup();
      const expectedTemplate = new Template();
      const expectedTable = `${expectedStage}-templates`;
      
      putReturns(dynamo, null);

      // Act
      const result = await repo.put(expectedTemplate);

      // Assert
      expect(dynamo.put.mock.calls[0][0].TableName).toBe(expectedTable);
      expect(dynamo.put.mock.calls[0][0].Item).toBe(expectedTemplate);
    });
  });

  describe('getById', () => {
    it('should throw when dynamo throws', async () => {
      // Arrange
      const { repo, dynamo } = setup();
      const templateId = "123";
      const expectedError = new Error("connection problem");
      
      dynamo.get.mockImplementation(() => { throw expectedError; });

      // Act / Assert
      await expect(repo.getTemplateById(templateId)).rejects.toThrow(expectedError);
    });

    it('should throw 404 when no item returned', async () => {
      // Arrange
      const { repo, dynamo } = setup();
      const templateId = "123";
      const table = `${expectedStage}-templates`;
      const expectedError = new NotFoundError(`No item exists in ${table} with adobeSignId ${templateId}`);
      
      getReturns(dynamo, {});

      // Act / Assert
      await expect(repo.getTemplateById(templateId)).rejects.toThrow(expectedError);
    });

    it('should query dynamo with the given id and return retrieved item', async () => {
      // Arrange
      const { repo, dynamo } = setup();
      const expectedTemplate = new Template({
        adobeSignId: "123",
        name: "Test Template"
      });
      const expectedTable = `${expectedStage}-templates`;
      
      getReturns(dynamo, {Item: expectedTemplate});

      // Act
      const result = await repo.getTemplateById(expectedTemplate.adobeSignId);

      // Assert
      expect(result).toMatchObject(expectedTemplate);
      expect(dynamo.get.mock.calls[0][0].TableName).toBe(expectedTable);
      expect(dynamo.get.mock.calls[0][0].Key.adobeSignId).toBe(result.adobeSignId);
    });
  });
});