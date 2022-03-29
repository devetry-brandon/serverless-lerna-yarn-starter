/**
 * You cannot create an instance of an abstract class like BaseRepo, so the
 * functionality of the BaseRepo class is tested here through the TemplatesRepo.
 */

import "reflect-metadata";
import { Mock } from "asu-core";
import { MysqlConnectionProvider } from "../../src/providers/mysql-connection.provider";
import { TemplatesRepo } from "../../src/repos/templates.repo";
import { getMockDB } from "../mocks/mock-db-connection";

describe('BaseRepo', () => {
  function setup() {
    const connProvider = Mock(new MysqlConnectionProvider());
    const repo = new TemplatesRepo(connProvider);

    return { repo, connProvider };
  }

  describe('execute', () => {
    it('should throw an error when unable to make a connection to the DB', async () => {
      // Arrange
      const { repo, connProvider } = setup();
      const expectedErrorMessage = "CONNECTIONG ERROR";
      const templateId = 1;

      connProvider.resolve.mockImplementation(() => { throw expectedErrorMessage; });

      // Act / Assert
      expect(repo.getTemplateById(templateId)).rejects.toMatch(expectedErrorMessage);
    });

    it('should throw an error when sql execution throws', async () => {
      // Arrange
      const { repo, connProvider } = setup();
      const expectedErrorMessage = "CONNECTIONG ERROR";
      const templateId = 1;
      const mockConnection = getMockDB();

      connProvider.resolve.mockReturnValue(mockConnection);

      mockConnection.execute.mockImplementation(() => { throw expectedErrorMessage; });

      // Act / Assert
      expect(repo.getTemplateById(templateId)).rejects.toMatch(expectedErrorMessage);
    });

    it('should throw an error when sql returns error', async () => {
      // Arrange
      const { repo, connProvider } = setup();
      const expectedErrorMessage = "CONNECTIONG ERROR";
      const templateId = 1;
      const mockConnection = getMockDB();

      connProvider.resolve.mockReturnValue(mockConnection);

      mockConnection.execute.mockImplementation(() => { throw expectedErrorMessage; });

      // Act / Assert
      expect(repo.getTemplateById(templateId)).rejects.toMatch(expectedErrorMessage);
    });
  });
});