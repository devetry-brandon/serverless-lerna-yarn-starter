import "reflect-metadata";
import {APIGatewayProxyEvent} from "aws-lambda";
import {Axios} from "axios";
import {AxiosProvider} from "../../../src/http/providers/axios.provider";
import {CasService} from "../../../src/auth/services/cas.service";
import {Mock} from "../../../src/testing/mock-provider";
import {UnauthenticatedError} from "../../../lib/errors/unauthenticated.error";
import {EnvironmentVariable} from "../../../src/enums/environment-variable";

describe('CasService', () => {
  const setup = () => {
    const mockAxios = Mock(new Axios());
    const axiosProvider = Mock(new AxiosProvider());
    axiosProvider.resolve.mockReturnValue(mockAxios);
    let mockApiEvent: APIGatewayProxyEvent = {
      body: "",
      headers: undefined,
      httpMethod: "",
      isBase64Encoded: false,
      multiValueHeaders: undefined,
      multiValueQueryStringParameters: undefined,
      path: "",
      pathParameters: undefined,
      queryStringParameters: undefined,
      requestContext: undefined,
      resource: "",
      stageVariables: undefined
    }

    const service = new CasService(axiosProvider);

    return { service, mockAxios, mockApiEvent };
  };

  describe('authenticate', () => {
    it('should redirect to CAS login when API event object is missing CAS ticket query parameter', async () => {
      // Arrange
      const {service, mockApiEvent} = setup();
      const mockCallback = jest.fn(async () => {
        return null;
      });

      // Act
      const result = await service.authenticate(mockApiEvent, mockCallback);

      // Assert
      expect(result.statusCode).toBe(301);
      expect(result.headers.Location).toBeDefined();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should return the callback return value after a successful auth', async () => {
      // Arrange
      const {service, mockApiEvent, mockAxios} = setup();
      mockApiEvent.queryStringParameters = {ticket: 'abc-123'}
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: {
          serviceResponse: {
            authenticationSuccess: {
              user: 'testuser'
            }
          }
        }
      });

      const expectedCallbackReturn = {
        statusCode: 200,
        body: 'success'
      };
      const mockCallback = jest.fn(async () => {
        return expectedCallbackReturn;
      });

      // Act
      const result = await service.authenticate(mockApiEvent, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalled();
      expect(result).toMatchObject(expectedCallbackReturn);
    });

    it('should return a 401 after a failed auth', async () => {
      // Arrange
      const {service, mockApiEvent, mockAxios} = setup();
      mockApiEvent.queryStringParameters = {
        ticket: 'abc-123'
      }
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: {
          serviceResponse: {
            authenticationFailure: {
              code: "INVALID_TICKET",
              description: "Ticket 'abc-123' not recognized"
            }
          }
        }
      });

      const mockCallback = jest.fn(async () => {
        return null;
      });

      const expectedResult = {
        statusCode: 401,
        body: 'Authentication request failed'
      };

      // Act
      const result = await service.authenticate(mockApiEvent, mockCallback);

      // Assert
      expect(mockCallback).not.toHaveBeenCalled();
      expect(result).toMatchObject(expectedResult);
    });

    it('should return a 500 after a non-2** auth response', async () => {
      // Arrange
      const {service, mockApiEvent, mockAxios} = setup();
      mockApiEvent.queryStringParameters = {ticket: 'abc-123'}
      mockAxios.get.mockRejectedValue({
        status: 404,
        data: {
          "timestamp": "2022-04-05T20:30:09.184+00:00",
          "status": 404,
          "error": "Not Found",
          "message": "No message available",
          "path": "/cas/bad-route"
        }
      });

      const mockCallback = jest.fn(async () => {
        return null;
      });

      const expectedResult = {
        statusCode: 500,
        body: 'Internal Service Error'
      };

      // Act
      const result = await service.authenticate(mockApiEvent, mockCallback);

      // Assert
      expect(mockCallback).not.toHaveBeenCalled();
      expect(result).toMatchObject(expectedResult);
    });

    it('should bypass auth if running in Dev and "skip_auth" query parameter is set to "y"', async () => {
      // Arrange
      const {service, mockApiEvent} = setup();
      process.env[EnvironmentVariable.Stage] = 'dev';
      mockApiEvent.queryStringParameters = {skip_auth: 'y'}
      const expectedCallbackReturn = {
        statusCode: 200,
        body: 'success'
      };
      const mockCallback = jest.fn(async () => {
        return expectedCallbackReturn;
      });

      // Act
      const result = await service.authenticate(mockApiEvent, mockCallback);

      // Assert
      expect(mockCallback).toHaveBeenCalled();
      expect(result).toMatchObject(expectedCallbackReturn);
    });
  });

  describe('getCasUser', () => {
    it('should return ASURITE ID string when user is authenticated', async () => {
      // Arrange
      const {service, mockApiEvent, mockAxios} = setup();
      const expectedAuthUser = 'testuser';
      mockApiEvent.queryStringParameters = {ticket: 'abc-123'}
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: {
          serviceResponse: {
            authenticationSuccess: {
              user: expectedAuthUser
            }
          }
        }
      });
      const mockCallback = jest.fn(async () => {
        return null;
      });

      // Act
      await service.authenticate(mockApiEvent, mockCallback);
      const result = await service.getCasUser();

      // Assert
      expect(result).toBe(expectedAuthUser);
    });

    it('should throw when user is not set', async () => {
      // Arrange
      const {service} = setup();
      const expectedError = new UnauthenticatedError('No authenticated user is set in CAS Service');

      // Assert
      await expect(service.getCasUser()).rejects.toThrow(expectedError);
    });
  });
})