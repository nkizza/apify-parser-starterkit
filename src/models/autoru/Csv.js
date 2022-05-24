const Model = require("../Model");

class Csv extends Model {
    map(data) {
        // All data we need is in generation level.
        const level = data.find(item => item.level === "GENERATION_LEVEL");
        if(!level) return false;

        const meta = this.mapJson(level, {
            fields: { brand: "mark.name", model: "model.name" }
        });

        const generationMapper = {
            fields: {
                name    : "name",
                image   : "mobilePhoto",
                yearFrom: "yearFrom",
                yearTo  : "yearTo",
            },
        };
        return this.mapJson(level.entities, generationMapper).map(row => {
            row["brand"] = meta.brand;
            row["model"] = meta.model;
            return row;
        });
    }

    mapModels(data) {
        // Model level data.
        const level = data.find(item => item.level === "MODEL_LEVEL");
        if(!level) return false;

        return this.mapJson(level.entities, {
            fields: {
                id: "id",
            }
        }).map(el => el.id);
    }
}

module.exports = Csv