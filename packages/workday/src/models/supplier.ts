export class Supplier {
    name: string;
    type: string;

    constructor(data: Partial<Supplier>) {
        Object.assign(this, data);
    }
}