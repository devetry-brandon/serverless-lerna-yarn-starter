import { injectable } from "tsyringe";
import { AdobeSignApi } from "../apis/adobe-sign/adobe-sign-api";
import { Agreement } from "../models/adobe-sign/agreement";
import {AgreementPostData} from "../models/adobe-sign/agreement-post-data";

@injectable()
export class AgreementService {
    constructor(private adobeSignApi: AdobeSignApi) {}

    public async getAgreement(id: string): Promise<Agreement> {
        return await this.adobeSignApi.getAgreement(id);
    }

    //@todo replace with User Repo
    public getUserData(userId: string): {[key: string]: string} {
        console.log('retrieving user data for: ', userId);
        return {
            id: userId,
            email: 'ngleapai@gmail.com',
            firstName: 'Noah',
            lastName: 'Leapai',
            customField: 'some random value'
        }
    }

    //@todo replace with Template Repo
    public getTemplate(templateId: string): {[key: string]: any} {
        console.log('retrieving template: ', templateId);
        return {
            id: templateId,
            title: 'Template Title - API Test 008, interceptor test',
            options: {
                silenceEmails: true
            },
            mappings: [
                {
                    source: 'ods',
                    sourceField: 'firstName',
                    targetField: 'First.Name',
                    defaultValue: '',
                },
                {
                    source: 'ods',
                    sourceField: 'lastName',
                    targetField: 'Last.Name',
                    defaultValue: '',
                },
                {
                    source: 'ods',
                    sourceField: 'customField',
                    targetField: 'Text af442ffe-83fe-429d-a9bd-d00a2197ea3e',
                    defaultValue: '',
                },
                {
                    source: 'defaultValue',
                    sourceField: null,
                    targetField: 'Supplier.Type',
                    defaultValue: 'domestic',
                },
            ]
        }
    }

    public async createSigningUrlAgreement(templateId: string, userId: string): Promise<object> {
        const newAgreementId = await this.createAgreement(templateId, userId);
        const signingUrl = await this.getAgreementSigningUrls(newAgreementId);
        return {
            agreement_id: newAgreementId,
            signing_url: signingUrl
        }
    }

    public async createAgreement(templateId: string, userId: string): Promise<string> {
        //@todo Check if agreement with user and template already exists in IN_PROGRESS state

        //@todo fetch mappings for AdobeSign template from integration service DB
        const template = this.getTemplate(templateId);

        //@todo fetch signer data from ODS
        const prefillData = this.getUserData(userId)

        const agreementCreationData = this.generateAgreementPostBody(template, prefillData);

        return await this.adobeSignApi.createAgreement(agreementCreationData);

        //@todo save new agreement to ASU Agreements table
    }

    private generateAgreementPostBody(template, user) {
        let mergeFieldInfo = template.mappings.map(mapping => {
            return {
                fieldName: mapping.targetField,
                defaultValue: user[mapping.sourceField]
            }
        });

        return new AgreementPostData().setTemplateId(template.id)
            .setTemplateName(template.title)
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