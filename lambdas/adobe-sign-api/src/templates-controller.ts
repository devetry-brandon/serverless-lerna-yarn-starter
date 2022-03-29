import "reflect-metadata";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "tsyringe";
import { TemplatesService } from "adobe-sign";
import { NotFoundError } from "asu-core";

export const getTemplate = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const service = container.resolve(TemplatesService);
    const template = await service.getTemplate(parseInt(event.pathParameters.id))
    return {
      statusCode: 200,
      body: JSON.stringify(template)
    }
  }
  catch (error) {

    if (error instanceof NotFoundError) {
      return {
        statusCode: 404,
        body: error.message
      }
    }
    else {
      console.log(`TemplatesController.getTemplate: Caught error: ${error}`);
      return {
        statusCode: 500,
        body: 'Internal Service Error'
      }
    }
  }
}