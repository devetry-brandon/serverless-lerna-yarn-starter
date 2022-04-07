import { AgreementStatus } from "../../enums/agreement-status";
import { WebhookLog } from "./webhook-log";

export class Agreement {
  adobeSignId: string;
  asuriteId: string;
  adobeSignTemplateId: string;
  status: AgreementStatus;
  s3Location: string;
  webhookLogs: WebhookLog[];
  formData: {[name: string]: string};

  constructor(data?: Partial<Agreement>) {
    if (data) {
      this.adobeSignId = data.adobeSignId;
      this.asuriteId = data.asuriteId;
      this.adobeSignTemplateId = data.adobeSignTemplateId;
      this.status = data.status;
      this.s3Location = data.s3Location;
      this.webhookLogs = data.webhookLogs
        ? data.webhookLogs.map(x => new WebhookLog(x))
        : [];
      this.formData = data.formData;
    }
    else {
      this.webhookLogs = [];
    }
  }
}