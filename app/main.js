module.exports = function (db) {

    const express = require('express');
    const app = express();
    const bodyParser = require('body-parser');
    const config = require('../config');
    const GlpiApi = require('./structure/GlpiApi')(db)
    const HostInformation = require('./models/HostInformation')(db);
    const NameProvider = require('./structure/NameProvider')(db);

    const nunjucks = require('nunjucks');

    const { toXML } = require('jstoxml');

    app.use('/vendor/jquery', express.static(config.projectRoot + '/node_modules/jquery/dist/'));
    app.use('/vendor/bootstrap', express.static(config.projectRoot + '/node_modules/bootstrap/dist/'));
    app.use('/vendor/tether', express.static(config.projectRoot + '/node_modules/tether/dist/'));
    app.use('/vendor/font-awesome', express.static(config.projectRoot + '/node_modules/font-awesome/'));
    app.use(express.static(config.projectRoot + '/app/view/static'));

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    nunjucks.configure(config.projectRoot + '/app/view/templates', {
        autoescape: true,
        express: app
    });

    const glpiApi = new GlpiApi();
    glpiApi.initSession();
    const nameProvider = new NameProvider();
    nameProvider.on('hostCreated', infos =>{
        console.log('New Host Added !!!');
        console.log(JSON.stringify(infos));
        glpiApi.addComputer(infos);
    });
    const router = express.Router();
    const routerApi = express.Router();
    const routerApiXML = express.Router();

    router.route('/')
        .get(function (req, res) {
            res.render('hostlist.html', {
                title: 'Computername Provider'
            });
        });
    router.route('/settings')
        .get(function (req, res) {
            res.render('settings.html', {
                title: 'Computername Provider (settings)'
            });
        });
    // Single function which will need to be splitted into a more flexible file/class/whatever
    routerApi.route('/get_mdt_settings')
        .get(function (req, res) {
            let result = {status: 'success'};
            let serial = req.query.SerialNumber;
            let model = req.query.Model;
            let make = req.query.Make;
            let isVM = req.query.isVM;
            if (isVM === 'True') {
                // Handling VM
                let defaultSettings = {
                    Computername: 'VM-' + Math.random().toString(36).substring(2, 10), // random name
                    DomainJoin: 'True',
                    TaskSequenceId: 'WIN10-X64-1607' // WIN7-X64
                };
                // check if data for this host is available in temporary cache
                    // from the serial we expect to retrieve one or more variables from mdt (which will be used in custom settings.ini ie : OSDComputerName=ComputerName)
                
                let settings = Object.assign({}, defaultSettings);
                res.header('Content-Type', 'text/xml');
                let xml = toXML({result: settings});
                return res.send(xml);
            } else {
                nameProvider.getHostnameForInfos({serial: serial}) // could later send more data that could be persisted (like OS, cpu,
                // RAM etc, for now we generate an object containing just the serial property)
                    .then(data => {
                        result.data = data;
                        res.json(result);
                    })
                    .catch(err => {
                        result.status = 'failure';
                        result.message = err;
                        res.json(result);
                    });
            }
        });


    routerApi.route('/get_computer_name')
        .get(function (req, res) {
            let result = { status : 'success'};
            let serial = req.query.serial;
            nameProvider.getHostnameForInfos({serial:serial}) // could later send more data that could be persisted (like OS, cpu,
                                                            // RAM etc, for now we generate an object containing just the serial property)
                .then(data => {
                    result.data = data;
                    res.json(result);
                })
                .catch(err => {
                    result.status = 'failure';
                    result.message = err;
                    res.json(result);
                });
        });

    routerApi.route('/get_template_string')
        .get(function (req, res) {
            let result = { status : 'success'};
            nameProvider.getTemplate()
                .then(data => {
                    result.data = data;
                    res.json(result);
                })
                .catch(err => {
                    result.status = 'failure';
                    result.message = err;
                    res.json(result);
                });
        });

    routerApi.route('/getGlpiSettings')
        .get(function (req, res) {
            let result = { status : 'success'};
            glpiApi.getApiSettings()
                .then(data => {
                    result.data = data;
                    res.json(result);
                })
                .catch(err => {
                    result.status = 'failure';
                    result.message = err;
                    res.json(result);
                });
        });

    routerApi.route('/get_computer_list')
        .get(function (req, res) {
            let result = { status : 'success'};
            nameProvider.getHostList()
                .then(data => {
                    result.data = data;
                    res.json(result);
                })
                .catch(err => {
                    result.status = 'failure';
                    result.message = err;
                    res.json(result);
                });
        });
    //
    // routerApi.route('/get_template_string')
    //     .get(function (req, res) {
    //         let result = { status : 'success'};
    //         nameProvider.getTemplateString()
    //             .then(data => {
    //                 result.data = data;
    //                 res.json(result);
    //             })
    //             .catch(err => {
    //                 result.status = 'failure';
    //                 result.message = err;
    //                 res.json(result);
    //             });
    //     });

    routerApi.route('/set_template_name')
        .put(function (req, res) {
            let result = { status : 'success'};
            let templateString = req.body.templateString;
            let counter = parseInt(req.body.counter, 10);
            let taskSequenceID = req.body.taskSequenceID;
            
            nameProvider.setNewName(templateString, counter, taskSequenceID)
                .then(data => {
                    result.data = data;
                    res.json(result);
                })
                .catch(err => {
                    result.status = 'failure';
                    result.message = err;
                    res.json(result);
                });
        });

    routerApi.route('/setGlpiSettings')
        .put(function (req, res) {
            let result = { status : 'success'};
            glpiApi.setApiSettings(req.body)
                .then(data => {
                    result.data = data;
                    res.json(result);
                })
                .catch(err => {
                    result.status = 'failure';
                    result.message = err;
                    res.json(result);
                });
        });

    routerApi.route('/update_computer_infos')
        .put(function (req, res) {
            let result = { status : 'success'};
            let infos = req.body;
            nameProvider.updateHostInformation(infos)
                .then(data => {
                    result.data = data;
                    res.json(result);
                })
                .catch(err => {
                    result.status = 'failure';
                    result.message = err;
                    res.json(result);
                });
        });


    routerApi.route('/add_to_glpi')
        .put(function (req, res) {
            let result = { status : 'success'};
            let infos = req.body;
            console.log('New Host Added !!!');
            console.log(JSON.stringify(infos));
            glpiApi.addComputer(infos)
                .then(data => {
                    result.data = data;
                    res.json(result);
                })
                .catch(err => {
                    result.status = 'failure';
                    result.message = err;
                    res.json(result);
                });
        });



// all of our routes will be prefixed with /api
    app.use('/', router);
    app.use('/api/', routerApi);

// START THE SERVER
// =============================================================================

    return app;

};
