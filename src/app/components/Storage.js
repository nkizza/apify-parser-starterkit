const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const __component = require("./__component");

class Storage extends __component {
    constructor(app, params) {
        super(app);
        this.#setParams(params);
    }

    #params;
    #setParams(params) {
        const defaults = {
            endpoint: null,
            region: null,
            bucket: null
        };
        this.#params = Object.assign(defaults, params);
    }

    #client;
    async getClient() {
        if(!this.#client) {
            const clientParams = {
                endpoint: this.#params.endpoint,
                region: this.#params.region
            };
            this.#client = new S3Client(clientParams);
        }
        return this.#client;
    }

    async put(path, content) {
        const putParams = {
                Bucket: this.#params.bucket,
                Key: path,
                Body: content
            },
            client = await this.getClient();
        try {
            return await client.send(new PutObjectCommand(putParams));
        } catch (err) {
            console.log("Error", err);
            return false;
        }
    }
}

module.exports = Storage