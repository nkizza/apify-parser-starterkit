const puppeteer = require("puppeteer");
const App = require("./app/App");
const Model = require("./models/autoru/Csv");
const axios = require("axios");

(async() => {
    const app = new App(),
        model = new Model(app);

    const url = "http://avatars.mds.yandex.net/get-verba/216201/2a000001663a3b785ddfaeab392ed78d1e6c/auto_main",
        path = "216201/2a000001663a3b785ddfaeab392ed78d1e6c/auto_main.jpg",
        response = await axios.get(url, {responseType: "arraybuffer"}),
        buffer = Buffer.from(response.data, "binary");

    await app.storage.put(path, buffer);

    // const json = JSON.parse(await app.filesystem.read(`${__dirname}/example/response.json`));
    // const rows = model.map(json);
    // const strings = [];
    //
    // for (let i = 0; i < rows.length; i++) {
    //     const row = rows[i],
    //         url     = row.image,
    //         path    = url.replace("//avatars.mds.yandex.net/get-verba", ""),
    //         response = await axios.get(`http:${url}`, {responseType: "arraybuffer"}),
    //         buffer = Buffer.from(response.data, "binary");
    //
    //     const cloud = await app.storage.put(path, buffer);
    //     if(!cloud)
    //         continue;
    //
    //     row.image = `https://s3.eu-central-2.wasabisys.com/autoru${path}`;
    //     strings.push(`"${Object.values(row).join("\",\"")}"`);
    // }
    //
    // const csv   = `${app.config.tmpDir}/export.csv`;
    // await app.filesystem.append(csv, `${strings.join("\n")}\n`);
})();