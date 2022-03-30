import { injectable } from "tsyringe";
import { MysqlConnectionProvider } from "../providers/mysql-connection.provider";
import { BaseRepo } from "./base.repo";

@injectable()
export class AgreementsRepo extends BaseRepo {
  constructor(connectionProvider: MysqlConnectionProvider) {
    super(connectionProvider);
  }
}