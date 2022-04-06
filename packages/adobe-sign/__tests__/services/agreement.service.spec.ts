import "reflect-metadata";
import {Mock, S3Bucket, S3Service, SqsQueue, SqsService, TimeService} from "asu-core";
import {AdobeSignApi} from '../../src/apis/adobe-sign/adobe-sign-api';
import {Agreement} from '../../src/models/adobe-sign/agreement';
import {AgreementService} from '../../src/services/agreement.service';
import {TemplatesRepo} from "../../src/repos/templates.repo";
import {UsersRepo} from "../../src/repos/users.repo";
import {AgreementsRepo} from "../../src/repos/agreements.repo";
import * as fixture from "../../__fixtures__/adobe-sign-api";
import {Agreement as ASUAgreement} from "../../src/models/asu/agreement";
import { AgreementStatus } from "../../src/enums/agreement-status";
import { Webhook } from "../../src/models/adobe-sign/webhook";
import { WebhookEvent } from "../../src/enums/webhook-event";
import { WebhookLog } from "../../src/models/asu/webhook-log";
import { Template } from "../../src/models/asu/template";

describe('AgreementService', () => {
  function setup() {
    const adobeApi = Mock(new AdobeSignApi(null, null));
    const templatesRepo = Mock(new TemplatesRepo(null));
    const agreementsRepo = Mock(new AgreementsRepo(null));
    const usersRepo = Mock(new UsersRepo());
    const s3Service = Mock(new S3Service(null));
    const sqsService = Mock(new SqsService(null));
    const timeService = Mock(new TimeService());
    const service = new AgreementService(
      adobeApi, templatesRepo, agreementsRepo, usersRepo, s3Service, sqsService, timeService);

    return {service, adobeApi, templatesRepo, agreementsRepo, usersRepo, s3Service, sqsService, timeService};
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

  describe('processWebhook', () => {
    const agreementId = "1234";
    let adobeSignAgreement: Agreement = null;
    let dbAgreement: ASUAgreement = null;
    let webhook: Webhook = null;
    const template = new Template({
      adobeSignId: "4321",
      s3Dir: "templates",
      integrationQueues: [
        SqsQueue.WorkdayWebhooks,
        SqsQueue.AgreementWebhooks
      ]
    });

    beforeEach(() => {
      adobeSignAgreement = new Agreement({
        id: agreementId,
        status: AgreementStatus.OutForSignature
      });
      dbAgreement = new ASUAgreement({
        adobeSignId: agreementId,
        adobeSignTemplateId: template.adobeSignId,
        status: AgreementStatus.OutForSignature
      });
      webhook = new Webhook({
        event: WebhookEvent.AgreementCreated,
        agreement: new Agreement({
          id: agreementId
        })
      });
    });

    it('should get agreement from AdobeSignApi and AgreementsRepo with the given id', async () => {
      // Arrange
      const { service, adobeApi, agreementsRepo } = setup();

      adobeApi.getAgreement.mockResolvedValue(adobeSignAgreement);
      agreementsRepo.getAgreementById.mockResolvedValue(dbAgreement);

      // Act
      await service.processWebhook(webhook);

      // Assert
      expect(adobeApi.getAgreement).toBeCalledWith(agreementId);
      expect(agreementsRepo.getAgreementById).toBeCalledWith(agreementId);
    });

    it('should log webhook, save agreement, and early return if status is the same', async () => {
      // Arrange
      const { service, adobeApi, agreementsRepo, timeService, templatesRepo } = setup();
      const expectedTimestamp = Date.now();

      adobeApi.getAgreement.mockResolvedValue(adobeSignAgreement);
      agreementsRepo.getAgreementById.mockResolvedValue(dbAgreement);
      timeService.currentTimestamp.mockReturnValue(expectedTimestamp);

      // Act
      await service.processWebhook(webhook);

      // Assert
      expect(agreementsRepo.put.mock.calls[0][0].webhookLogs.length).toBe(1);
      expect(agreementsRepo.put.mock.calls[0][0].webhookLogs[0]).toMatchObject(new WebhookLog({
        event: webhook.event,
        timestamp: expectedTimestamp
      }));
      expect(templatesRepo.getTemplateById).toBeCalledTimes(0);
    });

    it('should log webhook, change status, and save agreement, if status is the different but not signed', async () => {
      // Arrange
      const { service, adobeApi, agreementsRepo, timeService, templatesRepo } = setup();
      const expectedTimestamp = Date.now();

      adobeSignAgreement.status = AgreementStatus.Cancelled;

      adobeApi.getAgreement.mockResolvedValue(adobeSignAgreement);
      agreementsRepo.getAgreementById.mockResolvedValue(dbAgreement);
      timeService.currentTimestamp.mockReturnValue(expectedTimestamp);

      // Act
      await service.processWebhook(webhook);

      // Assert
      expect(agreementsRepo.put.mock.calls[0][0].webhookLogs.length).toBe(1);
      expect(agreementsRepo.put.mock.calls[0][0].webhookLogs[0]).toMatchObject(new WebhookLog({
        event: webhook.event,
        timestamp: expectedTimestamp
      }));
      expect(agreementsRepo.put.mock.calls[0][0].status).toBe(adobeSignAgreement.status);
      expect(templatesRepo.getTemplateById).toBeCalledTimes(0);
    });

    it('should log webhook, status, form data, pdf, and s3Location, as well as queue integrations if status is the different and signed', async () => {
      // Arrange
      const { service, adobeApi, templatesRepo, agreementsRepo, s3Service, sqsService, timeService } = setup();
      const expectedTimestamp = Date.now();
      const expectedFormData = {
        "First.Name": "John"
      };
      const expectedPdf = Buffer.from("1234");
      const expectedS3Location = `${template.s3Dir}/${dbAgreement.asuriteId}-${expectedTimestamp}.pdf`;

      adobeSignAgreement.status = AgreementStatus.Signed;

      adobeApi.getAgreement.mockResolvedValue(adobeSignAgreement);
      agreementsRepo.getAgreementById.mockResolvedValue(dbAgreement);
      timeService.currentTimestamp.mockReturnValue(expectedTimestamp);
      templatesRepo.getTemplateById.mockResolvedValue(template);
      adobeApi.getAgreementFormData.mockResolvedValue(expectedFormData);
      adobeApi.getAgreementPdf.mockResolvedValue(expectedPdf);

      // Act
      await service.processWebhook(webhook);

      // Assert
      expect(agreementsRepo.put.mock.calls[0][0].webhookLogs.length).toBe(1);
      expect(agreementsRepo.put.mock.calls[0][0].webhookLogs[0]).toMatchObject(new WebhookLog({
        event: webhook.event,
        timestamp: expectedTimestamp
      }));
      expect(agreementsRepo.put.mock.calls[0][0].status).toBe(adobeSignAgreement.status);
      expect(agreementsRepo.put.mock.calls[0][0].s3Location).toBe(expectedS3Location);
      expect(agreementsRepo.put.mock.calls[0][0].formData).toBe(expectedFormData);
      expect(templatesRepo.getTemplateById).toBeCalledWith(template.adobeSignId);
      expect(adobeApi.getAgreementFormData).toBeCalledWith(dbAgreement.adobeSignId);
      expect(adobeApi.getAgreementPdf).toBeCalledWith(dbAgreement.adobeSignId);
      expect(s3Service.put).toBeCalledWith(
        S3Bucket.CompletedDocs,
        expectedS3Location,
        expectedPdf
      );
      template.integrationQueues.forEach(x => {
        expect(sqsService.sendMessage).toBeCalledWith(x, JSON.stringify(webhook), dbAgreement.adobeSignId);
      });
    });
  });
});