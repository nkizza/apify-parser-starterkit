const Apify = require("apify");

/**
 * Generic abstract class for each parser.
 */
class __Parser {
    // Parser queue name
    queueName;

    // Shared autoscaled pool
    autoscaledPool;

    // Whether to be verbose or quiet on run
    verbose;

    //<editor-fold desc="Constructor and getters">
    #app;
    constructor(app) {
        this.#app = app;
        this.verbose = this.#app.config.verbose;
    }

    get app() {
        return this.#app;
    }

    get config() {
        return this.#app.config;
    }

    get proxy() {
        return this.#app.proxy;
    }

    //</editor-fold>

    //<editor-fold desc="Event handlers">

    /**
     * On start of each request, touch queue lock.
     */
    onRequestStart(request) {
        this.app.queueManager.lock(this.queueName);
    }
    //</editor-fold>

    //<editor-fold desc="Helpers">

    // Info console logger.
    info(text, force = false) {
        if(!force && !this.verbose)
            return;

        let date = `\x1b[1m${(new Date).toLocaleString()}\x1b[0m`,
            caller = `\x1b[35m${this.constructor.name}\x1b[0m`;
            console.log(date, caller, text);
    }

    // Error console logger.
    error(text) {
        text `\x1b[36m${text}\x1b[0m`;
        this.info(text, true);
    }

    #queue;
    // Main queue getter.
    async getMainQueue() {
        if(!this.#queue) {
            this.#queue = await this.getQueue(this.queueName);
        }
        return this.#queue;
    }

    // Any queue getter.
    async getQueue(name) {
        return await Apify.openRequestQueue(name);
    }
    //</editor-fold>
}

module.exports = __Parser;