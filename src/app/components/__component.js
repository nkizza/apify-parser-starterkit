// Abstract class for all components.
class __component {
    #app;
    constructor(app) {
        this.#app = app;
    }

    get app() {
        return this.#app;
    }
}

module.exports = __component;