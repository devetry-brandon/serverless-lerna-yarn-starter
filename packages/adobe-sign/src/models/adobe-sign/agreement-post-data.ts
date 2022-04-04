export interface SignerData {
  email: string,
  name: string
}

export interface MergeFieldInfo {
  fieldName: string,
  defaultValue: string
}

export class AgreementPostData {
  private templateId: string;
  private templateName: string;
  private signer: SignerData;
  private mergeFieldInfo: MergeFieldInfo[];

  public setTemplateId(id: string): AgreementPostData {
    this.templateId = id;
    return this;
  }

  public setTemplateName(name: string): AgreementPostData {
    this.templateName = name;
    return this;
  }

  public setSigner(signer: SignerData): AgreementPostData {
    this.signer = signer;
    return this;
  }

  public setMergeFieldInfo(data: MergeFieldInfo[]): AgreementPostData {
    this.mergeFieldInfo = data;
    return this;
  }

  public getJsonBody(): object {
    return {
      "fileInfos": [
        {
          "libraryDocumentId": this.templateId
        }
      ],
      "name": this.templateName,
      "participantSetsInfo": [
        {
          "memberInfos": [
            this.signer
          ],
          "order": 1,
          "role": "SIGNER"
        }
      ],
      "mergeFieldInfo": this.mergeFieldInfo,
      "emailOption": {
        "sendOptions": {
          "completionEmails": "NONE",
          "inFlightEmails": "NONE",
          "initEmails": "NONE"
        }
      },
      "signatureType": "ESIGN",
      "state": "IN_PROCESS",
      "status": "OUT_FOR_SIGNATURE"
    }
  }
}