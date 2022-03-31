import { FormDataMappingSource } from "../../enums/form-data-mapping-source";
import { DataValidationError } from "asu-core";

export class FormDataMapping {
  source: FormDataMappingSource;
  sourceField: string;
  targetField: string;
  defaultValue: string;

  constructor(data?: Partial<FormDataMapping>) {
    

    if (data) {
      this.sourceField = data.sourceField;
      this.targetField = data.targetField;
      this.defaultValue = data.defaultValue;
      if (Object.values(FormDataMappingSource).includes(data.source)) {
        this.source = data.source;
      }
      else {
        throw new DataValidationError(`${data.source} is not a valid FormDataMappingSource.`);
      }
    }
    
  }
}