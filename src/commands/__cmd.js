class __cmd {
    #app;
    constructor(app) {
        this.#app = app;
    }

    get app() {
        return this.#app;
    }

    commands = {};

    hello() {
        console.log("Hello! Please enter the desired command:");

        for(let prop in this.commands) {
            if(!this.commands.hasOwnProperty(prop)) continue;

            console.log('\x1b[1m%s\x1b[0m', prop);
            console.log('\x1b[2m%s\x1b[0m', this.commands[prop]);
        }
    }

    async run() {
        const args = process.argv.slice(2).filter(e => !!e);
        if(!args.length) {
            this.hello();
        } else {
            const action = args.shift();
            if(!this.commands.hasOwnProperty(action))
                throw "Invalid command";

            await this[action](args);
        }

        process.exit();
    }
}

module.exports = __cmd;