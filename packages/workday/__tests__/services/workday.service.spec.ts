import "reflect-metadata";
import { Mock } from "asu-core";
import { AdobeSignService } from "adobe-sign";
import { WorkdayService } from "../../src/services/workday.service";
import { WorkdayApi } from "../../src/apis/workday.api";

describe('WorkdayService', () => {
    const setup = () => {
        const adobeSignService = Mock(new AdobeSignService(null));
        const workdayApi = Mock(new WorkdayApi());
        const service = new WorkdayService(adobeSignService, workdayApi);

        return { service, adobeSignService, workdayApi };
    };

    describe('processAdobeSignAgreement', () => {
        it('should convert AdobeSign form data to a supplier', async () => {
            // Arrange
            const { service, adobeSignService, workdayApi } = setup();
            const agreementId = "1234";

            adobeSignService.getAgreementFormData.mockResolvedValue({
                "FirstName": "Brandon",
                "LastName": "Pfeiffer",
                "FullName": "Brandon Pfeiffer",
                "SSN": "234-098-0978"
            });
            
            // Act
            await service.processAdobeSignAgreement(agreementId);

            // Assert
            expect(workdayApi.createSupplier.mock.calls[0][0].name).toBe("Brandon Pfeiffer");
            expect(workdayApi.createSupplier.mock.calls[0][0].type).toBe("DOMESTIC");
        });
    });
});