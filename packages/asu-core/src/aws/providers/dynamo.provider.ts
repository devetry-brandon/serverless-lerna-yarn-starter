import { DynamoDB } from "aws-sdk";

export class DynamoProvider {
  public resolve(): DynamoDB.DocumentClient {
    return new DynamoDB.DocumentClient();
  }
}