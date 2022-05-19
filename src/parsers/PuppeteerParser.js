const Apify     = require("apify");
const __Parser  = require("./__Parser");

class PuppeteerParser extends __Parser {
    constructor(app) {
        super(app);
    }

    async gotoFunction({ request, page }) {
        return Apify.utils.puppeteer.gotoExtended(page, request, this.config.puppeteer.navigation);
    }

    async handlePageFunction({ request, page }) {
        this.info(`Processing url ${request.url}...`);
        this.onRequestStart(request);
    }

    async handleErrorFunction({request, response, error, proxyInfo}) {
        this.error(error);
    }

    async run() {
        const requestQueue      = await this.getMainQueue(),
            proxyConfiguration  = await this.proxy.getConfiguration();

        const crawlerOptions = {
            requestQueue,
            proxyConfiguration,
            maxRequestRetries   : this.config.maxRequestRetries,
            maxRequestsPerCrawl : this.config.maxRequestsPerCrawl,

            // Puppeteer settings
            launchPuppeteerOptions  : this.config.puppeteer.launch,
            autoscaledPoolOptions   : this.config.puppeteer.autoscaledPool,
            puppeteerPoolOptions    : this.config.puppeteer.browserPool,

            gotoFunction                : this.gotoFunction.bind(this),
            handlePageFunction          : this.handlePageFunction.bind(this),
            handleFailedRequestFunction : this.handleErrorFunction.bind(this)
        };

        const crawler = new Apify.PuppeteerCrawler(crawlerOptions);
        await crawler.run();
    }
}

module.exports = PuppeteerParser;