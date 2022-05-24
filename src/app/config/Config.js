const path = require("path");

// Dotenv load
require('dotenv').config({path: path.resolve(`${__dirname}/../../../.env`)});

// All configuration values.
class Config {

    verbose     = !!parseInt(process.env.VERBOSE) || false;
    tmpDir      = path.resolve(`${__dirname}/../../../tmp`);
    runtimeDir  = path.resolve(`${__dirname}/../../../runtime`);

    storage = {
        endpoint: "https://s3.eu-central-2.wasabisys.com",
        region: "eu-central-2",
        bucket: "autoru"
    };

    // Queue name as object key, parser class as required constant.
    // Used by QueueManager helper.
    queues = {
        autoru: require("../../parsers/autoru/Parser")
    };

    // Backend API url and settings.
    // Used by Backend helper.
    api = {
        baseUrl: "http://example.com/api",
    };

    // Proxy
    proxy = {
        urls: [
            "http://1294444:C7y8KuJ@193.143.1.193:45785",
            "http://1294444:C7y8KuJ@45.142.255.53:45785",
            "http://1294444:C7y8KuJ@192.144.18.31:45785",
            "http://1294444:C7y8KuJ@5.44.43.83:45785",
            "http://1294444:C7y8KuJ@37.44.198.9:45785",
            "http://1294444:C7y8KuJ@62.173.148.68:45785",
            "http://1294444:C7y8KuJ@78.153.155.96:45785",
            "http://1294444:C7y8KuJ@185.180.108.124:45785",
            "http://1294444:C7y8KuJ@185.239.50.251:45785",
            "http://1294444:C7y8KuJ@45.89.188.147:45785",
        ],
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
        navigation: { waitUntil: "domcontentloaded", timeout: 60000 },
        handlePageTimeoutSecs: 300,
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