/* istanbul ignore file */
import "reflect-metadata";
import { AgreementService } from "adobe-sign";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { container } from "tsyringe";

//@todo remove once we pull in new errors
function formatResponse(statusCode: number, payload: string): APIGatewayProxyResult {
    return {
        statusCode,
        body: payload
    }
}

const service = container.resolve(AgreementService);

export const getAgreement = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const agreement = await service.getAgreement(event.pathParameters.id);
        return formatResponse(200, JSON.stringify(agreement))
    } catch (error) {
        let errorCode = error.statusCode === 404 ? 404 : 500;
        let errorMessage = errorCode === 404 ? `Agreement with ID: ${event.pathParameters.id} does not exist.`
            : 'Internal Service Error';
        return formatResponse(errorCode, JSON.stringify({error: errorMessage}));
    }
}

export const createSigningUrlAgreement = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        //@todo CAS auth to retrieve user ID
        const signingUrlAgreement = await service.createSigningUrlAgreement(event.pathParameters.template_id, 'nleapai');
        return formatResponse(200, JSON.stringify(signingUrlAgreement))
    } catch (error) {
        return formatResponse(500, JSON.stringify({error: error.message}));
    }
}