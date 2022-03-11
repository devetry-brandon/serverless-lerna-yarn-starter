import sample from "sample";
import lib from "../../libs";

export async function main(event, context) {
  return {
    statusCode: 200,
    body: `Hello Brandon! Via ${sample()} and ${lib()}.`,
  };
}
