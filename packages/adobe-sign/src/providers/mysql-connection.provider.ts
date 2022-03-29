import { createPool, Pool } from "mysql2";
import { singleton } from "tsyringe";

@singleton()
export class MysqlConnectionProvider {
  private pool: Pool;

  resolve(): Pool {
    if (this.pool != undefined) {
      return this.pool;
    }

    return createPool({
      connectionLimit: parseInt(process.env.ADOBE_SIGN_DB_CONNECTION_LIMIT),
      host: process.env.ADOBE_SIGN_DB_HOST,
      user: process.env.ADOBE_SIGN_DB_USER,
      password: process.env.ADOBE_SIGN_DB_PASSWORD,
      database: process.env.ADOBE_SIGN_DB_DATABASE
    });
  }
}