import { WorkflowAction } from "./workflow-action";

export class Workflow {
    name: string;
    actions: WorkflowAction[];

    constructor(data: Partial<Workflow>) {
        Object.assign(this, data);
    }
}