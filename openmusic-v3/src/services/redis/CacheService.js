const redis = require('redis');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_SERVER,
    });

    this.client.on('error', (error) => {
      console.error(error);
    });
  }

  set(key, value, expirationInSecond = 3600) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', expirationInSecond, (error, ok) => {
        if (error) {
          return reject(error);
        }

        return resolve(ok);
      });
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, reply) => {
        if (error) {
          return reject(error);
        }

        if (reply === null) {
          return reject(new Error('Cache not found'));
        }

        return resolve(reply.toString());
      });
    });
  }

  delete(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, count) => {
        if (error) {
          return reject(error);
        }

        return resolve(count);
      });
    });
  }
}

module.exports = CacheService;
