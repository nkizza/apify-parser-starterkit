const PuppeteerParser = require("../PuppeteerParser");

class Parser extends PuppeteerParser {

    async handlePageFunction({ request, page }) {
        this.info(`Processing url ${request.url}...`);
        this.onRequestStart(request);
    }

}