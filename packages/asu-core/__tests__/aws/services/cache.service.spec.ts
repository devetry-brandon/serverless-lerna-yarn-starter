import { CacheService } from '../../../src/aws/services/cache.service';

describe('CacheService', () => {
    const setup = () => {
        const service = new CacheService();

        return { service };
    };

    describe('getValue', () => {
        it('should attempt to retrieve value from cache first', async () => {
            const { service } = setup();
            const expectedValue = 'fakeValue';

            const result = service.getValue('fakeKey', async () => {
                return expectedValue;
            });

            expect(result).toBe(expectedValue);
        });
    });
});