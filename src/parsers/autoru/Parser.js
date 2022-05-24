const Apify = require("apify");
const PuppeteerParser = require("../PuppeteerParser");
const Model = require("../../models/autoru/Csv");
const axios = require("axios");

class Parser extends PuppeteerParser {
    queueName = "autoru";

    #headers = {};
    #models = [];

    #model;
    get model() {
        if(!this.#model)
            this.#model = new Model(this.app);
        return this.#model;
    }

    async gotoFunction({ request, page }) {

        // Intercepting request to get AJAX headers
        page.setRequestInterception(true);
        page.on("request", interceptedRequest => {
            if(this.isAjax(interceptedRequest)) {
                if(!Object.keys(this.#headers).length) {
                    const interceptedHeaders = interceptedRequest.headers(),
                        names = ["x-client-app-version", "x-csrf-token", "x-page-request-id", "x-requested-with", "x-retpath-y"];
                    for(const name of names) {
                        this.#headers[name] = interceptedHeaders[name];
                    }
                }
            }
            interceptedRequest.continue();
        });

        return super.gotoFunction({ request, page });
    }

    async handlePageFunction({ request, page }) {
        await super.handlePageFunction({request, page});
        try {
            await page.waitForRequest("https://auto.ru/-/ajax");
        } catch(e) {
            // Let's assume this request was done before and just continue
        }

        // Accept the cookie policy
        const acceptCookieButton = await page.$("div#confirm-button");
        if(acceptCookieButton) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: "networkidle0" }),
                page.click("div#confirm-button")
            ]);
        }

        // Let's assume that we have each page open on brand page. Our task is to
        // list all models in select and send them to
        // POST https://auto.ru/-/ajax/desktop/getBreadcrumbsWithFilters/
        // endpoint.

        // List all models of this brand
        const brand = await this.getBrandValue(page),
            query = {catalog_filter:[{mark: brand}], section:"all", category:"cars"};

        const json = await this.fetchBreadcrumbs(page, query);
        if(!json)
            throw "Retry";
        const modelList = this.model.mapModels(json);

        // Model list is an array of model IDs. Let's fetch the generations for them all.
        for(const modelID of modelList) {
            const generationQuery = {catalog_filter:[{mark: brand, model: modelID}], section:"all", category:"cars"},
                data = await this.fetchBreadcrumbs(page, generationQuery);
            if(!data)
                continue;
            await this.processGenerations(data);
            await Apify.utils.sleep(1000);
        }
    }

    isAjax(r) {
        return r.url().includes("-/ajax");
    }

    isBreadcrumbs(r) {
        return r.url().includes("ajax/desktop/getBreadcrumbsWithFilters");
    }

    async getBrandValue(page) {
        const markInput = await page.$("input[name=mark]");
        return await page.evaluate(el => el.value, markInput);
    }

    async fetchBreadcrumbs(page, query) {
        const headers = this.#headers;
        headers["content-type"] = "application/json";

        console.log(`Fetching response for ${JSON.stringify(query)}...`);
        const responseText = await page.evaluate(async ( {headers, query} ) => {
            const response = await fetch("/-/ajax/desktop/getBreadcrumbsWithFilters/", {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers,
                redirect: 'follow',
                body: JSON.stringify(query)
            });
            return await response.text();
        }, { headers, query });

        try {
            return JSON.parse(responseText);
        } catch(e) {
            console.log("Error occured on response:");
            console.log(responseText.slice(0, 500) + "...");
            return false;
        }
    }

    async loadImage(url) {
        if(url.slice(0,4) !== "http")
            url = `http:${url}`;

        const path = url.replace("http://avatars.mds.yandex.net/get-verba/", "");
        const response = await axios.get(url, {responseType: "arraybuffer"}),
            buffer = Buffer.from(response.data, "binary");

        if(await this.app.storage.put(path, buffer)) {
            return `https://s3.eu-central-2.wasabisys.com/autoru/${path}`;
        }

        return false;
    }

    async processGenerations(json) {
        const rows = this.model.map(json);
        const strings = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i],
                url = row.image;
            const image = await this.loadImage(url);
            if(image) {
                row.image = image;
                strings.push(`"${Object.values(row).join("\",\"")}"`);
            }
        }

        const csv   = `${this.app.config.tmpDir}/export.csv`;
        await this.app.filesystem.append(csv, `${strings.join("\n")}\n`);
    }
}

module.exports = Parser