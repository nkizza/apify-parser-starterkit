const Apify = require("apify");
const App = require("../app/App");
const __cmd = require("./__cmd");

class Helper extends __cmd {
    constructor(app) {
        super(app);
    }

    commands = {
        info: "Queue(s) info",
        drop: "Drop queue(s) by name",
        status: "Queue(s) status by name",
        import: "Import URLs to queue",
        mayberun: "Run available queues",
    };

    async drop(names = []) {
        let queues = this.app.queueManager.queues;
        if(names.length)
            queues = queues.filter(name => names.includes(name));

        for(let i = 0; i < queues.length; i++) {
            let name = queues[i];

            const queue = await Apify.openRequestQueue(name);
            await queue.drop();
            console.log(`Dropped \x1b[1m${name}\x1b[0m`);
        }
    }

    async info(names = []) {
        let queues = this.app.queueManager.queues;
        if(names.length)
            queues = queues.filter(name => names.includes(name));

        for(let i = 0; i < queues.length; i++) {
            let name = queues[i];

            const queue = await Apify.openRequestQueue(name);
            console.log(`\x1b[1m${name}\x1b[0m`);
            console.log(await queue.getInfo());
        }
    }

    async status(names = []) {
        let queues = this.app.queueManager.queues;
        if(names.length)
            queues = queues.filter(name => names.includes(name));

        for(let i = 0; i < queues.length; i++) {
            let name = queues[i];

            let status = {
                locked  : await this.app.queueManager.isLocked(name),
                finished: await this.app.queueManager.isFinished(name),
            };
``
            console.log(`\x1b[1m${name}\x1b[0m`);
            console.log(status);
        }
    }

    async mayberun(names = []) {
        let queues = Object.keys(this.app.config.queues);
        if(names.length)
            queues = queues.filter(name => names.includes(name));

        await this.app.queueManager.mayberun(queues);
    }

    async import(args) {
        let name = args.shift();
        await this.app.queueManager.import(name, args);
    }

    async test(args) {
        console.log("Everything is tested");
    }
}

(async() => {
    const app = new App(),
        helper = new Helper(app);

    await helper.run();
})();