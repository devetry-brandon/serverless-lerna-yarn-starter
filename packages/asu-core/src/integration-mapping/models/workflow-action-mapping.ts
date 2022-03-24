import { EntityType } from "../enums/entity-type";
import { MappingFieldOperation } from "./mapping-field-operation";

export class WorkflowActionMapping {
    sourceEntityType: EntityType;
    destinationEntityType: EntityType;
    sourceFields: string[];
    sourceFieldsOperation: MappingFieldOperation;
    destinationFields: string[];
    defaultValue: any;

    constructor(data: Partial<WorkflowActionMapping>) {
        Object.assign(this, data);
    }
}