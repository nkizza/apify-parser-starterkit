const Apify = require("apify");
const __component   = require("./__component");

class Proxy extends __component {

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
                proxyUrls: this.config.proxy.urls,
            });
        }
        return this.#configuration;
    }
}

module.exports = Proxy;