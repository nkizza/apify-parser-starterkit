const __component   = require("./__component");
const NodeCache     = require("node-cache");

/**
 * Caching Helper.
 */
class Cache extends __component {
    #cache;

    constructor(app) {
        super(app);
        this.#cache = new NodeCache();
    }

    // Set method proxy
    set(key, val, ttl = null) {
        this.#cache.set(key, val, ttl);
    }

    // Get method proxy
    get(key) {
        return this.#cache.get(key);
    }

    /**
     * Gets cached value or sets a new one if missing. Value can be callable.
     * @param {string} key
     * @param {function|any} val Value to set if
     * @param {integer|null} ttl Time to live, in seconds.
     */
    getOrSet(key, val, ttl = null) {
        let value = this.get(key);

        // If this value isn't presented in cache, we set a new value.
        if(value === undefined) {
            if(typeof(val) === "function")
                value = val();
            else value = val;

            this.set(key, value, ttl);
        }

        return value;
    }
}

module.exports = Cache;