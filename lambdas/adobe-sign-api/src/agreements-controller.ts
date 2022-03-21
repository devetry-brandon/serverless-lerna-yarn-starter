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
        let errorCode = error.statusCode === 404 ? 404 : 500;
        let errorMessage = errorCode === 404 ? `Agreement with ID: ${event.pathParameters.id} does not exist.`
            : 'Internal Service Error';
        return formatResponse(errorCode, JSON.stringify({error: errorMessage}));
    }
}