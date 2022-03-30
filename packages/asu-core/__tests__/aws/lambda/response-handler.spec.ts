import { lambdaReturn, lambdaReturnObject, lambdaReturnNoContent } from "../../../src/aws/lambda/response-handler";

describe('response-handler', () => {
  describe('lambdaReturn', () => {
    it('should set status code and body as given', () => {
      // Arrange
      const expectedBody = 'Bad Request';
      const expectedStatusCode = 400;

      // Act
      const result = lambdaReturn(expectedBody, expectedStatusCode);

      // Assert
      expect(result.statusCode).toBe(expectedStatusCode);
      expect(result.body).toBe(expectedBody);
    });

    it('should should default to 200 status code', () => {
      // Arrange
      const expectedStatusCode = 200;

      // Act
      const result = lambdaReturn('');

      // Assert
      expect(result.statusCode).toBe(expectedStatusCode);
    });
  });

  describe('lambdaReturnObject', () => {
    it('should set status code as given and stringify body', () => {
      // Arrange 
      const obj = {status: 'Bad Request'};
      const expectedBody = JSON.stringify(obj);
      const expectedStatusCode = 400;

      // Act
      const result = lambdaReturnObject(obj, expectedStatusCode);

      // Assert
      expect(result.statusCode).toBe(expectedStatusCode);
      expect(result.body).toBe(expectedBody); 
    });

    it('should should default to 200 status code', () => {
      // Arrange
      const expectedStatusCode = 200;

      // Act
      const result = lambdaReturnObject({});

      // Assert
      expect(result.statusCode).toBe(expectedStatusCode);
    });
  });

  describe('lambdaReturnNoContent', () => {
    it('should set status to 204 with empty body', () => {
      // Arrange
      const expectedBody = '';
      const expectedStatusCode = 204;

      // Act
      const result = lambdaReturnNoContent();

      // Assert
      expect(result.statusCode).toBe(expectedStatusCode);
      expect(result.body).toBe(expectedBody); 
    });
  });
});