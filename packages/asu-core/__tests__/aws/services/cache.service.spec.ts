import { CacheProvider } from '../../../src/aws/providers/cache.provider';
import { CacheService } from '../../../src/aws/services/cache.service';
import { Mock } from "../../../src/testing/mock-provider";
import * as redis from 'redis';

describe('CacheService', () => {
    const setup = () => {
        const cacheProvider = Mock(new CacheProvider);
        const cacheClient = Mock(redis.createClient());
        const service = new CacheService(cacheProvider);

        cacheProvider.resolve.mockReturnValue(cacheClient);

        return { service, cacheClient, cacheProvider };
    };

    describe('getValue', () => {
        it('should return cached value for key', async () => {
            // Arrange
            const { service, cacheClient } = setup();
            const expectedKey = 'key';
            const expectedValue = 'value';

            cacheClient.get.mockResolvedValue(expectedValue);

            // Act
            const result = await service.getValue(expectedKey, async () => {
                return null;
            });

            // Assert
            expect(result).toBe(expectedValue);
        });

        it('should call given callback when cache fails to connect', async () => {
            // Arrange
            const { service, cacheClient } = setup();
            const expectedKey = 'key';
            const expectedValue = 'value';

            cacheClient.connect.mockImplementation(() => {
                throw 'connection timed out';
            });

            // Act
            const result = await service.getValue(expectedKey, async () => {
                return expectedValue;
            });

            // Assert
            expect(result).toBe(expectedValue);
        });

        it('should call given callback when cache get returns null', async () => {
            // Arrange
            const { service, cacheClient } = setup();
            const expectedKey = 'key';
            const expectedValue = 'value';

            cacheClient.get.mockResolvedValue(null);

            // Act
            const result = await service.getValue(expectedKey, async () => {
                return expectedValue;
            });

            // Assert
            expect(result).toBe(expectedValue);
        });

        it('should call given callback when cache get throws exception', async () => {
            // Arrange
            const { service, cacheClient } = setup();
            const expectedKey = 'key';
            const expectedValue = 'value';

            cacheClient.get.mockImplementation(() => {
                throw 'Failed to get value';
            });

            // Act
            const result = await service.getValue(expectedKey, async () => {
                return expectedValue;
            });

            // Assert
            expect(result).toBe(expectedValue);
        });

        it('should set value if key was not previously cached', async () => {
            // Arrange
            const { service, cacheClient } = setup();
            const expectedKey = 'key';
            const expectedValue = 'value';

            cacheClient.get.mockResolvedValue(null);

            // Act
            const result = await service.getValue(expectedKey, async () => {
                return expectedValue;
            });

            // Assert
            expect(result).toBe(expectedValue);
            expect(cacheClient.set.mock.calls[0][0]).toBe(expectedKey);
            expect(cacheClient.set.mock.calls[0][1]).toBe(expectedValue);
        });

        it('should still return value when cache set throws exception', async () => {
            // Arrange
            const { service, cacheClient } = setup();
            const expectedKey = 'key';
            const expectedValue = 'value';

            cacheClient.get.mockResolvedValue(null);
            cacheClient.set.mockImplementation(() => {
                throw 'Failed to get value';
            });

            // Act
            const result = await service.getValue(expectedKey, async () => {
                return expectedValue;
            });

            // Assert
            expect(result).toBe(expectedValue);
        });
    });
});