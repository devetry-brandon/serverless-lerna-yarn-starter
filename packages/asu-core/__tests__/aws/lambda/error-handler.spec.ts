import { NotFoundError } from "../../../src/errors/not-found.error";
import { lambdaHandleError } from "../../../src/aws/lambda/error-handler";

describe('error-handler', () => {
  describe('lambdaHandleError', () => {
    it('should set status code to 404 and body to error message when NotFoundError thrown', () => {
      // Arrange
      const error = new NotFoundError('Entity not found');

      // Act
      const result = lambdaHandleError(error);

      // Assert
      expect(result.statusCode).toBe(404);
      expect(result.body).toBe(error.message);
    });

    it('should set status code to 500 and body to geneic message when anything else thrown', () => {
      // Arrange
      const errorObj = new Error('Some Error');
      const errorString = 'Some Error';
      const expectedBody = 'Internal Service Error';

      // Act
      const resultObj = lambdaHandleError(errorObj);
      const resultString = lambdaHandleError(errorString);

      // Assert
      expect(resultObj.statusCode).toBe(500);
      expect(resultObj.body).toBe(expectedBody);

      expect(resultString.statusCode).toBe(500);
      expect(resultString.body).toBe(expectedBody);
    });
  });
});