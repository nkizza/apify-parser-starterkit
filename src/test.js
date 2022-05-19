const App       = require("./app/App");
const Puppeteer = require("puppeteer");

(async() => {
    const app = new App;

    const slotQueue = ["iaai-list", "copart-details", "iaai-details"];
    await app.queueManager.mayberun(slotQueue);
})();

