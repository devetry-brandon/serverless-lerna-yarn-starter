/* istanbul ignore file */
import "reflect-metadata";
import {container} from "tsyringe";
import {AgreementService, Webhook} from "adobe-sign";
import {APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent} from "aws-lambda";
import {CasService, lambdaHandleError, lambdaRedirect, lambdaReturnObject, NotFoundError} from "asu-core";

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

export const processWebhook = async (event: SQSEvent): Promise<void> => {
  try {
    const service = container.resolve(AgreementService);
    for (let record of event.Records) {
      const webhook = new Webhook(JSON.parse(record.body));
      console.log(`AgreementsController.processWebhook: Processing agreement: ${webhook.agreement.id}`);
      await service.processWebhook(webhook);
    }
  }
  catch(error) {
    if (error instanceof NotFoundError) {
      return;
    }
    throw error;
  }
}