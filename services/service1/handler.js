import { Doctor } from "sample";

export async function main(event, context) {
  return {
    statusCode: 200,
    body: `Hello Brandon! your doctor is ${JSON.stringify(new Doctor("Egon Safar"))}.`,
  };
}
