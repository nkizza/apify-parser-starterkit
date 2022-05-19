const Config    = require("./config/Config");

const Backend   = require("./components/Backend");
const Cache     = require("./components/Cache");
const Helper    = require("./components/Helper");
const Proxy     = require("./components/Proxy");
const QueueManager = require("./components/QueueManager");
const Filesystem = require("./components/Filesystem");

/**
 * Aggregator of all helper classes to manage queues.
 */
class App {
    //<editor-fold desc="Components">
    #backend;
    #cache;
    #config;
    #helper;
    #proxy;
    #queueManager;
    #filesystem;

    get backend() {
        if(!this.#backend)
            this.#backend = new Backend(this);
        return this.#backend;
    }

    get cache() {
        if(!this.#cache)
            this.#cache = new Cache(this);
        return this.#cache;
    }

    get config() {
        if (!this.#config)
            this.#config = new Config();
        return this.#config;
    }

    get helper() {
        if (!this.#helper)
            this.#helper = new Helper(this);
        return this.#helper;
    }


    get proxy() {
        if (!this.#proxy)
            this.#proxy = new Proxy(this);
        return this.#proxy;
    }

    get queueManager() {
        if (!this.#queueManager)
            this.#queueManager = new QueueManager(this);
        return this.#queueManager;
    }

    get filesystem() {
        if (!this.#filesystem)
            this.#filesystem = new Filesystem(this);
        return this.#filesystem;
    }

    //</editor-fold>
}

module.exports = App;