import "reflect-metadata";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "tsyringe";
import { lambdaHandleError, lambdaReturnNoContent, lambdaReturnObject } from "asu-core";
import { Webhook, WebhookService } from "adobe-sign";

export const webhookVerification = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const webhookService = container.resolve(WebhookService);
    const clientId = event.headers['X-AdobeSign-ClientId'];
    
    await webhookService.validateClientId(clientId);

    return lambdaReturnObject({
      xAdobeSignClientId: clientId
    });
  }
  catch(error) {
    return lambdaHandleError(error);
  }
};

export const webhookPost = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const webhookService = container.resolve(WebhookService);
    const clientId = event.headers['X-AdobeSign-ClientId'];
    
    await webhookService.validateClientId(clientId);
    await webhookService.processWebhook(new Webhook(JSON.parse(event.body)));
    
    return lambdaReturnNoContent();
  }
  catch(error) {
    return lambdaHandleError(error);
  }
};