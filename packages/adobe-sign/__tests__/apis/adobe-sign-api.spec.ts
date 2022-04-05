import "reflect-metadata";
import {AdobeSignApi} from '../../src/apis/adobe-sign/adobe-sign-api';
import {AxiosProvider, NotFoundError, SecretsManagerService} from "asu-core";
import {Mock} from "asu-core/src/testing/mock-provider";
import {Axios} from "axios";
import * as fixture from "../../__fixtures__/adobe-sign-api";

describe('AdobeSignAPI', () => {
  function setup() {
    const secretsManagerService = Mock(new SecretsManagerService(null, null));
    const mockAxios = Mock(new Axios());
    const axiosProvider = Mock(new AxiosProvider())
    axiosProvider.resolve.mockReturnValue(mockAxios);
    const adobeApi = new AdobeSignApi(secretsManagerService, axiosProvider);

    return {secretsManagerService, adobeApi, mockAxios};
  }

  function addAxiosResponseInterceptor(mockAxios: jest.Mocked<Axios>) {
    Object.defineProperty(mockAxios, 'interceptors', {
      value: {
        response: {
          use: jest.fn()
        }
      }
    });
  }

  describe('getAgreement', () => {
    it('should make a GET request with the given id and return Agreement object', async () => {
      // Arrange
      let {adobeApi, mockAxios} = setup();
      const mockData = {
        id: fixture.mockAgreementId,
        name: '[DEMO USE ONLY] Agreement Test 001',
        groupId: 'CBJCHBCAABAACnRhBD9pKDAfZ55583n-4WOlwlvI_RGM',
        type: 'AGREEMENT',
        status: 'SIGNED',
        hasFormFieldData: true
      }

      mockAxios.get.mockResolvedValue({data: mockData});

      // Act
      let result = await adobeApi.getAgreement(mockData.id);

      // Assert
      expect(mockAxios.get).toBeCalledWith('/agreements/' + mockData.id);
      expect(result).toMatchObject(mockData);
    });

    it('should throw if the HTTP client cannot be created', async () => {
      // Arrange
      let {adobeApi, secretsManagerService} = setup();
      const expectedError = new Error('Could not connect to secret manager.');
      secretsManagerService.getSecret.mockRejectedValue(expectedError);

      // Act / Assert
      await expect(adobeApi.getAgreement(fixture.mockAgreementId)).rejects.toThrow(expectedError);
    })

    it('should throw NotFound error if AdobeSign API returns an error code of INVALID_AGREEMENT_ID', async () => {
      // Arrange
      let {adobeApi, mockAxios} = setup();
      mockAxios.get.mockRejectedValue({
        response: {
          status: 404,
          data: {
            code: "INVALID_AGREEMENT_ID",
            message: 'The Agreement ID specified is invalid'
          }
        }
      });

      // Act / Assert
      await expect(adobeApi.getAgreement(fixture.mockAgreementId)).rejects.toThrow(NotFoundError);
    })
  });

  describe('createAgreement', () => {
    it('should make a POST request with the given creation data and return Agreement ID', async () => {
      // Arrange
      let {adobeApi, mockAxios} = setup();
      const mockResponseData = {
        id: fixture.mockAgreementId
      }

      mockAxios.post.mockResolvedValue({data: mockResponseData});

      // Act
      let result = await adobeApi.createAgreement(fixture.mockAgreementCreationData);

      // Assert
      expect(mockAxios.post).toBeCalledWith('/agreements', fixture.mockAgreementCreationData);
      expect(result).toBe(mockResponseData.id);
    });

    it('should throw if API request failed', async () => {
      // Arrange
      let {adobeApi, mockAxios} = setup();
      const expectedError = new Error('Internal server error');
      mockAxios.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            code: "MISSING_REQUIRED_PARAM",
            message: 'Name is missing.'
          }
        }
      });

      // Act / Assert
      await expect(adobeApi.createAgreement(fixture.mockAgreementCreationData)).rejects.toThrow(expectedError);
    })
  });

  describe('getAgreementSigningUrls', () => {
    it('should make a GET request with the given agreement ID and return a signing URL', async () => {
      // Arrange
      let {adobeApi, mockAxios} = setup();
      const expectedSigningUrl = fixture.mockSigningUrl;
      const mockResponseData = {
        "signingUrlSetInfos": [
          {
            "signingUrls": [
              {
                "email": "ngleapai@gmail.com",
                "esignUrl": expectedSigningUrl
              }
            ]
          }
        ]
      }

      mockAxios.get.mockResolvedValue({data: mockResponseData});
      addAxiosResponseInterceptor(mockAxios);

      // Act
      let result = await adobeApi.getAgreementSigningUrls(fixture.mockAgreementId);

      // Assert
      expect(mockAxios.get).toBeCalledWith(`/agreements/${fixture.mockAgreementId}/signingUrls`);
      expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
      expect(result).toBe(expectedSigningUrl);
    });

    it('should throw NotFound error if AdobeSign API returns an error code of INVALID_AGREEMENT_ID', async () => {
      // Arrange
      let {adobeApi, mockAxios} = setup();
      mockAxios.get.mockRejectedValue({
        response: {
          status: 404,
          data: {
            code: "INVALID_AGREEMENT_ID",
            message: 'The Agreement ID specified is invalid'
          }
        }
      });
      addAxiosResponseInterceptor(mockAxios);

      // Act / Assert
      await expect(adobeApi.getAgreementSigningUrls(fixture.mockAgreementId)).rejects.toThrow(NotFoundError);
    })
  });

  describe('getAgreementFormData', () => {
    it('should call api with given id and return json from csv data', async () => {
      // Arrange
      const { adobeApi, mockAxios } = setup();
      const expectedId = "1234";
      const expectedFormData = {
        "id": "123",
        "First.Name": "Brandon",
        "Last.Name": "Pfeiffer"
      };
      const csvData = '"id","First.Name","Last.Name"\n' +
        `"${expectedFormData['id']}","${expectedFormData['First.Name']}","${expectedFormData['Last.Name']}"\n` +
        '"321","Noah","Leapai"';

      mockAxios.get.mockResolvedValue({data: csvData});

      // Act
      const result = await adobeApi.getAgreementFormData(expectedId);

      // Assert
      expect(mockAxios.get).toBeCalledWith(`/agreements/${expectedId}/formData`);
      expect(result).toMatchObject(expectedFormData);
    });

    it('should throw error from api', async () => {
      // Arrange
      const { adobeApi, mockAxios } = setup();
      const expectedId = "1234";
      const expectedError = new Error('Failure');

      mockAxios.get.mockRejectedValue(expectedError);

      // Act / Assert
      expect(adobeApi.getAgreementFormData(expectedId)).rejects.toThrow(expectedError);
    });
  });

  describe('getAgreementPdf', () => {
    it('should call api with given id and return buffer', async () => {
      // Arrange
      const { adobeApi, mockAxios } = setup();
      const expectedId = "1234";
      const expectedBuffer = Buffer.from("asdf");

      mockAxios.get.mockResolvedValue({data: expectedBuffer});

      // Act
      const result = await adobeApi.getAgreementPdf(expectedId);

      // Assert
      expect(mockAxios.get).toBeCalledWith(`/agreements/${expectedId}/combinedDocument`, {responseType: 'arraybuffer'});
      expect(result).toMatchObject(expectedBuffer);
    });

    it('should throw error from api', async () => {
      // Arrange
      const { adobeApi, mockAxios } = setup();
      const expectedId = "1234";
      const expectedError = new Error('Failure');

      mockAxios.get.mockRejectedValue(expectedError);

      // Act / Assert
      expect(adobeApi.getAgreementPdf(expectedId)).rejects.toThrow(expectedError);
    });
  });
});