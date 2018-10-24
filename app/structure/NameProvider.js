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
            return this.hostInfo.listHostInformations();
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
            return Promise.resolve()
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
                                return this.config.getDefaultTaskSequenceID();
                            })
                            .then(taskSequenceID=> {
                                infos.taskSequenceID = taskSequenceID;
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
                    return {templateString: templateString, counter: counter, taskSequenceID: taskSequenceID};
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

        setNewName(templateString, counter, taskSequenceID) {
            return Promise.resolve()
                .then(_=> {
                    if (typeof(templateString) !== 'string') throw "templateString must be a string!";
                    if (typeof(counter) !== 'number') throw "counter must be a number!";
                    return Promise.all([
                        this.config.setTemplateString(templateString),
                        this.config.setCounter(counter),
                        this.config.setDefaultTaskSequenceID(taskSequenceID)
                    ]);
                });

        }

    }
    return NameProvider;
}
