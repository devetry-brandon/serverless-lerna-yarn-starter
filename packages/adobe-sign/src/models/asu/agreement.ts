import { AgreementStatus } from "../../enums/agreement-status";

export class Agreement {
  id: number;
  asuriteId: string;
  adobeSignId: string;
  status: AgreementStatus;
  s3Location: string;

  constructor(data?: Partial<Agreement>) {
    Object.assign(this, data);
  }
}