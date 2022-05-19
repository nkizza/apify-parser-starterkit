const Apify = require("apify");
const __Parser = require("./__Parser");

/**
 * Basic queue parser.
 */
class BasicParser extends __Parser {
    constructor(app) {
        super(app);
    }

    async processRequest(request) {
        this.info(`Processing url ${request.url}...`);
        this.onRequestStart(request);
    }

    async run() {
        const requestQueue = await this.getMainQueue();

        const crawler = new Apify.BasicCrawler({
            requestQueue,
            maxRequestRetries   : this.config.maxRequestRetries,
            maxRequestsPerCrawl : this.config.maxRequestsPerCrawl,

            autoscaledPoolOptions: this.config.basic.autoscaledPool,

            handleRequestFunction: async ({ request }) => {
                await this.processRequest(request);
            },

            // This function is called if the page processing failed more than maxRequestRetries+1 times.
            // Basic crawler does not have "response" parameter in handlefailed function.
            handleFailedRequestFunction: async ({ request , error, proxyInfo}) => {
                // await this.backend.logError(request, null, error);
            },
        });

        await crawler.run();
    }
}

module.exports = BasicParser