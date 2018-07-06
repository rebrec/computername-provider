const Datastore = require('nedb');
const Promise = require('bluebird');

let db = {};


function loadAllDatabases() {
    let promises = [];
    promises.push(db.config.loadDatabaseAsync());
    promises.push(db.hostInformation.loadDatabaseAsync());
    return Promise.all(promises)
        .then(_=> {
            return db
        });
}

module.exports = function (config) {
    db.config = new Datastore({filename: config.dbConfigFilename});
    db.config.persistence.setAutocompactionInterval(5 * 60 * 1000);
    db.hostInformation= new Datastore({filename: config.dbHostInformationFilename});
    db.hostInformation.persistence.setAutocompactionInterval(5 * 60 * 1000);
    Promise.promisifyAll(db.config);
    Promise.promisifyAll(db.hostInformation);
    return {
        loadAllDatabases: loadAllDatabases
    };
};
