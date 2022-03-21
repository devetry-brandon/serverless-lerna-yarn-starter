import { TimeToLive } from '../enums/time-to-live';
import { CacheProvider } from '../providers/cache.provider';

export class CacheService {
    constructor(private cacheProvider: CacheProvider) {}

    public async getValue(key: string, retrieveValue: () => Promise<string>, timeToLive?: TimeToLive): Promise<string> {
        let client = null;
        try {
            // TODO: Get url from env variable which will get it from Stack output
            client = this.cacheProvider.resolve("redis://adobesigncache.dcp1ay.0001.use1.cache.amazonaws.com:6379")
            await client.connect();
        }
        catch (error) {
            console.log(`CacheService.getValue: Failed to connect to cache. Error: ${error}`);
            client = null;
        }

        if (client !== null) {
            try {
                const cachedValue = await client.get(key);
                if (cachedValue !== null) {
                    return cachedValue;
                }
            }
            catch (error) {
                console.log(`CacheService.getValue: Failed to retieve value for key: ${key}. Error: ${error}`);
            }
        }

        const nonCachedValue = await retrieveValue();

        if (nonCachedValue !== null && client !== null) {
            try {
                await client.set(key, nonCachedValue, 'EX', timeToLive || TimeToLive.OneHour);
            }
            catch (error) {
                console.log(`CacheService.getValue: Failed to set value for key: ${key}. Error: ${error}`);
            }
        }

        return nonCachedValue;
    }
}