/* istanbul ignore file */

import "reflect-metadata";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "tsyringe";
import { TemplatesService } from "adobe-sign";
import { NotFoundError, lambdaHandleError, lambdaReturnObject } from "asu-core";

export const getTemplate = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const service = container.resolve(TemplatesService);
    const template = await service.getTemplate(parseInt(event.pathParameters.id));
    return lambdaReturnObject(template);
  }
  catch (error) {
    return lambdaHandleError(error);
  }
}