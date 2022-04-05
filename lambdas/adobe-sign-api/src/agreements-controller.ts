/* istanbul ignore file */
import "reflect-metadata";
import {container} from "tsyringe";
import {AgreementService, Webhook} from "adobe-sign";
import {APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent} from "aws-lambda";
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

export const processWebhook = async (event: SQSEvent): Promise<void> => {
  try {
    const service = container.resolve(AgreementService);
    for (let i = 0; i <= event.Records.length; i++) {
      const webhook = new Webhook(JSON.parse(event.Records[i].body));
      console.log(`AgreementsController.processWebhook: Processing agreement: ${webhook.agreement.id}`);
      await service.processWebhook(webhook);
    }
  }
  catch(error) {
    throw error;
  }
}