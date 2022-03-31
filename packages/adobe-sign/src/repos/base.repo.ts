import { DynamoProvider, EnvironmentVariable } from "asu-core";
import { v4 as uuid } from "uuid";

export interface ObjectWithId {
  id: string;
}

export abstract class BaseRepo {
  protected table: string;

  constructor(private connectionProvider: DynamoProvider, table: string) {
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
}