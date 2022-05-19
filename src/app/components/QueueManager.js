const __component   = require("./__component");
const Apify         = require("apify");

// Queue manager. Starts queues, keeps track on started queues
// Or locks a queue (meaning it's running).
// Main concern about running queues is getting false positive whether the queue is running.
// We need to know when it's NOT running in background to be able to start it.
// Each time the queue is started we create a lock file, each time a request
// is processed we update this lock file.
// If the queue is finished, we delete this lock.
// If the lock file mtime was more than 5 minutes ago, we consider it not running.

class QueueManager extends __component {
    constructor(app) {
        super(app);
        this.filesystem.assureDir(this.lockDir);
    }

    get config() {
        return this.app.config;
    }

    get filesystem() {
        return this.app.filesystem;
    }

    get lockDir() {
        return `${this.config.runtimeDir}/lock`;
    }

    //<editor-fold desc="Queue config and checks">
    #parsers = {
        "iaai-reader"   : require("../../parsers/iaai/Reader"),
        "iaai-list"     : require("../../parsers/iaai/List"),
        "copart-list"   : require("../../parsers/copart/List"),
        "iaai-details"  : require("../../parsers/iaai/Details"),
        "copart-details": require("../../parsers/copart/Details"),
    };

    get queues() {
        return Object.keys(this.#parsers);
    }

    isValidQueue(name) {
        return this.#parsers.hasOwnProperty(name);
    }

    getParser(name) {
        if(!this.isValidQueue(name))
            throw "Invalid queue name";

        return new this.#parsers[name](this.app);
    }

    //</editor-fold>

    //<editor-fold desc="Shared pools">
    #autoscaledPool;
    get autoscaledPool() {
        if(!this.#autoscaledPool) {
            this.#autoscaledPool = new Apify.AutoscaledPool(this.config.autoscaledPoolOptions);
        }

        return this.#autoscaledPool;
    }
    //</editor-fold>

    //<editor-fold desc="Queue runner">

    // Starts first available queue from the list if no other queue is running.
    // Queue is considered available if it's not running and has tasks.
    async mayberun(names = null) {
        // Queue may run if there's no other queues running (i.e. all lock files are either stale or released).
        let queues = this.queues;
        for (const name of queues) {
            if(await this.isLocked(name)) {
                let verb = process.env.VERBOSE || false;
                if(verb)
                    console.log(`Queue ${name} is running (no other queues can start when at least one is running)`);

                return;
            }
        }

        // We have a slot to run a queue. Let's filter out which queues can run.
        if(names)
            queues = queues.filter(name => names.includes(name));

        for(const name of queues) {
            let canRun = await this.canRun(name);
            if(!canRun)
                continue;

            await this.run(name);
            break;
        }
    }

    // Runs specific queue
    async run(name) {
        if(!this.isValidQueue(name))
            throw `${name} is not valid queue name`;

        await this.lock(name);
        await this.getParser(name).run();
        await this.free(name);
    }

    // Checks if queue can run right now
    async canRun(name) {
        if(!this.isValidQueue(name))
            throw `${name} is not valid queue name`;

        let isLocked = await this.isLocked(name),
            isFinished = await this.isFinished(name);
        return !isLocked && !isFinished;
    }
    //</editor-fold>

    //<editor-fold desc="Queue Lock">

    lockLife = 300000; // 5 minutes

    // Whether queue is locked
    async isLocked(name) {
        // If doesn't exist, queue is not locked
        let lockPath = this.#lockPath(name);
        if(!this.filesystem.exists(lockPath))
            return false;

        // If was modified more than 5 minutes ago, queue is not locked
        let mtimeMs = await this.filesystem.stat(lockPath, 'mtimeMs'),
            time    = Date.now();

        if((time - mtimeMs) >= this.lockLife)
            return false;

        return true;
    }

    // Whether queue is finished (has no new tasks)
    async isFinished(name) {
        let queue = await Apify.openRequestQueue(name);
        return await queue.isFinished();
    }

    // Lock queue (on start and on each request).
    async lock(name) {
        let path = this.#lockPath(name);
        await this.filesystem.touch(path);
    }

    // Free queue
    async free(name) {
        let path = this.#lockPath(name);
        await this.filesystem.unlink(path);
    }

    // Returns path for lock file.
    #lockPath(name) {
        return `${this.lockDir}/${name}.lock`;
    }
    //</editor-fold>

    //<editor-fold desc="Helpers">

    /**
     * Import urls to a queue.
     * @param {string} name Queue name.
     * @param {string|array} urls An array of imported urls.
     * @param {bool} unique Whether to import urls with unique keys (to allow one link to be parsed several times).
     * @returns {Promise<void>}
     */
    async import(name, urls, unique = false) {
        // Cast urls to array
        urls = [].concat(urls);

        if(!this.isValidQueue(name))
            throw "Invalid queue name";

        let queue = await Apify.openRequestQueue(name);
        for (const url of urls) {
            let _requestLike = {url};
            if(unique)
                _requestLike["uniqueKey"] = this.app.helper.randomString();
            await queue.addRequest(_requestLike);
        }
    }

    //</editor-fold>
}

module.exports = QueueManager;