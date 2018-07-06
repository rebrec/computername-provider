module.exports = function (db) {

    const Promise = require('bluebird');
    const moment = require('moment');


    class NameProviderConfig {
        constructor() {
            this.collection = db.config;
        }

        getTemplateString() {
            return this.collection.findOneAsync({field: 'nameProviderTemplate'})
                .then(res=>{
                    return res.value;
                });
        }

        setTemplateString(value) {
            return Promise.resolve()
                .then(_=> {
                    if (!value) throw "Used setTemplateString with an empty value !"
                    return this.collection.updateAsync({field: 'nameProviderTemplate'},
                        {
                            field: 'nameProviderTemplate',
                            value: value
                        },
                        {upsert: true}
                    );

                });
        }

        getCounter() {
            return this.collection.findOneAsync({field: 'nameProviderCounter'})
                .then(res=>{
                    return res.value;
                });
        }

        setCounter(value) {
            return Promise.resolve()
                .then(_=> {
                    if (!value) throw "Used setCounter with an empty value !"
                    if (typeof(value) !== 'number') throw "Used setCounter with a non int value !"
                    return this.collection.updateAsync({field: 'nameProviderCounter'},
                        {
                            field: 'nameProviderCounter',
                            value: value
                        },
                        {upsert: true}
                    );
                });
        }

        incCounter(count = 1) {
            return this.getCounter()
                .then(res => {
                    return this.setCounter(res + count)
                });
        }

    }
    return NameProviderConfig;
};