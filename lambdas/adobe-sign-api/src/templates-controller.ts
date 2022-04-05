/* istanbul ignore file */

import "reflect-metadata";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "tsyringe";
import { TemplatesService, Template } from "adobe-sign";
import { lambdaHandleError, lambdaReturnObject } from "asu-core";

export const getTemplate = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const service = container.resolve(TemplatesService);
    const template = await service.getTemplate(event.pathParameters.id);
    return lambdaReturnObject(template);
  }
  catch (error) {
    return lambdaHandleError(error);
  }
}

export const putTemplate = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const service = container.resolve(TemplatesService);
    const template = await service.putTemplate(new Template(JSON.parse(event.body)));
    return lambdaReturnObject(template);
  }
  catch (error) {
    return lambdaHandleError(error);
  }
}