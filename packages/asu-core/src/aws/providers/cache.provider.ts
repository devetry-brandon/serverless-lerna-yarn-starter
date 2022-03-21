import * as redis from 'redis';

export class CacheProvider {
    public resolve(url: string) {
        return redis.createClient({url: url});
    }
}