import "reflect-metadata";
import { DynamoProvider, Mock } from "asu-core";
import { AgreementsRepo } from "../../src/repos/agreements.repo";
import { DynamoDB } from "aws-sdk";
import { dynamoGetReturns, dynamoQueryReturns } from "../mocks/mock-dynamo";
import { Agreement } from "../../src/models/asu/agreement";
import { AgreementStatus } from "../../src/enums/agreement-status";

describe('AgreementsRepo', () => {
  function setup() {
    const connectionProvider = Mock(new DynamoProvider());
    const dynamo = Mock(new DynamoDB.DocumentClient());
    const repo = new AgreementsRepo(connectionProvider);

    connectionProvider.resolve.mockReturnValue(dynamo);

    return { repo, dynamo }
  }

  describe('getAgreementById', () => {
    it('should call base with given id and return Agreement object', async() => {
      // Arrange
      const { repo, dynamo } = setup();
      const returnedItem: Partial<Agreement> = {
        adobeSignId: "123",
        asuriteId: "bpfeiff1"
      };

      dynamoGetReturns(dynamo, { Item: returnedItem });

      // Act 
      const result = await repo.getAgreementById(returnedItem.adobeSignId);

      // Assert
      expect(result).toBeInstanceOf(Agreement);
      expect(result.adobeSignId).toBe(returnedItem.adobeSignId);
      expect(result.asuriteId).toBe(returnedItem.asuriteId);
    });
  });

  describe('getAgreementsForUserWithStatus', () => {
    it('should query with given asuriteId and status and return Agreement objects', async() => {
      // Arrange
      const { repo, dynamo } = setup();
      const expectedAsuriteId = "bpfeiff1";
      const expectedStatus = AgreementStatus.Signed;
      const returnedItems: Partial<Agreement>[] = [
        {
          adobeSignId: "123",
          asuriteId: expectedAsuriteId
        },
        {
          adobeSignId: "321",
          asuriteId: expectedAsuriteId
        }
      ];

      dynamoQueryReturns(dynamo, { Items: returnedItems });

      // Act 
      const results = await repo.getAgreementsForUserWithStatus(expectedAsuriteId, expectedStatus);

      // Assert
      for (let i = 0; i < returnedItems.length; i++) {
        expect(results[i]).toBeInstanceOf(Agreement);
        expect(results[i].adobeSignId).toBe(returnedItems[i].adobeSignId);
        expect(results[i].asuriteId).toBe(returnedItems[i].asuriteId);
      }
    });
  });
});