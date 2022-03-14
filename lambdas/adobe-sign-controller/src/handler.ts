import { AdobeSignService } from "adobe-sign";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const getAgreement = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let service = new AdobeSignService();
    let agreement = service.getAgreement(event.queryStringParameters.id);
    return {
        statusCode: 200,
        body: JSON.stringify(agreement)
    };
}