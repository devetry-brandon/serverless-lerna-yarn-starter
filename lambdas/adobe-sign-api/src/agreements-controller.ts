/* istanbul ignore file */
import "reflect-metadata";
import {container} from "tsyringe";
import {AgreementService} from "adobe-sign";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {lambdaHandleError, lambdaReturnObject} from "asu-core";

export const getAgreement = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const service = container.resolve(AgreementService);
    const agreement = await service.getAgreement(event.pathParameters.id);
    return lambdaReturnObject(agreement);
  } catch (error) {
    return lambdaHandleError(error);
  }
}

export const createSigningUrlAgreement = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const service = container.resolve(AgreementService);
    //@todo CAS auth to retrieve user ID
    const signingUrlAgreement = await service.createSigningUrlAgreement(event.pathParameters.template_id, 'nleapai');
    return lambdaReturnObject(signingUrlAgreement);
  } catch (error) {
    return lambdaHandleError(error);
  }
}