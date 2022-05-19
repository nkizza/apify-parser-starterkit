const __component   = require("./__component");
const axios         = require("axios");

// Helper to make calls to backend API.
class Backend extends __component {
    constructor(app) {
        super(app);
    }

    get config() {
        return this.app.config;
    }

    //<editor-fold desc="Basic get-post">
    get(endpoint, options = {}) {
        let url = this.#createUrl(endpoint);
        return axios.get(url, options);
    }

    post(endpoint, data, options) {
        let url = this.#createUrl(endpoint);
        return axios.post(url, data, options);
    }
    //</editor-fold>

    //<editor-fold desc="Url helpers">
    #createUrl(endpoint) {
        return `${this.config.api.baseUrl}/${endpoint}`;
    }
    //</editor-fold>
}

module.exports = Backend;