import { AgreementStatus } from "../../enums/agreement-status";

export class Agreement {
  adobeSignId: string;
  asuriteId: string;
  adobeSignTemplateId: string;
  status: AgreementStatus;
  s3Location: string;

  constructor(data?: Partial<Agreement>) {
    if (data) {
      this.adobeSignId = data.adobeSignId;
      this.asuriteId = data.asuriteId;
      this.adobeSignTemplateId = data.adobeSignTemplateId;
      this.status = data.status;
      this.s3Location = data.s3Location;
    }
  }
}