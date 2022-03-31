import { DynamoProvider, EnvironmentVariable, NotFoundError } from "asu-core";
import { v4 as uuid } from "uuid";

export interface ObjectWithId {
  id: string;
}

export abstract class BaseRepo<Type> {
  protected table: string;

  constructor(protected connectionProvider: DynamoProvider, table: string) {
    this.table = `${process.env[EnvironmentVariable.Stage]}-${table}`;
  }

  public async create<Type extends ObjectWithId>(item: Type): Promise<Type> {
    try {
      const conn = this.connectionProvider.resolve();

      item.id = uuid();

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

  protected async getById<T>(id: string): Promise<Partial<T>> {
    try {
      const conn = this.connectionProvider.resolve();

      const data = await conn.get({
        TableName: this.table,
        Key: {
          id: id
        }
      }).promise();
    
      return data.Item as any as Partial<T>;
    }
    catch(error) {
      console.log(`BaseRepo.get: Error while get item from ${this.table} with id ${id}: ${error}`);
      throw new NotFoundError(`No item exists in ${this.table} with id ${id}`);
    }
  }
}