import { Supplier } from "../models/supplier";

export class WorkdayApi {
    public async createSupplier(supplier: Supplier): Promise<Supplier> {
        return supplier;
    }
}