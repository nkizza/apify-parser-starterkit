// Abstract class for all components.
class __component {
    #app;
    constructor(app) {
        this.#app = app;
    }

    get app() {
        return this.#app;
    }

    get config() {
        return this.#app.config;
    }
}

module.exports = __component;