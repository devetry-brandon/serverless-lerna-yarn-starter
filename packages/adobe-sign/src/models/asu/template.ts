import { FormDataMapping } from "./form-data-mapping";

export class Template {
  adobeSignId: string;
  name: string;
  formDataMappings: FormDataMapping[];

  constructor(data?: Partial<Template>) {
    if (data) {
      this.adobeSignId = data.adobeSignId;
      this.name = data.name;
      this.adobeSignId = data.adobeSignId;
      if (data.formDataMappings) {
        this.formDataMappings = data.formDataMappings.map(x => new FormDataMapping(x));
      }
    }
  }
}