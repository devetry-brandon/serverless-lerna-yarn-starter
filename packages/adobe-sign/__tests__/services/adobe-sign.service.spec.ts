import "reflect-metadata";
import { AdobeSignApi } from '../../src/apis/adobe-sign-api';
import { Agreement } from '../../src/models/agreement';
import { AdobeSignService } from '../../src/services/adobe-sign.service';

describe('AdobeSignService', () => {
    function setup() {
        const adobeApi = new AdobeSignApi(null);
        const service = new AdobeSignService(adobeApi);

        return { service, adobeApi };
    }

    describe('getAgreement', () => {
        it('should call the AdobeSignApi with the given id', async () => {
            // Arrange
            let { service, adobeApi } = setup();
            let expectedId = '8e902a9e-1e2a-4bc5-8399-adaf191fe76f';
            let agreement = new Agreement();

            agreement.id = expectedId;

            let apiSpy = jest.spyOn(adobeApi, 'getAgreement').mockResolvedValue(agreement);

            // Act
            let result = await service.getAgreement(expectedId);

            // Assert
            expect(apiSpy).toBeCalledWith(expectedId);
            expect(result).not.toBeFalsy();
            expect(result.id).toBe(expectedId);
        });
    });
});