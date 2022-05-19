const path = require("path");

// Dotenv load
require('dotenv').config({path: path.resolve(`${__dirname}/../../../.env`)});

// All configuration values.
class Config {

    verbose     = !!parseInt(process.env.VERBOSE) || false;
    tmpDir      = path.resolve(`${__dirname}/../../../tmp`);
    runtimeDir  = path.resolve(`${__dirname}/../../../runtime`);

    // Queue name as object key, parser class as required constant.
    // Used by QueueManager helper.
    queues = {

    };

    // Backend API url and settings.
    // Used by Backend manager.
    api = {
        baseUrl: "http://example.com/api",
    };

    // Proxy
    proxy = {
        urls: [],
    };

    // Puppeteer Crawler options
    puppeteer = {
        launch: {
            headless: !!parseInt(process.env.PUP_HEADLESS),
            stealth : !!parseInt(process.env.PUP_STEALTH),
        },
        browserPool: {
            maxOpenPagesPerInstance         : parseInt(process.env.PUP_MAXPAGES),
            retireInstanceAfterRequestCount : parseInt(process.env.PUP_RETIREAFTER)
        },
        autoscaledPool: {
            maxConcurrency: parseInt(process.env.CRAWL_THREADS) || 5,
        },
        navigation: { waitUntil: "networkidle0", timeout: 60000 }
    };

    // Basic crawler options
    basic = {
        autoscaledPool: {
            maxConcurrency: parseInt(process.env.CRAWL_THREADS_BASIC) || 5,
            maybeRunIntervalSecs: 3,
        },
    };

    // Crawler vars
    maxRequestRetries   = parseInt(process.env.CRAWL_RETRIES);
    maxRequestsPerCrawl = parseInt(process.env.CRAWL_MAX);
}

module.exports = Config;