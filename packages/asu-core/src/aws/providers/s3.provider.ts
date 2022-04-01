import { S3 } from "aws-sdk";

export class S3Provider {
  resolve(): S3 {
    return new S3({apiVersion: '2006-03-01'});
  }
}