export interface ResponseData {
    id: string;
    name: string;
    groupId: string;
    type: string;
    status: string;
    hasFormFieldData: boolean;
}

export class Agreement {
    id: string;
    name: string;
    groupId: string;
    type: string;
    status: string;
    hasFormFieldData: boolean;

    constructor({id, name, groupId, type, status, hasFormFieldData}: ResponseData) {
        this.id = id;
        this.name = name;
        this.groupId = groupId;
        this.type = type;
        this.status = status;
        this.hasFormFieldData = hasFormFieldData;
    }
}