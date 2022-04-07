import "reflect-metadata"
import { Mock } from "../../../src/testing/mock-provider";
import { S3Provider } from "../../../src/aws/providers/s3.provider";
import { S3Service } from "../../../src/aws/services/s3.service";
import { AWSError, Request, S3, Service } from "aws-sdk";
import { EnvironmentVariable, S3Bucket } from "../../../src/asu-core";

describe('S3Service', () => {
  const setup = () => {
    const s3Provider = Mock(new S3Provider);
    const s3 = Mock(new S3());
    const service = new S3Service(s3Provider);

    s3Provider.resolve.mockReturnValue(s3);

    return { service, s3 };
  };

  describe('put', () => {
    it('should call putObject with correct params and throw error when s3 throws error', async () => {
      // Arrange
      const { service, s3 } = setup();
      const expectedStage = "dev";
      const expectedKey = "key";
      const expectedObject = Buffer.from("4312");
      const givenBucket = S3Bucket.CompletedDocs;
      const expectedFullBucketName = `${expectedStage}-${givenBucket}`;
      const error = new Error("Access Denied");
      const mockPutReturn = Mock(new Request<S3.PutObjectOutput, AWSError>(new Service(), null));

      process.env = {
        [EnvironmentVariable.Stage]: 'dev'
      };
      
      mockPutReturn.promise.mockRejectedValue(error);
      s3.putObject.mockReturnValue(mockPutReturn);

      // Act / Assert
      await expect(service.put(givenBucket, expectedKey, expectedObject)).rejects.toThrowError(error);
      expect(s3.putObject).toBeCalledWith({
        Bucket: expectedFullBucketName,
        Key: expectedKey,
        Body: expectedObject
      });
    });
  });
});
