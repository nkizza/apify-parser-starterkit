const __component   = require("./__component");

/**
 * Miscellaneous helper functions.
 */
class Helper extends __component {
    constructor(app) {
        super(app);
    }

    randomString(length = 10) {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);
    }

    /**
     * @param min
     * @param max
     * @returns {number}
     */
    randomInt(min = 0, max = 10) {
        let _diff = max - min;
        return Math.round( min + _diff * Math.random() );
    }

    /**
     * @param {array} array
     */
    randomArrayValue(array) {
        let _rand = Math.min(array.length, Math.floor(Math.random() * array.length));
        return array[_rand];
    }

    /**
     * Returns a value from object by dot-separated key (val1.val2.val3 etc).
     * Returns default value if key is missing.
     * @param object
     * @param key
     * @param def
     */
    getValue(object, key, def = null) {
        let parts = key.split("."),
            currentVal = object;

        for(let i = 0; i < parts.length; i++) {
            let part = parts[i]

            if(!currentVal)
                return def

            if(typeof currentVal === "object" && !currentVal.hasOwnProperty(part))
                return def

            currentVal = currentVal[part]
        }

        return currentVal;
    }

}

module.exports = Helper;