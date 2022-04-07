import { SqsQueue } from "asu-core";
import { FormDataMapping } from "./form-data-mapping";

export class Template {
  adobeSignId: string;
  name: string;
  formDataMappings: FormDataMapping[];
  s3Dir: string;
  integrationQueues: SqsQueue[];

  constructor(data?: Partial<Template>) {
    if (data) {
      this.adobeSignId = data.adobeSignId;
      this.name = data.name;
      this.adobeSignId = data.adobeSignId;
      this.formDataMappings = data.formDataMappings
        ? this.formDataMappings = data.formDataMappings.map(x => new FormDataMapping(x))
        : [];
      this.s3Dir = data.s3Dir;
      this.integrationQueues = data.integrationQueues || [];
    }
  }
}