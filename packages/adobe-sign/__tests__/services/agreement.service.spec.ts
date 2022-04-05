import "reflect-metadata";
import {Mock, S3Service, SqsService} from "asu-core";
import {AdobeSignApi} from '../../src/apis/adobe-sign/adobe-sign-api';
import {Agreement} from '../../src/models/adobe-sign/agreement';
import {AgreementService} from '../../src/services/agreement.service';
import {TemplatesRepo} from "../../src/repos/templates.repo";
import {UsersRepo} from "../../src/repos/users.repo";
import {AgreementsRepo} from "../../src/repos/agreements.repo";
import * as fixture from "../../__fixtures__/adobe-sign-api";
import {Agreement as ASUAgreement} from "../../src/models/asu/agreement";
import { AgreementStatus } from "../../src/enums/agreement-status";

describe('AgreementService', () => {
  function setup() {
    const adobeApi = Mock(new AdobeSignApi(null, null));
    const templatesRepo = Mock(new TemplatesRepo(null));
    const agreementsRepo = Mock(new AgreementsRepo(null));
    const usersRepo = Mock(new UsersRepo());
    const s3Service = Mock(new S3Service(null));
    const sqsService = Mock(new SqsService(null));
    const service = new AgreementService(adobeApi, templatesRepo, agreementsRepo, usersRepo, s3Service, sqsService);

    return {service, adobeApi, templatesRepo, agreementsRepo, usersRepo, s3Service, sqsService};
  }

  describe('getAgreement', () => {
    it('should call the AdobeSignApi with the given id', async () => {
      // Arrange
      let {service, adobeApi} = setup();
      let expectedId = fixture.mockAgreementId;
      let agreement = new Agreement({
        id: expectedId,
        name: '[DEMO USE ONLY] Agreement Test 001',
        groupId: 'CBJCHBCAABAACnRhBD9pKDAfZ55583n-4WOlwlvI_RGM',
        type: 'AGREEMENT',
        status: AgreementStatus.Signed,
        hasFormFieldData: true,
      });

      adobeApi.getAgreement.mockResolvedValue(agreement);

      // Act
      let result = await service.getAgreement(expectedId);

      // Assert
      expect(adobeApi.getAgreement).toBeCalledWith(expectedId);
      expect(result).not.toBeFalsy();
      expect(result.id).toBe(expectedId);
    });
  });

  describe('createAgreement', () => {
    it('should call the AdobeSignApi with a properly configured POST body', async () => {
      // Arrange
      let {service, adobeApi, templatesRepo, usersRepo} = setup();
      usersRepo.getUserById.mockResolvedValue(fixture.mockUserData);
      templatesRepo.getTemplateById.mockResolvedValue(fixture.mockTemplateData);
      adobeApi.createAgreement.mockResolvedValue(fixture.mockAgreementId);

      let expectedResult = new ASUAgreement(fixture.mockAsuAgreementData);

      // Act
      let result = await service.createAgreement(fixture.mockTemplateId, fixture.mockAsuUserId);

      // Assert
      expect(adobeApi.createAgreement).toHaveBeenCalledWith(fixture.mockAgreementCreationData)
      expect(result).not.toBeFalsy();
      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('getAgreementSigningUrls', () => {
    it('should call the AdobeSignApi with the given agreement id', async () => {
      // Arrange
      let {service, adobeApi} = setup();
      adobeApi.getAgreementSigningUrls.mockResolvedValue(fixture.mockSigningUrl);

      // Act
      let result = await service.getAgreementSigningUrls(fixture.mockAgreementId);

      // Assert
      expect(adobeApi.getAgreementSigningUrls).toBeCalledWith(fixture.mockAgreementId);
      expect(result).not.toBeFalsy();
      expect(result).toBe(fixture.mockSigningUrl);
    });
  });

  describe('createSigningUrlAgreement', () => {
    it('should return the id and signing URL of the newly created agreement', async () => {
      // Arrange
      let {service, adobeApi} = setup();
      jest.spyOn(service, 'createAgreement').mockResolvedValue(new ASUAgreement(fixture.mockAsuAgreementData));
      adobeApi.getAgreementSigningUrls.mockResolvedValue(fixture.mockSigningUrl);

      // Act
      let result = await service.createSigningUrlAgreement(fixture.mockTemplateId, fixture.mockAsuUserId);

      // Assert
      expect(result).toMatchObject({
        agreement_id: fixture.mockAgreementId,
        signing_url: fixture.mockSigningUrl
      });
    });
  });
});