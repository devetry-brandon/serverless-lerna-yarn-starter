export class Template {
  id: number;
  name: string;
  adobeSignId: string;

  constructor(data?: Partial<Template>) {
    Object.assign(this, data);
  }
}