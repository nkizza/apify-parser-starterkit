const Bull = require("bull");
const path = require("path");

/**
 * PM2 application instance.
 */
(async () => {
    const _10min = 600000;
    const processor = path.resolve(`${__dirname}/queue/MayberunnerProcessor.js`);

    // Every once in a while we ping a queue manager to see if there's anything to run.
    // If one queue is running we do not run any other queue.
    // Since the execution of every queue is a lengthy process,
    // processor should be sandboxed.
    const runner = new Bull();
    runner.process(processor);

    // Slot queue runs when there's an empty slot
    const slotQueue = ["iaai-list", "copart-details", "iaai-details"];
    runner.add("mayberun", { names: slotQueue }, {
        repeat: {every: _10min},
        attempts: 2,
    });
})();