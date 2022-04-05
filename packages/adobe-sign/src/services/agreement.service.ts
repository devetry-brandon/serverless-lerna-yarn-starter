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
import {CasService} from "asu-core";

@injectable()
export class AgreementService {
  constructor(
      private adobeSignApi: AdobeSignApi,
      private templatesRepo: TemplatesRepo,
      private agreementsRepo: AgreementsRepo,
      private usersRepo: UsersRepo,
      private casService: CasService) {
  }

  public async getAgreement(id: string): Promise<Agreement> {
    return await this.adobeSignApi.getAgreement(id);
  }

  public async createSigningUrlAgreement(templateId: string): Promise<{ agreement_id: string, signing_url: string }> {
    const userId = await this.casService.getCasUser();
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
      status: AgreementStatus.InProgress
    });

    await this.agreementsRepo.create(asuAgreement);

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
}