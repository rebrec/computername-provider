var xmlrpc = require('xmlrpc')

// const DEBUG = true;
const DEBUG = true;
let host = "www.glpi.sdis72.fr";
let path = "/plugins/webservices/xmlrpc.php";
let port = 80;

// Creates an XML-RPC client. Passes the host information on where to
// make the XML-RPC calls.

var client = xmlrpc.createClient({host: host, port: port, path: path});


// Sends a method call to the XML-RPC server
function doLogin(params = [{login_name: 'glpi', login_password: '9AcJYYwlGkDqARIf1zSh!'}]) {
    return glpiWSCall("glpi.doLogin", params);
}

function computerExists(aut_data, computerName) {
    return Promise.resolve()
        .then(()=> {
            params = {
                session: aut_data.session,
                name: computerName,
                itemtype: "computer"
            };
            return glpiWSCall('glpi.listObjects', [params])
                .then((obj)=> {
                    if (obj) {
                        obj = obj.length ? obj[0] : obj;
                        return obj.id
                    }
                    return false;
                })
                .catch((err)=> {
                    console.log('ERROR')
                })


        });
}

function createComputer(aut_data, computername, serial) {
    return Promise.resolve()
        .then(()=> {
        params = [{
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
        return glpiWSCall('glpi.createObjects', params);
    });
}

function updateComputer(aut_data, id, computername, serial) {
    return Promise.resolve()
        .then(()=> {
        params = [{
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
        return glpiWSCall('glpi.updateObjects', params);
    });
}


function glpiWSCall(methodName, params) {
    return new Promise(function(resolve, reject){
        client.methodCall(methodName, params, function (error, obj) {
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

function tryToAddComputer(computername, serial, forceUpdate = false) {
    return doLogin()
        .then((auth_data)=> {
            // if exist && forceUpdate
            return computerExists(auth_data, computername)
                .then((objId)=> {// get existing objectID
                    if (objId) { // objId <== Id of existing obj or false
                        if (forceUpdate) {// updateexisting objectID
                            return updateComputer(auth_data, objId, computername, serial)
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
                        return createComputer(auth_data, computername, serial)// create objectID
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

//
// tryToAddComputer('PC1234-5567', 'aaaakuygaaaa', true)
//     .then((res)=> {
//         console.log('Done :', res);
//     });
module.exports = {
    tryToAddComputer: tryToAddComputer
};
