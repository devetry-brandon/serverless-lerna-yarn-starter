import { AgreementStatus } from "../../enums/agreement-status";

export class Agreement {
  id: string;
  name: string;
  groupId: string;
  type: string;
  status: AgreementStatus;
  hasFormFieldData: boolean;

  constructor(data?: Partial<Agreement>) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.groupId = data.groupId;
      this.type = data.type;
      this.status = data.status;
      this.hasFormFieldData = data.hasFormFieldData;
    }
  }
}