import {injectable} from "tsyringe";
import {AdobeSignApi} from "../apis/adobe-sign/adobe-sign-api";
import {Agreement} from "../models/adobe-sign/agreement";
import {AgreementPostData} from "../models/adobe-sign/agreement-post-data";
import {TemplatesRepo} from "../repos/templates.repo";
import {Template} from "../models/asu/template";
import {UsersRepo} from "../repos/users.repo";
import {AgreementsRepo} from "../repos/agreements.repo";
import {Agreement as ASUAgreement} from "../models/asu/agreement";
import {AgreementStatus} from "../enums/agreement-status";
import { Webhook } from "../models/adobe-sign/webhook";
import { WebhookLog } from "../models/asu/webhook-log";
import { S3Bucket, S3Service, SqsService, TimeService } from "asu-core";

@injectable()
export class AgreementService {
  constructor(
      private adobeSignApi: AdobeSignApi,
      private templatesRepo: TemplatesRepo,
      private agreementsRepo: AgreementsRepo,
      private usersRepo: UsersRepo,
      private s3Service: S3Service,
      private sqsService: SqsService,
      private timeService: TimeService) {
  }

  public async getAgreement(id: string): Promise<Agreement> {
    return await this.adobeSignApi.getAgreement(id);
  }

  public async createSigningUrlAgreement(templateId: string, userId: string): Promise<object> {
    const agreement = await this.createAgreement(templateId, userId);
    const signingUrl = await this.getAgreementSigningUrls(agreement.adobeSignId);
    return {
      agreement_id: agreement.adobeSignId,
      signing_url: signingUrl
    }
  }

  public async createAgreement(templateId: string, userId: string): Promise<ASUAgreement> {
    //@todo Check if agreement with user and template already exists in IN_PROGRESS state

    const template = await this.templatesRepo.getTemplateById(templateId);
    const prefillData = await this.usersRepo.getUserById(userId);
    const agreementCreationData = this.generateAgreementPostBody(template, prefillData);
    const agreementId = await this.adobeSignApi.createAgreement(agreementCreationData);
    const asuAgreement = new ASUAgreement({
      adobeSignId: agreementId,
      adobeSignTemplateId: templateId,
      asuriteId: userId,
      status: AgreementStatus.OutForSignature
    });

    await this.agreementsRepo.put(asuAgreement);

    return asuAgreement;
  }

  private generateAgreementPostBody(template: Template, user) {
    let mergeFieldInfo = template.formDataMappings.map(mapping => {
      return {
        fieldName: mapping.targetField,
        defaultValue: user[mapping.sourceField]
      }
    });

    return new AgreementPostData().setTemplateId(template.adobeSignId)
        .setTemplateName(template.name)
        .setSigner({
          email: user.email,
          name: user.firstName + " " + user.lastName
        })
        .setMergeFieldInfo(mergeFieldInfo)
        .getJsonBody();
  }

  public async getAgreementSigningUrls(id: string): Promise<string> {
    return await this.adobeSignApi.getAgreementSigningUrls(id);
  }

  public async processWebhook(webhook: Webhook): Promise<void> {
    const adobeSignAgreementTask = this.adobeSignApi.getAgreement(webhook.agreement.id);
    const dbAgreementTask = this.agreementsRepo.getAgreementById(webhook.agreement.id);

    const adobeSignAgreement = await adobeSignAgreementTask;
    const dbAgreement = await dbAgreementTask;

    dbAgreement.webhookLogs.push(new WebhookLog({
      event: webhook.event,
      timestamp: this.timeService.currentTimestamp()
    }));

    if (adobeSignAgreement.status === dbAgreement.status) {
      console.log(`AgreementService.processWebhook: Status already processed. Logging webhook and returning.`);
      await this.agreementsRepo.put(dbAgreement);
      return;
    }

    dbAgreement.status = adobeSignAgreement.status;

    if (dbAgreement.status === AgreementStatus.Signed) {
      console.log(`AgreementService.processWebhook: Status is complete. Fetching form data and pdf.`);
      const templateTask = this.templatesRepo.getTemplateById(dbAgreement.adobeSignTemplateId);
      const formDataTask = this.adobeSignApi.getAgreementFormData(adobeSignAgreement.id);
      const pdfTask = this.adobeSignApi.getAgreementPdf(adobeSignAgreement.id);

      const template = await templateTask;
      const pdf = await pdfTask;
      const s3Location = `${template.s3Dir}/${dbAgreement.asuriteId}-${this.timeService.currentTimestamp()}.pdf`;

      console.log(`AgreementService.processWebhook: Uploading PDF to ${S3Bucket.CompletedDocs} bucket, key: ${s3Location}`);
      await this.s3Service.put(S3Bucket.CompletedDocs, s3Location, pdf);

      dbAgreement.s3Location = s3Location;
      dbAgreement.formData = await formDataTask;

      if (template.integrationQueues.length) {
        console.log(`AgreementService.processWebhook: Queueing up integration webhooks. Queues: [${template.integrationQueues.join(',')}].`);
        let queueTasks = [];

        template.integrationQueues.forEach(x => {
          this.sqsService.sendMessage(x, JSON.stringify(webhook), dbAgreement.adobeSignId);
        });

        await Promise.all(queueTasks);
      }
    }

    console.log(`AgreementService.processWebhook: Saving modified agreement.`);
    await this.agreementsRepo.put(dbAgreement);
  }
}