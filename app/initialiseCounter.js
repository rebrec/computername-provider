const config = require('../config');
const dbLoader = require(config.projectRoot + '/app/models/db')(config);

dbLoader.loadAllDatabases()
    .then(function (db) {
        // call main app
        const HostInformation = require('./models/HostInformation')(db);
        const NameProvider = require('./structure/NameProvider')(db);
        let nameProvider = new NameProvider()
        nameProvider.setNewName('pctest1234',1);
    });
