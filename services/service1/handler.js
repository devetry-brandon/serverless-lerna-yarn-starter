import { AdobeSignService } from "adobe-sign";

export async function main(event, context) {
  let service = new AdobeSignService();

  return {
    statusCode: 200,
    body: JSON.stringify(service.getAgreement("e4bhsk1288281"))
  };
}
