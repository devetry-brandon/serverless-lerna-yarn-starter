import * as mysql from "mysql2/promise";
import { singleton } from "tsyringe";

@singleton()
export class MysqlConnectionProvider {
  private pool: mysql.Pool;

  resolve(): mysql.Pool {
    if (this.pool != undefined) {
      return this.pool;
    }

    return mysql.createPool({
      connectionLimit: parseInt(process.env.ADOBE_SIGN_DB_CONNECTION_LIMIT),
      host: process.env.ADOBE_SIGN_DB_HOST,
      user: process.env.ADOBE_SIGN_DB_USER,
      password: process.env.ADOBE_SIGN_DB_PASSWORD,
      database: process.env.ADOBE_SIGN_DB_DATABASE
    });
  }
}