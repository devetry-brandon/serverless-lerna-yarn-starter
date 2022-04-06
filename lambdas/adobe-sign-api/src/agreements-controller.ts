/* istanbul ignore file */
import "reflect-metadata";
import {container} from "tsyringe";
import {AgreementService} from "adobe-sign";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {CasService, lambdaHandleError, lambdaRedirect, lambdaReturnObject} from "asu-core";

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
  const authService = container.resolve(CasService);
  return await authService.authenticate(event, async () => {
    try {
      const service = container.resolve(AgreementService);
      const signingUrlAgreement = await service.createSigningUrlAgreement(event.pathParameters.template_id);
      return lambdaRedirect(signingUrlAgreement.signing_url);
    } catch (apiError) {
      return lambdaHandleError(apiError);
    }
  });
}