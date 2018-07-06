module.exports = function (db) {

    const Promise = require('bluebird');
    const config = require('../../config');
    const NameProviderConfig = require(config.projectRoot + '/app/models/NameProviderConfig')(db);
    const HostInformation = require(config.projectRoot + '/app/models/HostInformation')(db);


    class NameProvider {
        constructor() {
            this.config = new NameProviderConfig();
            this.hostInfo = new HostInformation();
        }

        getHostList() {
            return this.hostInfo.listHostInformations();
        }


        updateHostInformation(infos) {
            return this.hostInfo.updateHostInformation(infos);
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
                                return this.hostInfo.addHostInformation(infos)
                            })
                    }
                })
                .then(_=> {
                    return this.hostInfo.getHostInformation(infos.serial);
                })
        }

        getTemplate() {
            let counter;
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
                .then(templateString=> {
                    return {templateString: templateString, counter: counter};
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

        setNewName(templateString, counter) {
            return Promise.resolve()
                .then(_=> {
                    if (typeof(templateString) !== 'string') throw "templateString must be a string!";
                    if (typeof(counter) !== 'number') throw "counter must be a number!";
                    return Promise.all([
                        this.config.setTemplateString(templateString),
                        this.config.setCounter(counter)
                    ]);
                });

        }

    }
    return NameProvider;
}
