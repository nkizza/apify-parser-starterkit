const parser = require('node-html-parser');

/**
 * A helper to translate HTML / JSON into Javascript object.
 */
class Model {
    #app;
    constructor(app) {
        this.#app = app;
    }

    get helper() {
        return this.#app.helper;
    }

    mapJson(data, mapper) {
        if(Array.isArray(data)) {
            return data.map((item) => {
                return this.mapJson(item, mapper)
            })
        }

        if(mapper.prefix)
            data = this.helper.getValue(data, mapper.prefix, {})

        let map = {}
        for(let prop in mapper.fields) {
            if(!mapper.fields.hasOwnProperty(prop))
                continue

            let valueMapper = mapper.fields[prop]
            if(valueMapper === false)
                continue

            switch (typeof valueMapper) {
                case "function":
                    map[prop] = valueMapper(data)
                    break
                case "string":
                    map[prop] = this.helper.getValue(data, valueMapper)
            }
        }

        return map
    }

    // Translates HTML into required data format
    mapHtml(dom, mapper) {
        if( !(dom instanceof parser.HTMLElement) )
            dom = parser.parse(dom);

        let map = {}

        for(let prop in mapper) {
            if(!mapper.hasOwnProperty(prop))
                continue

            let valueMapper = mapper[prop]
            if(valueMapper === false)
                continue

            switch (typeof valueMapper) {
                case "function":
                    map[prop] = valueMapper(dom)
                    break
                case "string":
                    // Inner text of element selector
                    map[prop] = this.getDomValue(dom, valueMapper)
                    break
                case "object":
                    map[prop] = this.mapHtml(dom, valueMapper)
            }
        }

        return map
    }
}

module.exports = Model