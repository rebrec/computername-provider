const helper = require('../../helpers/data');

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const config = require('../../../config');
const GlpiApiFactory = require(config.projectRoot + '/app/structure/GlpiApi');

let settings = {
    user: 'glpi',
    password: '9AcJYYwlGkDqARIf1zSh',
    hostname: 'www.glpi.sdis72.fr',
    port: '80',
    endpoint: '/plugins/webservices/xmlrpc.php'
};

chai.use(chaiHttp);


describe('GlpiApi', function () {

    beforeEach(helper.beforeTest);
    afterEach(helper.afterTest);

    it('getTemplateString return a non empty string', function (done) {
        const GlpiApi = GlpiApiFactory(helper.db);
        let glpiApi = new GlpiApi();
        glpiApi.setApiSettings(settings, {session:'ue8gv2hgsta207edb09eo08r86'})
            .then( _=> {
                return glpiApi.addComputer({
                    serial: '123456789',
                    hostname: 'testcomputer1'
                })
            })
            .then(_=> {
                return glpiApi.removeComputer({
                    hostname: 'testcomputer1'
                })
            })
            .then(_=> {

                done();
            });

    });
});


