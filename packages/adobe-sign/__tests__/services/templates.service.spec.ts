import "reflect-metadata";
import { Mock } from "asu-core";
import { Template } from "../../src/models/asu/template";
import { TemplatesRepo } from "../../src/repos/templates.repo";
import { TemplatesService } from "../../src/services/templates.service";

describe('TemplateService', () => {
  function setup() {
    const templatesRepo = Mock(new TemplatesRepo(null));
    const service = new TemplatesService(templatesRepo);

    return { service, templatesRepo };
  }

  describe('getTemplate', () => {
    it('should call TemplatesRepo with the given id', async () => {
      // Arrange
      const { service, templatesRepo } = setup();
      const expectedTemplateId = "143";
      let expectedTemplate = new Template({
        adobeSignId: expectedTemplateId,
        name: "I-9"
      });

      templatesRepo.getTemplateById.mockResolvedValue(expectedTemplate);
      
      // Act
      const result = await service.getTemplate(expectedTemplateId);

      // Assert
      expect(templatesRepo.getTemplateById).toBeCalledWith(expectedTemplateId);
      expect(result).toEqual(expectedTemplate);
    });
  });

  describe('putTemplate', () => {
    it('should call TemplatesRepo with the given template', async () => {
      // Arrange
      const { service, templatesRepo } = setup();
      let expectedTemplate = new Template({
        name: "I-9",
        adobeSignId: "AJ2"
      });

      templatesRepo.put.mockResolvedValue(expectedTemplate);
      
      // Act
      const result = await service.putTemplate(expectedTemplate);

      // Assert
      expect(templatesRepo.put).toBeCalledWith(expectedTemplate);
      expect(result).toEqual(expectedTemplate);
    });
  });
});