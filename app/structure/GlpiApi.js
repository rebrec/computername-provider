module.exports = function (db) {
    const DEBUG = true;
    const Promise = require('bluebird');
    const config = require('../../config');
    const ApplicationSettings = require(config.projectRoot + '/app/models/ApplicationSettings')(db);
    const xmlrpc = require('xmlrpc');

    class GlpiApi {
        constructor() {
            this.config = new ApplicationSettings();
            this.defaultSettings = {
                user: 'someusername',
                password: 'somepassword',
                hostname: 'www.glpi.corporate.com',
                port: '80',
                endpoint: '/plugins/webservices/xmlrpc.php'
            };
            this._client = null;
            this._auth = null;
        }

        getApiSettings() {
            return Promise.resolve()
                .then(_=> {
                    if (this._cachedApiSettings) {
                        let result = {value: this._cachedApiSettings};
                        return result
                    }
                    else return this.config.collection.findOneAsync({field: 'glpiPluginApiSettings'})
                })
                .then(res=> {
                    if (!res || Object.keys(res.value).length <= 0) return this.defaultSettings;
                    return res.value;
                });
        }

        setApiSettings(apiSettings) {
            return Promise.resolve()
                .then(_=> {
                    if (!apiSettings) throw "Used setSettings with an empty value !";
                    if (!apiSettings.user) throw "Used setSettings with an empty user value !";
                    if (!apiSettings.password) throw "Used setSettings with an empty password value !";
                    if (!apiSettings.hostname) throw "Used setSettings with an empty host value !";
                    if (!apiSettings.port) throw "Used setSettings with an empty port value !";
                    if (!apiSettings.endpoint) throw "Used setSettings with an empty endpoint value !";
                    this._cachedApiSettings = apiSettings;
                    return this.config.collection.updateAsync({field: 'glpiPluginApiSettings'},
                        {
                            field: 'glpiPluginApiSettings',
                            value: apiSettings
                        },
                        {upsert: true}
                    )
                        .then(_=>{
                            return this.initSession();
                        });
                });
        }
        initSession(){
            return this._doLogin()
                .then(auth=>{
                    this._auth = auth;
                    return true;
                })
                .catch(err=>{
                    return false;
                });
        }
        addComputer(infos, forceUpdate = false) {
            return Promise.resolve()
                .then(_=> {
                    if (!infos) throw "Please provide infos";
                    if (!infos.hostname) throw "Please provide infos.hostname";
                    if (!infos.serial) throw "Please provide infos.serial";
                    // if exist && forceUpdate
                    return this._computerExists(this._auth, infos.hostname)
                        .then((objId)=> {// get existing objectID
                            if (objId) { // objId <== Id of existing obj or false
                                if (forceUpdate) {// updateexisting objectID
                                    return this._updateComputer(this._auth, objId, infos.hostname, infos.serial)
                                        .then(()=> {
                                            if (DEBUG) console.log('Updated');
                                            return "UPDATED";
                                        })
                                        .catch((err)=> {
                                            console.log('Error', err)
                                        });

                                } else {
                                    return "NOT_UPDATED";
                                }
                            } else { // object doesn't exist
                                return this._createComputer(this._auth, infos.hostname, infos.serial)// create objectID
                                    .then(()=> {
                                        if (DEBUG) console.log('Created');
                                        return "CREATED"
                                    })
                                    .catch((err)=> {
                                        console.log('Error', err)
                                    });
                            }
                        })
                        .catch((err)=> {
                            console.log('Error : ', err);
                        });

                })
        }


        removeComputer(infos) {
            return Promise.resolve()
                .then(_=> {
                    if (!infos) throw "Please provide infos";
                    if (!infos.hostname) throw "Please provide infos.hostname";
                    // if exist && forceUpdate
                    return this._computerExists(this._auth, infos.hostname)
                        .then((objId)=> {// get existing objectID
                            if (objId) { // objId <== Id of existing obj or false
                                return this._deleteComputer(this._auth, objId)
                                    .then(()=> {
                                        if (DEBUG) console.log('Removed');
                                        return "REMOVED";
                                    })
                                    .catch((err)=> {
                                        console.log('Error', err)
                                    });

                            } else {
                                return "NOT_FOUND";
                            }
                        })
                        .catch((err)=> {
                            console.log('Error : ', err);
                        });
                })
        }


        _computerExists(aut_data, computerName) {
            return Promise.resolve()
                .then(()=> {
                    let params = {
                        session: aut_data.session,
                        name: computerName,
                        itemtype: "computer"
                    };
                    return this._glpiWSCall('glpi.listObjects', [params])
                        .then((obj)=> {
                            if (obj) {
                                obj = obj.length ? obj[0] : obj;
                                return obj.id
                            }
                            return false;
                        })
                        .catch((err)=> {
                            console.log('ERROR')
                            return 'error';
                        })


                });
        }

        _createComputer(aut_data, computername, serial) {
            return Promise.resolve()
                .then(()=> {
                    let params = [{
                        session: aut_data.session,
                        fields: {
                            computer: [
                                {
                                    entities_id: 0,
                                    locations_id: "1",
                                    name: computername,
                                    serial: serial,
                                    otherserial: computername,
                                    comment: 'automatic import from frl tool'
                                }
                            ]
                        }
                    }];
                    return this._glpiWSCall('glpi.createObjects', params);
                });
        }


        _deleteComputer(aut_data, id) {
            let params = [{
                session: aut_data.session,
                fields: {
                    computer: [
                        {
                            // entities_id: 0,
                            id: id,
                        }
                    ]
                }
            }];
            return this._glpiWSCall('glpi.deleteObjects', params);
        }

        _updateComputer(aut_data, id, computername, serial) {
            return Promise.resolve()
                .then(()=> {
                    let params = [{
                        session: aut_data.session,
                        fields: {
                            computer: [
                                {
                                    id: id,
                                    entities_id: 0,
                                    locations_id: "1",
                                    name: computername,
                                    serial: serial,
                                    otherserial: computername,
                                    comment: 'automatic import from frl tool'
                                }
                            ]
                        }
                    }];
                    return this._glpiWSCall('glpi.updateObjects', params);
                });
        }


        _doLogin() {
            return this.getApiSettings()
                .then(settings=> {
                    this._client = xmlrpc.createClient({
                        host: settings.hostname,
                        port: settings.port,
                        path: settings.endpoint
                    });
                    let params = [{login_name: settings.user, login_password: settings.password}]
                    return this._glpiWSCall("glpi.doLogin", params);
                });
        }

        _glpiWSCall(methodName, params) {
            return new Promise((resolve, reject) => {
                this._client.methodCall(methodName, params, function (error, obj) {
                    // Results of the method response
                    if (error) {
                        console.log('error for method ', methodName, ':', error);
                        console.log('req headers:', error.req && error.req._header);
                        console.log('res code:', error.res && error.res.statusCode);
                        console.log('res body:', error.body);
                        reject(error);
                    } else {
                        if (DEBUG) console.log('DEBUG : ' + methodName + ', Result ==>' + JSON.stringify(obj));
                        resolve(obj);
                    }
                });
            });
        }

    }
    return GlpiApi;
}
