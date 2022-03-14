import "reflect-metadata";
import { AdobeSignService } from "adobe-sign";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "tsyringe";

export const getAgreement = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let service = container.resolve(AdobeSignService);
    let agreement = await service.getAgreement(event.pathParameters.id);
    return {
        statusCode: 200,
        body: "agreement: " + JSON.stringify(agreement)
    };
}