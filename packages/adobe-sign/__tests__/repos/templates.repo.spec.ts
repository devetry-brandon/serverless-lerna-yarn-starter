import "reflect-metadata";
import { Mock, NotFoundError } from "asu-core";
import { MysqlConnectionProvider } from "../../src/providers/mysql-connection.provider";
import { TemplatesRepo } from "../../src/repos/templates.repo";
import { getMockDB } from "../mocks/mock-db-connection";
import { isExportDeclaration } from "typescript";
import { Template } from "../../src/models/template";

describe('TemplatesRepo', () => {
  function setup() {
    const connectionProvider = Mock(new MysqlConnectionProvider());
    const dbConnection = getMockDB();
    const repo = new TemplatesRepo(connectionProvider);

    connectionProvider.resolve.mockReturnValue(dbConnection);

    return { repo, connection: dbConnection }
  }

  describe('getTemplateById', () => {
    it('should throw NotFoundError when no templates are returned', async () => {
      // Arrange
      const { repo, connection } = setup();
      const expectedId = 143;

      connection.query.mockResolvedValue([[]] as any);

      // Act / Assert
      expect(repo.getTemplateById(expectedId)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should call database with given id and return first found template', async () => {
      // Arrange
      const { repo, connection } = setup();
      const expectedId = 143;
      const expectedTemplate = new Template({
        id: expectedId
      });

      connection.query.mockResolvedValue([[expectedTemplate, {}]] as any);

      const result = await repo.getTemplateById(expectedId);

      // Act / Assert
      expect(connection.query).toBeCalledWith(expect.any(String), [expectedId]);
      expect(result).toMatchObject(expectedTemplate);
    });
  });

  describe('getTemplateByExternalId', () => {
    it('should throw NotFoundError when no templates are returned', async () => {
      // Arrange
      const { repo, connection } = setup();
      const expectedId = "AK3Kak(18j32j";

      connection.query.mockResolvedValue([[]] as any);

      // Act / Assert
      expect(repo.getTemplateByExternalId(expectedId)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should call database with given id and return first found template', async () => {
      // Arrange
      const { repo, connection } = setup();
      const expectedId = "AK3Kak(18j32j";
      const expectedTemplate = new Template({
        adobeSignId: expectedId
      });

      connection.query.mockResolvedValue([[expectedTemplate, {}]] as any);

      const result = await repo.getTemplateByExternalId(expectedId);

      // Act / Assert
      expect(connection.query).toBeCalledWith(expect.any(String), [expectedId]);
      expect(result).toMatchObject(expectedTemplate);
    });
  });
});