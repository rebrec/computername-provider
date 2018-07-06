let path = require('path');
let dbBaseName = (process.env.NODE_ENV !== 'test') ? 'db': path.join('test', 'db');

let dbConfigFilename = path.join(__dirname, dbBaseName + 'Config');
let dbHostInformationFilename = path.join(__dirname, dbBaseName + 'HostInformation');

module.exports = {
    dbConfigFilename: dbConfigFilename,
    dbHostInformationFilename: dbHostInformationFilename,
    projectRoot: __dirname,
    port: 8088 
};