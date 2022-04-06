import "reflect-metadata";
import { TimeService } from "../../../src/asu-core";

describe('TimeService', () => {
  describe('currentTimestamp', () => {
    it('should return current timestamp', () => {
      const service = new TimeService();
      const timestamp = Date.now();
      expect(service.currentTimestamp()).toBeGreaterThanOrEqual(timestamp);
    });
  });
});