import { DynamoProvider } from "asu-core";
import { injectable } from "tsyringe";
import { BaseRepo } from "./base.repo";

@injectable()
export class AgreementsRepo extends BaseRepo {
  constructor(connectionProvider: DynamoProvider) {
    super(connectionProvider, 'agreements');
  }
}