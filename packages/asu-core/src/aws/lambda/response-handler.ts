import { APIGatewayProxyResult } from "aws-lambda";

export const lambdaReturn = (response: string, statusCode: number = 200): APIGatewayProxyResult => {
  return {
    statusCode: statusCode,
    body: response
  }
}

export const lambdaReturnObject = (obj: Object, statusCode: number = 200): APIGatewayProxyResult => {
  return lambdaReturn(JSON.stringify(obj), statusCode);
}

export const lambdaReturnNoContent = (): APIGatewayProxyResult => {
  return lambdaReturn('', 204);
}