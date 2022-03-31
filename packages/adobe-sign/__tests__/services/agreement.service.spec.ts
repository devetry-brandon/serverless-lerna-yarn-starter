import "reflect-metadata";
import { AdobeSignApi } from '../../src/apis/adobe-sign/adobe-sign-api';
import { Agreement } from '../../src/apis/adobe-sign/models/agreement';
import { AgreementService } from '../../src/services/agreement.service';
import * as fixture from "../../__fixtures__/adobe-sign-api";

describe('AgreementService', () => {
    function setup() {
        const adobeApi = new AdobeSignApi(null, null);
        const service = new AgreementService(adobeApi);

        return { service, adobeApi };
    }

    describe('getAgreement', () => {
        it('should call the AdobeSignApi with the given id', async () => {
            // Arrange
            let { service, adobeApi } = setup();
            let expectedId = fixture.mockAgreementId;
            let agreement = new Agreement({
                id: expectedId,
                name: '[DEMO USE ONLY] Agreement Test 001',
                groupId: 'CBJCHBCAABAACnRhBD9pKDAfZ55583n-4WOlwlvI_RGM',
                type: 'AGREEMENT',
                status: 'SIGNED',
                hasFormFieldData: true,
            });

            let apiSpy = jest.spyOn(adobeApi, 'getAgreement').mockResolvedValue(agreement);

            // Act
            let result = await service.getAgreement(expectedId);

            // Assert
            expect(apiSpy).toBeCalledWith(expectedId);
            expect(result).not.toBeFalsy();
            expect(result.id).toBe(expectedId);
        });
    });

    describe('createAgreement', () => {
        it('should call the AdobeSignApi with a properly configured POST body', async () => {
            // Arrange
            let { service, adobeApi } = setup();
            jest.spyOn(service, 'getUserData').mockReturnValue(fixture.mockUserData);
            jest.spyOn(service, 'getTemplate').mockReturnValue(fixture.mockTemplateData);
            let apiSpy = jest.spyOn(adobeApi, 'createAgreement').mockResolvedValue(fixture.mockAgreementId);

            // Act
            let result = await service.createAgreement(fixture.mockTemplateId, fixture.mockAsuUserId);

            // Assert
            expect(apiSpy).toHaveBeenCalledWith(fixture.mockAgreementCreationData)
            expect(result).not.toBeFalsy();
            expect(result).toBe(fixture.mockAgreementId);
        });
    });

    describe('getAgreementSigningUrls', () => {
        it('should call the AdobeSignApi with the given agreement id', async () => {
            // Arrange
            let { service, adobeApi } = setup();
            let apiSpy = jest.spyOn(adobeApi, 'getAgreementSigningUrls').mockResolvedValue(fixture.mockSigningUrl);

            // Act
            let result = await service.getAgreementSigningUrls(fixture.mockAgreementId);

            // Assert
            expect(apiSpy).toBeCalledWith(fixture.mockAgreementId);
            expect(result).not.toBeFalsy();
            expect(result).toBe(fixture.mockSigningUrl);
        });
    });

    describe('createSigningUrlAgreement', () => {
        it('should call the AdobeSignApi with the given agreement id', async () => {
            // Arrange
            let { service, adobeApi } = setup();
            jest.spyOn(adobeApi, 'createAgreement').mockResolvedValue(fixture.mockAgreementId);
            jest.spyOn(adobeApi, 'getAgreementSigningUrls').mockResolvedValue(fixture.mockSigningUrl);

            // Act
            let result = await service.createSigningUrlAgreement(fixture.mockTemplateId, fixture.mockAsuUserId);

            // Assert
            expect(result).toMatchObject({
                'agreement_id': fixture.mockAgreementId,
                'signing_url': fixture.mockSigningUrl
            });
        });
    });
});