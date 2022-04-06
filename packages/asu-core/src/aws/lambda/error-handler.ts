import { APIGatewayProxyResult } from "aws-lambda";
import {DataValidationError, NotFoundError, UnauthenticatedError} from "../../asu-core";

export const lambdaHandleError = (error: any): APIGatewayProxyResult => {
  switch(error.constructor) {
    case NotFoundError:
      return {
        statusCode: 404,
        body: error.message
      }
    case DataValidationError:
      return {
        statusCode: 400,
        body: error.message
      }
    case UnauthenticatedError:
      return {
        statusCode: 401,
        body: error.message
      }
    default:
      console.log(`lambdaHandleError: Unhandled exception: ${error}`);
      return {
        statusCode: 500,
        body: 'Internal Service Error'
      }
  }
}