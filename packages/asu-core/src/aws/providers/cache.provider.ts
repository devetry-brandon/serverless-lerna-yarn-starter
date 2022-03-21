import * as redis from 'redis';
import { injectable } from 'tsyringe';

@injectable()
export class CacheProvider {
    public resolve(url: string) {
        return redis.createClient({url: url});
    }
}