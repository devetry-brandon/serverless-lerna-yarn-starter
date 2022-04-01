import { EnvironmentVariable } from "../../asu-core";
import { S3Provider } from "../providers/s3.provider";

export class S3Service {
  constructor(private s3Provider: S3Provider) {}

  async put(bucket: string, key: string, body: string): Promise<void> {
    const s3 = this.s3Provider.resolve();
    const fullBucketName = `${process.env[EnvironmentVariable.Stage]}-${bucket}`;

    await s3.putObject({
      Bucket: fullBucketName,
      Key: key,
      Body: body
    }).promise();
  }
}