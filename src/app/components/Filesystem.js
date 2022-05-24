const __component   = require("./__component");
const fs            = require("fs/promises");
const fsStatic      = require("fs");
const pathHelper    = require("path");

/**
 * Filesystem Helper.
 */
class Filesystem extends __component {

    async assureDir(path, mode = 0o777) {
        path = pathHelper.resolve(path);

        if(!fsStatic.existsSync(path)) {
            await fs.mkdir(path, {recursive: true, mode});
        }
    }

    async assureFile(path, mode = 0o644) {
        if(!this.exists(path)) {
            // Create new empty file
            await this.write(path, "");
            await fs.chmod(path, mode);
        }
    }

    async touch(path) {
        const time = new Date();
        await this.assureFile(path);
        await fs.utimes(path, time, time);
    }

    /**
     * Watches a directory for specific file events.
     * Returns false if no events occur within the timeout,
     * otherwise returns first matching filename.
     * @param {string} path Path (dirname or filename) to watch.
     * @param {object} options Watch options.
     * @returns {Promise<string|boolean>}
     */
    async watch(path, options) {
        let defaults = {
            // watch for 30 secs
            timeout: 30000,
            // Events to watch
            events: ['change', 'rename'],
            // Watch specific files. Set pattern or false.
            matchFilename: false,
        };
        options = {...defaults, ...options};

        // Abort on timeout
        const ac = new AbortController();
        const { signal } = ac;
        setTimeout(() => ac.abort(), options.timeout);

        try {
           const watcher = fs.watch(path, { signal });
           for await (const event of watcher) {
                // Let's see if filename matches given option
                let isValidFile = true;
                if(options.matchFilename)
                    isValidFile = options.matchFilename.test(event.filename);
                let isValidEvent = options.events.includes(event.eventType);
                if(isValidFile && isValidEvent) {
                    ac.abort();
                    return pathHelper.resolve(`${path}/${event.filename}`);
                }
            }
        } catch (err) {
            // If aborted on timeout, let's return false (no matching files were touched in given timespan)
            if (err.name === 'AbortError')
                return false;

            throw err;
        }
    }

    exists(path) {
        return fsStatic.existsSync(path);
    }

    readStream(path) {
        return fsStatic.createReadStream(path);
    }

    writeStream(path) {
        return fsStatic.open(path, "a+");
    }

    async stat(path, key = null) {
        let stat = await fs.stat(path);
        if(key)
            return stat[key];
        return stat;
    }

    read(path, encoding = "utf8" ) {
        return fs.readFile(path, { encoding });
    }

    async write(path, data, encoding = "utf8") {
        await fs.writeFile(path, data, encoding);
    }

    async append(path, data, encoding = "utf8") {
        await fs.appendFile(path, data);
    }

    async writeBinary(path, data) {
        let buffer = Buffer.from(data, "binary");
        await fs.writeFile(path, buffer);
    }

    async unlink(path) {
        await fs.unlink(path);
    }

    async unlinkDir(path) {
        await fs.rmdir(path);
    }

    async list(dir, fullPath = true) {
        dir = path.resolve(dir);

        let files = await fs.readdir(dir);
        return files.map(file => fullPath ? `${dir}/${file}` : file);
    }
}

module.exports = Filesystem;