module.exports = function (db) {

    const Promise = require('bluebird');
    const moment = require('moment');


    class HostInformation {
        constructor() {
            this.collection = db.hostInformation;
        }


        getHostInformation(serial) {
            return Promise.resolve()
                .then(_=> {
                    if (!serial) throw "No serial provided";
                    return this.collection.findOneAsync({serial: serial})
                });

        }

        serialExists(serial) {
            if (!serial) throw "No serial provided";
            return this.collection.findOneAsync({serial: serial})
                .then(hostInformation => {
                    if (hostInformation) return true;
                    else return false;
                });

        }

        importHostInformation(hostlist) {
            return Promise.resolve()
                .then(_=> {

                    let errorList = [];
                    let promises = [];
                    if (!hostlist || !hostlist.hasOwnProperty('length')) throw 'hostlist must have a length property!';

                    for (let i = 0; i < hostlist.length; i++) {
                        let host = hostlist[i];
                        let error = {object: host};
                        if (!host.hasOwnProperty('serial')) {
                            error.message = "Host information object doesn't have a 'serial' property !";
                            errorList.push(error);
                        }
                        else if (!host.hasOwnProperty('hostname')) {
                            error.message = "Host information object doesn't have a 'hostname' property !";
                            errorList.push(error);
                        }
                        else {
                            promises.push(this.updateHostInformation(host))
                        }
                    }
                    return Promise.all(promises)
                        .then(_=> {
                            return errorList;
                        })
                });
        }

        listHostInformations() {
            return this.collection.findAsync({});
        }

        addHostInformation(infos) {
            return this.updateHostInformation(infos);
        }

        updateTemporaryHostInformation(infos) {
            let temporaryInformations = Object.assign({}, infos);
            temporaryInformations.temporary = true;
            temporaryInformations.creationTime = Date.now();
            return this.updateHostInformation(temporaryInformations);
        }

        purgeTemporaryHostInformation(days=0, hours=7, minutes=0, seconds=0) {
            let timerange = seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000 + days * 24 * 60 * 60 * 1000;
            let olderTimestamp = Date.now() - timerange;
            return Promise.resolve()
                .then(_=>{
                    return this.collection.removeAsync({ creationTime: { $lt: olderTimestamp }}, { multi: true})
                })
                .then(_=>{
                    console.log(_)
                });
        }

        updateHostInformation(infos) {
            return Promise.resolve()
                .then(_=> {
                    if (!infos) throw "No host information object provided !";
                    if (!infos.hasOwnProperty('serial')) throw "Host information object doesn't have a 'serial' property !";
                    if (!infos.hasOwnProperty('hostname')) throw "Host information object doesn't have a 'hostname' property !";
                    return this.collection.updateAsync({serial: infos.serial},
                        infos,
                        {upsert: true}
                    );
                });
        }
    }


    return HostInformation;
};