import { WebhookEvent } from "../../enums/webhook-event";
import { Agreement } from "./agreement";

export class Webhook {
  event: WebhookEvent;
  agreement: Agreement;

  constructor(data?: Partial<Webhook>) {
    if (data) {
      this.event = data.event;
      this.agreement = new Agreement(data.agreement);
    }
  }
}