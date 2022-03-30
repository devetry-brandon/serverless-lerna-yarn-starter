import "reflect-metadata";
import { Mock } from "asu-core";
import { MysqlConnectionProvider } from "../../src/providers/mysql-connection.provider";
import { TemplatesRepo } from "../../src/repos/templates.repo";
import { getMockDB } from "../mocks/mock-db-connection";

describe('TemplatesRepo', () => {
  function setup() {
    const connectionProvider = Mock(new MysqlConnectionProvider());
    const dbConnection = getMockDB();
    const repo = new TemplatesRepo(connectionProvider);

    connectionProvider.resolve.mockReturnValue(dbConnection);

    return { repo, connection: dbConnection }
  }

  /**
   * BaseRepo is an abstract class so we are testing it through
   * the TemplatesRepo.
   */
  describe('query', () => {
    it('should throw error when query result is not an array', async () => {
      // Arrange
      const { repo, connection } = setup();
      const expectedId = 143;

      connection.query.mockResolvedValue([null] as any);

      // Act / Assert
      expect(repo.getTemplateById(expectedId)).rejects.toMatchObject(new Error(`Result of query is not an array.`));
    });
  });
});