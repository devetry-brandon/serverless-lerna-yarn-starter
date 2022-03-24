import { MappingFieldOperationType } from "../enums/mapping-field-operation-type";

export class MappingFieldOperation {
    type: MappingFieldOperationType;
    separator: string;

    constructor(data: Partial<MappingFieldOperation>) {
        Object.assign(this, data);
    }
}