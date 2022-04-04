import { injectable } from "tsyringe";
import { EnvironmentVariable } from "../../asu-core";
import { S3Provider } from "../providers/s3.provider";

@injectable()
export class S3Service {
  constructor(private s3Provider: S3Provider) {}

  async put(bucket: string, key: string, body: Buffer): Promise<void> {
    const s3 = this.s3Provider.resolve();
    const fullBucketName = `${process.env[EnvironmentVariable.Stage]}-${bucket}`;

    await s3.putObject({
      Bucket: fullBucketName,
      Key: key,
      Body: body
    }).promise();
  }
}