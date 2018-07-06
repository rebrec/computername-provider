const config = require('../config');
const dbLoader = require(config.projectRoot + '/app/models/db')(config);
const fs = require('fs');
const parse = require('csv-parse/lib/sync')

dbLoader.loadAllDatabases()
    .then(function (db) {
        // call main app
        const HostInformation = require(config.projectRoot + '/app/models/HostInformation')(db);
        const NameProvider = require(config.projectRoot + '/app/structure/NameProvider')(db);
        let nameProvider = new NameProvider()

        let csvFile = 'import.csv';
        let fullPath = __dirname + '/' + csvFile;
        console.log('Going to open ', fullPath)
        let csvdata = fs.readFileSync(fullPath, 'utf8');
        let lines = parse(csvdata, {delimiter: ';', skip_lines_with_error: true});
        let promises = [];
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let serial = line[0];
            let hostname = line[1];

            promises.push(nameProvider.updateHostInformation({serial:serial, hostname:hostname})
                .then(_=>{console.log('Processed : serial', serial, ' / hostname', hostname);}));
        }
        return Promise.all(promises);

    })
    .then(_=>{
        console.log('Done');
    });
