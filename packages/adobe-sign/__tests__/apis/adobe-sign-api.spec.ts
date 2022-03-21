import "reflect-metadata";
import { AdobeSignApi } from '../../src/apis/adobe-sign-api';
import {AxiosProvider, SecretsManagerService} from "asu-core";
import {Mock} from "asu-core/src/testing/mock-provider";
import {Axios} from "axios";
import {InternalApiError} from "../../src/apis/errors/internal-api-error";
import {AdobeApiError} from "../../src/apis/errors/adobe-api-error";

describe('AdobeSignAPI', () => {
    function setup() {
        const secretsManagerService = Mock(new SecretsManagerService(null));
        const mockAxios = Mock(new Axios());
        const axiosProvider = Mock(new AxiosProvider())
        axiosProvider.resolve.mockReturnValue(mockAxios);
        const adobeApi = new AdobeSignApi(secretsManagerService, axiosProvider);

        return { secretsManagerService, adobeApi, mockAxios };
    }

    describe('getAgreement', () => {
        it('should be called with the given id and return Agreement object', async () => {
            // Arrange
            let { adobeApi, mockAxios } = setup();
            const mockData = {
                id: 'CBJCHBCAABAAN24SWUnGHW-o_NaT5i3O5lKuHiccQ2GP',
                name: '[DEMO USE ONLY] Agreement Test 001',
                groupId: 'CBJCHBCAABAACnRhBD9pKDAfZ55583n-4WOlwlvI_RGM',
                type: 'AGREEMENT',
                status: 'SIGNED',
                hasFormFieldData: true,
            }

            mockAxios.get.mockResolvedValue({data: mockData});
            let apiSpy = jest.spyOn(adobeApi, 'getAgreement')

            // Act
            let result = await adobeApi.getAgreement(mockData.id);

            // Assert
            expect(apiSpy).toBeCalledWith(mockData.id);
            expect(result).toMatchObject(mockData);
        });

        it('should throw an InternalApiError if the HTTP client cannot be created', async () => {
            // Arrange
            let { adobeApi, secretsManagerService } = setup();
            secretsManagerService.getSecret.mockRejectedValue('Test error');

            // Assert
            await expect(async () => {
                // Act
                await adobeApi.getAgreement('123');
            }).rejects.toThrow(InternalApiError);
        })

        it('should throw an AdobeApiError if API request failed', async () => {
            // Arrange
            let { adobeApi, mockAxios } = setup();
            mockAxios.get.mockRejectedValue({
                response: {
                    status: 401,
                    data: {
                        message: 'Test error'
                    }
                }
            });

            // Assert
            await expect(async () => {
                // Act
                await adobeApi.getAgreement('123');
            }).rejects.toThrow(AdobeApiError);
        })
    });
});