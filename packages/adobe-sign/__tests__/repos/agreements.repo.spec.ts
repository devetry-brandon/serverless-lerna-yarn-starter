import "reflect-metadata";
import { DynamoProvider, Mock } from "asu-core";
import { AgreementsRepo } from "../../src/repos/agreements.repo";
import { DynamoDB } from "aws-sdk";

describe('AgreementsRepo', () => {
  function setup() {
    const connectionProvider = Mock(new DynamoProvider());
    const dynamo = Mock(new DynamoDB.DocumentClient());
    const repo = new AgreementsRepo(connectionProvider);

    connectionProvider.resolve.mockReturnValue(dynamo);

    return { repo, dynamo }
  }
  it('should initialize', () => {
    const { repo } = setup();

    expect(repo).toBeDefined();
  });
});