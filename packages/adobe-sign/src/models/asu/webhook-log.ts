export class WebhookLog {
  event: string;
  timestamp: number;

  constructor(data?: Partial<WebhookLog>) {
    if (data) {
      this.event = data.event;
      this.timestamp = data.timestamp;
    }
  }
}