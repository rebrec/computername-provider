const helper = require('../../helpers/data');

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const config = require('../../../config');
const NameProviderFactory = require(config.projectRoot + '/app/structure/NameProvider');


chai.use(chaiHttp);


describe('NameProvider', function () {

    beforeEach(helper.beforeTest);
    afterEach(helper.afterTest);

    it('getNewName return a non empty string', function (done) {
        const NameProvider = NameProviderFactory(helper.db);
        let nameProvider = new NameProvider();
        nameProvider.getNewName()
            .then(res=> {
                expect(res).not.to.be.equal(null);
                expect(res).to.be.a('string');
                expect(res).to.be.equal('PC1701-003');
                done();
            });
    });

    it('getNewName called twice will return a new incremented name', function (done) {
        const NameProvider = NameProviderFactory(helper.db);
        let nameProvider = new NameProvider();
        nameProvider.getNewName()
            .then(nameProvider.getNewName.bind(nameProvider))
            .then(nameProvider.getNewName.bind(nameProvider))
            .then(res=> {
                expect(res).not.to.be.equal(null);
                expect(res).to.be.a('string');
                expect(res).to.be.equal('PC1701-005');
                done();
            });
    });

    it('setNewName will update the template and counter properly', function (done) {
        const NameProvider = NameProviderFactory(helper.db);
        let nameProvider = new NameProvider();
        let templateString = 'PC2233';
        let counter = 10;
        nameProvider.setNewName(templateString, counter)
            .then(nameProvider.getNewName.bind(nameProvider))
            .then(res=> {
                expect(res).not.to.be.equal(null);
                expect(res).to.be.a('string');
                expect(res).to.be.equal(templateString + '-0' + counter);
                done();
            });
    });

    it('getHostnameForInfos will complain if empty parameter ', function (done) {
        const NameProvider = NameProviderFactory(helper.db);
        let nameProvider = new NameProvider();
        let infos;
        nameProvider.getHostnameForInfos(infos)
            .catch(err=> {
                expect(err).to.be.equal('No Informations provided!!');
                done();
            });
    });
    it("getHostnameForInfos will complain if parameter doesn't container serial", function (done) {
        const NameProvider = NameProviderFactory(helper.db);
        let nameProvider = new NameProvider();
        let infos = {cpu: 2};
        nameProvider.getHostnameForInfos(infos)
            .catch(err=> {
                expect(err).to.be.equal("Information object doesn't have a 'serial' property!!");
                done();
            });
    });

    it("getHostnameForInfos will return a new hostname if the serial doesn't exist and will add it to the store", function (done) {
        const NameProvider = NameProviderFactory(helper.db);
        let nameProvider = new NameProvider();
        let serial = 'newserial';
        let infos = {serial: serial, cpu: 1, ram: 2048, whatever: 'else'};
        nameProvider.getHostnameForInfos(infos)
            .then(res=> {
                expect(res).to.be.an('object');
                expect(res.serial).to.be.equal(serial);
                expect(res.hostname).to.be.equal('PC1701-003');
                return nameProvider.getHostnameForInfos({serial: serial});
            })
            .then(res=> {
                expect(res).to.be.an('object');
                expect(res.serial).to.be.equal(serial);
                expect(res.hostname).to.be.equal('PC1701-003');
                done();
            });
    });
    it("getHostnameForInfos will return a existing hostname if the serial exists", function (done) {
        const NameProvider = NameProviderFactory(helper.db);
        let nameProvider = new NameProvider();
        let serial = 'serial2';
        let infos = {serial: serial, cpu: 1, ram: 2048, whatever: 'else'};
        nameProvider.getHostnameForInfos(infos)
            .then(res=> {
                expect(res).to.be.an('object');
                expect(res.serial).to.be.equal(serial);
                expect(res.hostname).to.be.equal('hostname2');
                done();
            });
    });
});




