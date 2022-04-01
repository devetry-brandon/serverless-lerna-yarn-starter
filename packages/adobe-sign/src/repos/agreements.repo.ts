import { DynamoProvider } from "asu-core";
import { injectable } from "tsyringe";
import { Agreement } from "../models/adobe-sign/agreement";
import { BaseRepo } from "./base.repo";

@injectable()
export class AgreementsRepo extends BaseRepo<Agreement> {
  constructor(connectionProvider: DynamoProvider) {
    super(connectionProvider, 'agreements');
  }
}