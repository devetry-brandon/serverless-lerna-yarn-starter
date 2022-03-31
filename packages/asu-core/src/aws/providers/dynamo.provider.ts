import { DynamoDB } from "aws-sdk";

export class DynamoProvider {
  resolve(): DynamoDB.DocumentClient {
    return new DynamoDB.DocumentClient();
  }
}