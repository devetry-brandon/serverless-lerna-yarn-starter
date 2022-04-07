import { S3 } from "aws-sdk";
import { injectable } from "tsyringe";

@injectable()
export class S3Provider {
  public resolve(): S3 {
    return new S3({apiVersion: '2006-03-01'});
  }
}