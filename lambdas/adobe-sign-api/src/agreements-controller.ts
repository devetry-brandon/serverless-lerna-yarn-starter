import "reflect-metadata";
import { AdobeSignService } from "adobe-sign";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "tsyringe";

function formatResponse(statusCode: number, payload: string): APIGatewayProxyResult {
    return {
        statusCode,
        body: payload
    }
}

export const getAgreement = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const service = container.resolve(AdobeSignService);
        const agreement = await service.getAgreement(event.pathParameters.id);
        return formatResponse(200, JSON.stringify(agreement))
    } catch (error) {
        return formatResponse(error.statusCode ?? 500, JSON.stringify({error: error.message}));
    }
}