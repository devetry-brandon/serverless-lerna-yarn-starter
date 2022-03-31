import "reflect-metadata";
import { AdobeSignApi } from '../../src/apis/adobe-sign/adobe-sign-api';
import {AxiosProvider, SecretsManagerService} from "asu-core";
import {Mock} from "asu-core/src/testing/mock-provider";
import {Axios} from "axios";
import {AdobeApiError} from "../../src/apis/errors/adobe-api-error";
import * as fixture from "../../__fixtures__/adobe-sign-api";

describe('AdobeSignAPI', () => {
    function setup() {
        const secretsManagerService = Mock(new SecretsManagerService(null, null));
        const mockAxios = Mock(new Axios());
        const axiosProvider = Mock(new AxiosProvider())
        axiosProvider.resolve.mockReturnValue(mockAxios);
        const adobeApi = new AdobeSignApi(secretsManagerService, axiosProvider);

        return { secretsManagerService, adobeApi, mockAxios };
    }

    describe('getAgreement', () => {
        it('should make a GET request with the given id and return Agreement object', async () => {
            // Arrange
            let { adobeApi, mockAxios } = setup();
            const mockData = {
                id: fixture.mockAgreementId,
                name: '[DEMO USE ONLY] Agreement Test 001',
                groupId: 'CBJCHBCAABAACnRhBD9pKDAfZ55583n-4WOlwlvI_RGM',
                type: 'AGREEMENT',
                status: 'SIGNED',
                hasFormFieldData: true,
            }

            mockAxios.get.mockResolvedValue({data: mockData});

            // Act
            let result = await adobeApi.getAgreement(mockData.id);

            // Assert
            expect(mockAxios.get).toBeCalledWith('/agreements/' + mockData.id);
            expect(result).toMatchObject(mockData);
        });

        it('should throw an AdobeApiError if the HTTP client cannot be created', async () => {
            // Arrange
            let { adobeApi, secretsManagerService } = setup();
            secretsManagerService.getSecret.mockRejectedValue(new Error('Test error'));

            // Assert
            await expect(async () => {
                // Act
                await adobeApi.getAgreement(fixture.mockAgreementId);
            }).rejects.toThrow(AdobeApiError);
        })

        it('should throw an AdobeApiError if API request failed', async () => {
            // Arrange
            let { adobeApi, mockAxios } = setup();
            mockAxios.get.mockRejectedValue({
                response: {
                    status: 401,
                    data: {
                        code: "TEST_ERROR",
                        message: 'Test error'
                    }
                }
            });

            // Assert
            await expect(async () => {
                // Act
                await adobeApi.getAgreement(fixture.mockAgreementId);
            }).rejects.toThrow(AdobeApiError);
        })
    });

    describe('createAgreement', () => {
        it('should make a POST request with the given creation data and return Agreement ID', async () => {
            // Arrange
            let { adobeApi, mockAxios } = setup();
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

        it('should throw an AdobeApiError if API request failed', async () => {
            // Arrange
            let { adobeApi, mockAxios } = setup();
            mockAxios.post.mockRejectedValue({
                response: {
                    status: 401,
                    data: {
                        code: "TEST_ERROR",
                        message: 'Test error'
                    }
                }
            });

            // Assert
            await expect(async () => {
                // Act
                await adobeApi.createAgreement(fixture.mockAgreementCreationData);
            }).rejects.toThrow(AdobeApiError);
        })
    });

    describe('getAgreementSigningUrls', () => {
        it('should make a GET request with the given agreement ID and return a signing URL', async () => {
            // Arrange
            let { adobeApi, mockAxios } = setup();
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
            Object.defineProperty(mockAxios,'interceptors', {value: {
                response: {
                    use: jest.fn()
                },
            }});

            // Act
            let result = await adobeApi.getAgreementSigningUrls(fixture.mockAgreementId);

            // Assert
            expect(mockAxios.get).toBeCalledWith(`/agreements/${fixture.mockAgreementId}/signingUrls`);
            expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
            expect(result).toBe(expectedSigningUrl);
        });

        it('should throw an AdobeApiError if API request failed', async () => {
            // Arrange
            let { adobeApi, mockAxios } = setup();
            mockAxios.get.mockRejectedValue({
                response: {
                    status: 401,
                    data: {
                        code: "TEST_ERROR",
                        message: 'Test error'
                    }
                }
            });

            // Assert
            await expect(async () => {
                // Act
                await adobeApi.getAgreementSigningUrls(fixture.mockAgreementId);
            }).rejects.toThrow(AdobeApiError);
        })
    });
});