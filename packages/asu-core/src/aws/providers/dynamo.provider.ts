import { DynamoDB } from "aws-sdk";
import { EnvironmentVariable } from "../../asu-core";

export class DynamoProvider {
  resolve(): DynamoDB.DocumentClient {
    return new DynamoDB.DocumentClient({
      region: process.env[EnvironmentVariable.Region]
    });
  }
}