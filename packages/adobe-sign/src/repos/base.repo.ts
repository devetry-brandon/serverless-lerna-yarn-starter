import { Pool } from "mysql2/promise";
import { MysqlConnectionProvider } from "../providers/mysql-connection.provider";

export abstract class BaseRepo {
  constructor(private connectionProvider: MysqlConnectionProvider) {}

  protected getConnection(): Pool {
    return this.connectionProvider.resolve();
  }

  protected async query<T>(query: string, params: string[] | Object): Promise<T[]> {
    const conn = this.getConnection();

    const results = await conn.query(query, params);

    if (!Array.isArray(results)) {
      throw new Error(`Result of query is not an array.`);
    }

    return results as unknown as T[];
  }
}