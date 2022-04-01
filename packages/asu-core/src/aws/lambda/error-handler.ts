import { APIGatewayProxyResult } from "aws-lambda";
import { DataValidationError } from "../../asu-core";
import { NotFoundError } from "../../errors/not-found.error";

export const lambdaHandleError = (error: any): APIGatewayProxyResult => {
  if (error instanceof NotFoundError) {
    return {
      statusCode: 404,
      body: error.message
    }
  }
  else if (error instanceof DataValidationError) {
    return {
      statusCode: 400,
      body: error.message
    }
  }
  else {
    console.log(`lambdaHandleError: Unhandled exception: ${error}`);
    return {
      statusCode: 500,
      body: 'Internal Service Error'
    }
  }
}