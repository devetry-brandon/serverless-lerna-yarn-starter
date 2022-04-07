import { injectable } from "tsyringe";
import { EnvironmentVariable } from "../../asu-core";
import { S3Provider } from "../providers/s3.provider";

@injectable()
export class S3Service {
  constructor(private s3Provider: S3Provider) {}

  public async put(bucket: string, key: string, body: Buffer): Promise<void> {
    try {
      const s3 = this.s3Provider.resolve();
      const fullBucketName = `${process.env[EnvironmentVariable.Stage]}-${bucket}`;

      console.log(`S3Service.put: Putting object in bucket ${fullBucketName}. Key: ${key}.`);

      await s3.putObject({
        Bucket: fullBucketName,
        Key: key,
        Body: body
      }).promise();
    }
    catch (error) {
      console.log(`S3Service.put: Error while trying to put object in bucket ${bucket} at ${key}.`);
      throw error;
    }
  }
}