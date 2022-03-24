import { ActionType } from "../enums/action-type";
import { Integration } from "../enums/integration";
import { WorkflowActionMapping } from "./workflow-action-mapping";

export class WorkflowAction {
    integration: Integration;
    type: ActionType;
    mappings: WorkflowActionMapping[];

    constructor(data: Partial<WorkflowAction>) {
        Object.assign(this, data);
    }
}