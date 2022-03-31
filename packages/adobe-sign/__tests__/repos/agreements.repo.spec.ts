import "reflect-metadata";
import { DynamoProvider, Mock } from "asu-core";
import { AgreementsRepo } from "../../src/repos/agreements.repo";
import { Template } from "../../src/models/asu/template";
import { DynamoDB, Service, Request } from "aws-sdk";
import { GetItemOutput } from "aws-sdk/lib/dynamodb/types";
import { AWSError } from "aws-sdk/lib/error";

describe('AgreeementsRepo', () => {
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