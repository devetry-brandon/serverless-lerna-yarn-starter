import { DynamoProvider, EnvironmentVariable, NotFoundError } from "asu-core";

export abstract class BaseRepo<T> {
  protected table: string;

  constructor(protected connectionProvider: DynamoProvider, table: string, protected idProp: string) {
    this.table = `${process.env[EnvironmentVariable.Stage]}-${table}`;
  }

  public async create(item: T): Promise<T> {
    try {
      const conn = this.connectionProvider.resolve();

      await conn.put({
        TableName: this.table,
        Item: item
      }).promise();
    
      return item;
    }
    catch(error) {
      console.log(`BaseRepo.create: Error while putting item in ${this.table}: ${error}`);
      throw error;
    }
  }

  protected async getById(id: string): Promise<Partial<T>> {
    let data = null;
    
    try {
      const conn = this.connectionProvider.resolve();

      data = await conn.get({
        TableName: this.table,
        Key: {
          [this.idProp]: id
        }
      }).promise();
    }
    catch(error) {
      console.log(`BaseRepo.getById: Error while get item from ${this.table} with id ${id}: ${error}`);
      throw error;
    }

    if (data.Item === undefined) {
      throw new NotFoundError(`No item exists in ${this.table} with ${this.idProp} ${id}`);
    }
  
    return data.Item as any as Partial<T>;
  }
}