import "reflect-metadata";
import { CacheProvider } from '../../../src/aws/providers/cache.provider';
import { CacheService } from '../../../src/aws/services/cache.service';
import { Mock } from "../../../src/testing/mock-provider";
import * as redis from 'redis';
import { TimeToLive } from '../../../src/aws/enums/time-to-live';

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

            const mockCallback = jest.fn(async () => {
                return null;
            });

            // Act
            const result = await service.getValue(expectedKey, mockCallback);

            // Assert
            expect(result).toBe(expectedValue);
            expect(mockCallback).toHaveBeenCalledTimes(0);
        });

        it('should call given callback when cache fails to connect', async () => {
            // Arrange
            const { service, cacheClient } = setup();
            const expectedKey = 'key';
            const expectedValue = 'value';

            cacheClient.connect.mockImplementation(() => {
                throw 'connection timed out';
            });

            const mockCallback = jest.fn(async () => {
                return expectedValue;
            });

            // Act
            const result = await service.getValue(expectedKey, mockCallback);

            // Assert
            expect(result).toBe(expectedValue);
            expect(mockCallback).toHaveBeenCalled();
        });

        it('should call given callback when cache get returns null', async () => {
            // Arrange
            const { service, cacheClient } = setup();
            const expectedKey = 'key';
            const expectedValue = 'value';

            cacheClient.get.mockResolvedValue(null);

            const mockCallback = jest.fn(async () => {
                return expectedValue;
            });

            // Act
            const result = await service.getValue(expectedKey, mockCallback);

            // Assert
            expect(result).toBe(expectedValue);
            expect(mockCallback).toHaveBeenCalled();
        });

        it('should call given callback when cache get throws exception', async () => {
            // Arrange
            const { service, cacheClient } = setup();
            const expectedKey = 'key';
            const expectedValue = 'value';

            cacheClient.get.mockImplementation(() => {
                throw 'Failed to get value';
            });

            const mockCallback = jest.fn(async () => {
                return expectedValue;
            });

            // Act
            const result = await service.getValue(expectedKey, mockCallback);

            // Assert
            expect(result).toBe(expectedValue);
            expect(mockCallback).toHaveBeenCalled();
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
            expect(cacheClient.set).toHaveBeenCalledWith(expectedKey, expectedValue, 'EX', TimeToLive.OneHour);
        });

        it('should set value with given TimeToLive', async () => {
            // Arrange
            const { service, cacheClient } = setup();
            const expectedKey = 'key';
            const expectedValue = 'value';

            cacheClient.get.mockResolvedValue(null);

            // Act
            const result = await service.getValue(expectedKey, async () => {
                return expectedValue;
            }, TimeToLive.FiveMinutes);

            // Assert
            expect(cacheClient.set.mock.calls[0][3]).toBe(TimeToLive.FiveMinutes);
        });

        it('should still return value when cache set throws exception', async () => {
            // Arrange
            const { service, cacheClient } = setup();
            const expectedKey = 'key';
            const expectedValue = 'value';

            cacheClient.get.mockResolvedValue(null);
            cacheClient.set.mockImplementation(() => {
                throw 'Failed to set value';
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