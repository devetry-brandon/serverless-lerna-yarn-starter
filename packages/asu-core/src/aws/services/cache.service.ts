import * as redis from 'redis';

export class CacheService {
    public async getValue(key: string, retrieveValue: () => Promise<string>): Promise<string> {
        console.log("top of cache service get value");
        let client = null;
        try {
            client = redis.createClient({ url: "redis://adobesigncache.dcp1ay.0001.use1.cache.amazonaws.com:6379"});
            await client.connect();
        }
        catch (error) {
            console.log(`CacheService.getValue: Failed to connect to cache. Error: ${error}`);
            client = null;
        }

        if (client !== null) {
            try {
                const cachedValue = await client.get(key);
                if (cachedValue !== undefined) {
                    return cachedValue;
                }
            }
            catch (error) {
                console.log(`CacheService.getValue: Failed to retieve value for key: ${key}. Error: ${error}`);
            }
        }

        const nonCachedValue = await retrieveValue();

        if (client !== null) {
            try {
                await client.set(key, nonCachedValue);
            }
            catch (error) {
                console.log(`CacheService.getValue: Failed to set value for key: ${key}. Error: ${error}`);
            }
        }

        return nonCachedValue;
    }
}