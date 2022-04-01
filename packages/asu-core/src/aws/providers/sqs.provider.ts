import { SQS } from "aws-sdk";
import { injectable } from "tsyringe";

@injectable()
export class SqsProvider {
  resolve(): SQS {
    return new SQS({apiVersion: '2012-11-05'})
  }
}