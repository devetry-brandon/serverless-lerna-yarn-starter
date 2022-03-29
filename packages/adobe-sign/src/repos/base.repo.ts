import { Pool } from "mysql2";
import { MysqlConnectionProvider } from "../providers/mysql-connection.provider";

export abstract class BaseRepo {
  private conn: Pool;

  constructor(private connectionProvider: MysqlConnectionProvider) {}

  protected execute(query: string, params: string[] | Object): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        if (this.conn === undefined) {
          this.conn = this.connectionProvider.resolve();
        }
      }
      catch(error) {
        console.log(`BaseRepo.execute: Error while connecting to database.`)
        throw error;
      }
      
      try {
        this.conn.query(query, params, (error, results) => {
          if (error) {
            reject(error);
          }
  
          resolve(results);
        });
      }
      catch (error) {
        console.log(`BaseRepo.execute: Trouble executing sql. Sql: ${query}`);
        throw error;
      }
    });
  }
}