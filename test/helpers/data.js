process.env.NODE_ENV = 'test'; // set env before
const Promise = require('bluebird');
const fs = require('fs');
const config = require('../../config');
const dbLoader = require(config.projectRoot + '/app/models/db')(config);
let db;
let app;
let server;


Promise.promisifyAll(fs);


let helpers = {};

function loadDB() {
    config.debug && console.log('Loading DB');
    return dbLoader.loadAllDatabases()
        .then(ldb => {
            config.debug && console.log('DB Loaded');
            db = ldb;
            helpers.db = db;
        });
}

function populateDB() {
    config.debug && console.log("Populating DB");
    return Promise.all([_populateDBHostInformation(), _populateDBConfig()])
        .then(_=>{
            config.debug && console.log('populating done!');
        });
}

function _populateDBHostInformation() {
    let dataset = [
        {serial: 'serial1', hostname: 'hostname1', someother: 'param'},
        {serial: 'serial2', hostname: 'hostname2', someother: 'param'},
        {serial: 'serial3', hostname: 'hostname3', someother: 'param'},
        {serial: 'serial4', hostname: 'hostname4', someother: 'param'},
        {serial: 'serial5', hostname: 'hostname5', someother: 'param'},
    ];
    return db.hostInformation.insertAsync(dataset)
}

function _populateDBConfig() {
    let dataset = [
        {field: 'nameProviderTemplate', value: 'PC1701'},
        {field: 'nameProviderCounter', value: 3},
    ];
    return db.config.insertAsync(dataset)
}

function removeDBFiles() {
    let promises = [];
    config.debug && console.log('Removing DB Files');
    promises.push(fs.statAsync(config.dbConfigFilename)
        .then(_=> {
            config.debug && console.log('File Exist (' + config.dbConfigFilename + ') removing')
            return fs.unlinkAsync(config.dbConfigFilename);
        })
        .catch(err => {
            config.debug && console.log('File do not exist (' + config.dbConfigFilename + ') not removing')
            return;
        })
    );

    promises.push(fs.statAsync(config.dbHostInformationFilename)
        .then(_=> {
            config.debug && console.log('File Exist (' + config.dbHostInformationFilename + ') removing')
            return fs.unlinkAsync(config.dbHostInformationFilename);
        })
        .catch(err => {
            config.debug && console.log('File do not exist (' + config.dbHostInformationFilename + ') not removing');
            return;
        })
    );
    return Promise.all(promises);
}

function initApp() {
    // console.error("NOT DEFINED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    config.debug && console.log('Init App');
    // app = require(config.projectRoot + '/app/main')(db);
    return new Promise((resolve, reject) => {
        resolve(); // remove
    //     server = app.listen(config.port, resolve);
    // })
    //     .then(_=>{
    //         helpers.app = app;
        });
}

helpers.beforeTest = function beforeTest(done) {
    Promise.resolve()
        .then(removeDBFiles)
        .then(loadDB)
        .then(populateDB)
        .then(initApp)
        .then(done);

};


helpers.afterTest = function afterTest(done) {
    Promise.resolve()
        .then(_=>{
            // app.server = null;
            helpers.db = null;
            // console.error('NOT CLOSING................................................................................');
            // server.close(done);
            done();
        });
};


helpers.generateRandomData = function generateRandomData() {
    throw "Please edit data.js file to implement";
    // let randomBase = Math.random().toString(36).substring(7);
    // return {
    //     scriptname: 'scriptname-' + randomBase,
    //     scriptversion: 'scriptversion-' + randomBase,
    //     hostname: 'hostname-' + randomBase
    // }
};



module.exports = helpers;