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

    it('addComputer and _computerExists and removeComputer', function (done) {
        const GlpiApi = GlpiApiFactory(helper.db);
        let glpiApi = new GlpiApi();
        glpiApi.setApiSettings(settings)

            .then(res => {
                expect(res).to.be.equal(true);
                return glpiApi.addComputer({
                    serial: '123456789',
                    hostname: 'testcomputer1'
                })
            })
            .then(res => {
                expect(res).to.be.an('string');
                return glpiApi._computerExists(glpiApi._auth, 'testcomputer1')
            })
            .then(res => {
                expect(isNaN(res)).to.be.equal(false);
                return glpiApi.removeComputer({
                    hostname: 'testcomputer1'
                })
            })
            .then(res => {
                expect(res).to.be.equal('REMOVED');
                done();
            });
    });

    it('addComputer and _computerExists and removeComputer', function (done) {
        const GlpiApi = GlpiApiFactory(helper.db);
        let glpiApi = new GlpiApi();
        glpiApi.setApiSettings(settings)

            .then(res => {
                expect(res).to.be.equal(true);
                return glpiApi.addComputer({
                    serial: '123456789',
                    hostname: 'testcomputer1'
                })
            })
            .then(res => {
                expect(res).to.be.an('string');
                return glpiApi._computerExists(glpiApi._auth, 'testcomputer1')
            })
            .then(res => {
                expect(isNaN(res)).to.be.equal(false);
                return glpiApi.removeComputer({
                    hostname: 'testcomputer1'
                })
            })
            .then(res => {
                expect(res).to.be.equal('REMOVED');
                done();
            });
    });
});


