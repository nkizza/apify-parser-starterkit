const Apify = require("apify");
const __component   = require("./__component");

class Proxy extends __component {
    proxyCacheKey = "application-proxy";
    proxyCacheLife = 3600;

    constructor(app) {
        super(app);
    }

    get cache() {
        return this.app.cache;
    }

    get backend() {
        return this.app.backend;
    }

    #configuration;
    async getConfiguration() {
        if(!this.#configuration) {
            this.#configuration = await Apify.createProxyConfiguration({
                proxyUrls: await this.getList(),
            });
        }
        return this.#configuration;
    }

    async getList() {
        let list = this.cache.get(this.proxyCacheKey);
        if(list === undefined) {
            list = await this.backend.proxy();
            this.cache.set(this.proxyCacheKey, list, this.proxyCacheLife);
        }
        return list;
    }
}

module.exports = Proxy;