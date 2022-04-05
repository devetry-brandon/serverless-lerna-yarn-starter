import { Mock } from "asu-core";
import { DynamoDB, Service, Request } from "aws-sdk";
import { GetItemOutput } from "aws-sdk/lib/dynamodb/types";
import { AWSError } from "aws-sdk/lib/error";

export const dynamoGetReturns = (dynamo: jest.Mocked<DynamoDB.DocumentClient>, returnValue: any) => {
  const getReturn = Mock(new Request<GetItemOutput, AWSError>(Mock(new Service()), null));
  getReturn.promise.mockResolvedValue(returnValue || null);
  dynamo.get.mockReturnValue(getReturn);
};

export const dynamoQueryReturns = (dynamo: jest.Mocked<DynamoDB.DocumentClient>, returnValue: any) => {
  const queryReturn = Mock(new Request<GetItemOutput, AWSError>(Mock(new Service()), null));
  queryReturn.promise.mockResolvedValue(returnValue || null);
  dynamo.query.mockReturnValue(queryReturn);
};