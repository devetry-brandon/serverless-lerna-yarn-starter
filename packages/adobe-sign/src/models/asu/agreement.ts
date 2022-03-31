import { AgreementStatus } from "../../enums/agreement-status";
import { ObjectWithId } from "../../repos/base.repo";

export class Agreement implements ObjectWithId {
  id: string;
  asuriteId: string;
  adobeSignId: string;
  status: AgreementStatus;
  s3Location: string;

  constructor(data?: Partial<Agreement>) {
    this.id = data.id;
    this.asuriteId = data.asuriteId;
    this.adobeSignId = data.adobeSignId;
    this.status = data.status;
    this.s3Location = data.s3Location;
  }
}