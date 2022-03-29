import "reflect-metadata";
import { AdobeSignApi } from '../../src/apis/adobe-sign-api';
import { Agreement } from '../../src/models/agreement';
import { AdobeSignService } from '../../src/services/adobe-sign.service';
import { TemplatesRepo } from '../../src/repos/templates.repo';
import { Mock } from "asu-core";

describe('AdobeSignService', () => {
    function setup() {
        const adobeApi = new AdobeSignApi(null, null);
        const templateRepo = Mock(new TemplatesRepo(null));
        const service = new AdobeSignService(adobeApi, templateRepo);

        return { service, adobeApi };
    }

    describe('getAgreement', () => {
        it('should call the AdobeSignApi with the given id', async () => {
            // Arrange
            let { service, adobeApi } = setup();
            let expectedId = 'CBJCHBCAABAAN24SWUnGHW-o_NaT5i3O5lKuHiccQ2GP';
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
});