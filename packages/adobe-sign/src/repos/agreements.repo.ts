import { DynamoProvider, NotFoundError } from "asu-core";
import { injectable } from "tsyringe";
import { AgreementStatus } from "../enums/agreement-status";
import { Agreement } from "../models/asu/agreement";
import { BaseRepo } from "./base.repo";

@injectable()
export class AgreementsRepo extends BaseRepo<Agreement> {
  constructor(connectionProvider: DynamoProvider) {
    super(connectionProvider, 'agreements', 'adobeSignId');
  }

  async getAgreementById(id: string): Promise<Agreement> {
    const result = await this.getById(id);
    return new Agreement(result);
  }

  async getAgreementsForUserWithStatus(asuriteId: string, status: AgreementStatus): Promise<Agreement[]> {
    const conn = this.connectionProvider.resolve();

    const result = await conn.query({
      TableName: this.table,
      IndexName: 'asuriteId-status-index',
      KeyConditionExpression: 'asuriteId = :asuriteId and status = :status',
      ExpressionAttributeValues: {
        ':asuriteId': asuriteId,
        ':status': status
      }
    }).promise();

    return result.Items.map(x => new Agreement(x));
  }
}