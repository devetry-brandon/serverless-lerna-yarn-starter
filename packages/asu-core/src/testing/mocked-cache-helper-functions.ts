import { CacheService } from "../aws/services/cache.service";

export const valueNotCached = (cacheService: jest.Mocked<CacheService>) => {
    cacheService.getValue.mockImplementation(async (key: string, retrieveValue: () => Promise<string>): Promise<string> => {
        return await retrieveValue();
    });
};

export const valueCached = (cacheService: jest.Mocked<CacheService>, cachedValue: string) => {
    cacheService.getValue.mockResolvedValue(cachedValue);
};