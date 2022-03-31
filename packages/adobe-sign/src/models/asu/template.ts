import { ObjectWithId } from "../../repos/base.repo";
import { FormDataMapping } from "./form-data-mapping";

export class Template implements ObjectWithId {
  id: string;
  name: string;
  adobeSignId: string;
  formDataMappings: FormDataMapping[];

  constructor(data?: Partial<Template>) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.adobeSignId = data.adobeSignId;
      if (data.formDataMappings) {
        this.formDataMappings = data.formDataMappings.map(x => new FormDataMapping(x));
      }
    }
  }
}