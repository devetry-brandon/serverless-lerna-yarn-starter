import { AdobeSignService } from 'adobe-sign';
import { WorkdayApi } from '../apis/workday.api';
import { ActionType, EntityType, Integration, MappingFieldOperation, MappingFieldOperationType, Workflow, WorkflowAction, WorkflowActionMapping } from 'asu-core';
import { Supplier } from '../models/supplier';

export class WorkdayService {
    constructor(private adobeSignService: AdobeSignService, private workdayApi: WorkdayApi) {}

    public async processAdobeSignAgreement(agreementId: string): Promise<void> {
        const actions = (await this.getWorkflows(agreementId))
            .flatMap(workflow => workflow.actions)
            .filter(action => action.integration == Integration.Workday);

        await Promise.all(actions.map(action => this.createSupplierFromAgreement(agreementId, action)));
    }

    private async createSupplierFromAgreement(agreementId: string, action: WorkflowAction): Promise<Supplier> {
        const sources = {
            [EntityType.AdobeSignAgreementFormData]: await this.adobeSignService.getAgreementFormData(agreementId)
        };

        const supplier = this.objectFromMappingsAndSource(
            sources, 
            action.mappings.filter(x => x.destinationEntityType === EntityType.WorkdaySupplier)
        );

        return await this.workdayApi.createSupplier(new Supplier(supplier));
    }

    private objectFromMappingsAndSource(
        sources: {[EntityType.AdobeSignAgreementFormData]: { [name: string]: string }}, 
        mappings: WorkflowActionMapping[]): object 
    {
        const object = {};

        mappings.forEach(mapping => {
            let value: any = null;

            if (mapping.sourceEntityType === EntityType.DefaultValue) {
                value = mapping.defaultValue;
            }
            else if (mapping.sourceFieldsOperation.type === MappingFieldOperationType.None) {
                value = sources[mapping.sourceEntityType]?.[mapping.sourceFields[0]];
            }

            mapping.destinationFields.forEach(field => {
                object[field] = value;
            });
        });

        return object;
    }

    // TODO: Get workflows from database
    private async getWorkflows(agreementId: string): Promise<Workflow[]> {
        const workflow = new Workflow({
            name: "Create Workday Supplier",
            actions: [
                new WorkflowAction({
                    integration: Integration.Workday,
                    type: ActionType.WorkdaySupplierCreate,
                    mappings: [
                        new WorkflowActionMapping({
                            sourceEntityType: EntityType.DefaultValue,
                            destinationEntityType: EntityType.WorkdaySupplier,
                            defaultValue: "DOMESTIC",
                            destinationFields: [
                                "type"
                            ]
                        }),
                        new WorkflowActionMapping({
                            sourceEntityType: EntityType.AdobeSignAgreementFormData,
                            destinationEntityType: EntityType.WorkdaySupplier,
                            sourceFields: ["FullName"],
                            sourceFieldsOperation: new MappingFieldOperation({
                                type: MappingFieldOperationType.None
                            }),
                            destinationFields: [
                                "name"
                            ]
                        }),
                        // new WorkflowActionMapping({
                        //     sourceEntityType: EntityType.AdobeSignAgreementFormData,
                        //     destinationEntityType: EntityType.WorkdaySupplier,
                        //     sourceFields: [
                        //         "FirstName",
                        //         "LastName"
                        //     ],
                        //     sourceFieldsOperation: new MappingFieldOperation({
                        //         type: MappingFieldOperationType.Concat,
                        //         separator: " "
                        //     }),
                        //     destinationFields: [
                        //         "name"
                        //     ]
                        // })
                    ]
                })
            ]
        });
        return [workflow];
    }
}