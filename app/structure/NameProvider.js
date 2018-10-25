module.exports = function (db) {
    const EventEmitter = require('events');
    const Promise = require('bluebird');
    const config = require('../../config');
    const ApplicationSettings = require(config.projectRoot + '/app/models/ApplicationSettings')(db);
    const HostInformation = require(config.projectRoot + '/app/models/HostInformation')(db);


    class NameProvider extends EventEmitter{
        constructor() {
            super();
            this.config = new ApplicationSettings();
            this.hostInfo = new HostInformation();
        }

        getHostList() {
            return this.hostInfo.purgeTemporaryHostInformation()
                .then(_=> {
                    return this.hostInfo.listHostInformations();
                });
        }

        updateTemporaryHostInformation(infos) {
            return this.hostInfo.updateTemporaryHostInformation(infos)
                .then(res=>{
                    this.emit('updateSuccess', infos);
                    return res;
                })
                .catch(err=>{
                    this.emit('updateFailure', infos, err);
                    throw err;
                });
        }


        updateHostInformation(infos) {
            return this.hostInfo.updateHostInformation(infos)
                .then(res=>{
                    this.emit('updateSuccess', infos);
                    return res;
                })
                .catch(err=>{
                    this.emit('updateFailure', infos, err);
                    throw err;
                });
        }

        getHostnameForInfos(infos) {
            return this.hostInfo.purgeTemporaryHostInformation()
                .then(_=> {
                    if (!infos) throw 'No Informations provided!!';
                    if (!infos.serial) throw "Information object doesn't have a 'serial' property!!";
                    return this.hostInfo.serialExists(infos.serial)
                })
                .then(exist=> {
                    if (!exist) {
                        return this.getNewName()
                            .then(hostname=> {
                                infos.hostname = hostname;
                                return this.getTemplate();
                            })
                            .then(template=> {
                                infos.taskSequenceID = template.taskSequenceID;
                                infos.domainJoin = template.domainJoin;
                                return this.hostInfo.addHostInformation(infos)
                                    .then(_=>{
                                        this.emit('hostCreated', infos);
                                    })
                            })
                    }
                })
                .then(_=> {
                    return this.hostInfo.getHostInformation(infos.serial);
                })
        }

        getTemplate() {
            let counter;
            let templateString;
            let taskSequenceID;
            let domainJoin;
            return Promise.resolve()
                .then(_=> {
                    return this.config.getCounter();
                })
                .then(_=> {
                    counter = _;
                    if (counter < 10) counter = '00' + counter;
                    else if (counter < 100) counter = '0' + counter;
                    return this.config.getTemplateString();
                })
                .then(_=> {
                    templateString = _;
                    return this.config.getDefaultTaskSequenceID();
                })
                .then(_=> {
                    taskSequenceID = _;
                    return this.config.getDomainJoin();
                })
                .then(_=> {
                    domainJoin = _;
                    return {templateString: templateString, counter: counter, taskSequenceID: taskSequenceID, domainJoin: domainJoin};
                });
        }

        getNewName() {
            let counter;
            let templateString;
            return Promise.resolve()
                .then(_=> {
                    return this.config.getCounter();
                })
                .then(_=> {
                    counter = _;
                    if (counter < 10) counter = '00' + counter;
                    else if (counter < 100) counter = '0' + counter;
                    return this.config.getTemplateString();
                })
                .then(_=> {
                    templateString = _;
                    return this.config.incCounter();
                    return templateString + counter;
                })
                .then(_=> {
                    return `${templateString}-${counter}`;
                });
        }

        setNewName(templateString, counter, taskSequenceID, domainJoin){
            return Promise.resolve()
                .then(_=> {
                    if (typeof(templateString) !== 'string') throw "templateString must be a string!";
                    if (typeof(counter) !== 'number') throw "counter must be a number!";
                    if (typeof(taskSequenceID) !== 'string') throw "taskSequenceID must be a string!";
                    if (typeof(domainJoin) !== 'string') throw "domainJoin must be a string!";
                    return Promise.all([
                        this.config.setTemplateString(templateString),
                        this.config.setCounter(counter),
                        this.config.setDefaultTaskSequenceID(taskSequenceID),
                        this.config.setDomainJoin(domainJoin)
                    ]);
                });

        }

    }
    return NameProvider;
}
