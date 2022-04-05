import { Agreement } from "./agreement";

export class Webhook {
  event: string;
  agreement: Agreement

  constructor(data?: Partial<Webhook>) {
    if (data) {
      this.event = data.event;
      this.agreement = new Agreement(data.agreement);
    }
  }
}