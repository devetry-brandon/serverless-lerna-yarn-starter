import { APIGatewayProxyResult } from "aws-lambda";
import { NotFoundError } from "../../errors/not-found.error";

export const lambdaHandleError = (error: any): APIGatewayProxyResult => {
  if (error instanceof NotFoundError) {
    return {
      statusCode: 404,
      body: error.message
    }
  }
  else {
    return {
      statusCode: 500,
      body: 'Internal Service Error'
    }
  }
}