const helper = require('../../helpers/data');

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const config = require('../../../config');
const HostInformationFactory = require(config.projectRoot + '/app/models/HostInformation');


chai.use(chaiHttp);


describe('HostInformation', function () {

    beforeEach(helper.beforeTest);
    afterEach(helper.afterTest);

    it('getHostInformation complain if no serial provided', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        hostInformation.getHostInformation('')
            .then(res => {
                console.log('should not come here');
            })
            .catch(err=> {
                expect(err).to.be.equal('No serial provided');
                done();
            });
    });
    it('getHostInformation return an object with serial and hostname properties', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        hostInformation.getHostInformation('serial2')
            .then(res => {
                expect(res).to.be.a('object');
                expect(res.hostname).to.be.equal('hostname2');
                done();
            });
    });
    it('serialExists return a boolean', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        hostInformation.serialExists('serial1')
            .then(res => {
                expect(res).to.be.a('boolean');
                done();
            });
    });
    it('serialExists return a true if exists', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        hostInformation.serialExists('serial2')
            .then(res => {
                expect(res).to.be.a('boolean');
                expect(res).to.be.equal(true);
                done();
            });
    });
    it('serialExists return a false if doesnt exists', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        hostInformation.serialExists('serial12')
            .then(res => {
                expect(res).to.be.a('boolean');
                expect(res).to.be.equal(false);
                done();
            });
    });
    it('updateHostInformation complains if no paramater provided', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        let infos;
        hostInformation.updateHostInformation()
            .catch(err=> {
                expect(err).to.be.equal('No host information object provided !');
                done();
            });
    });
    it('updateHostInformation complains if no serial property provided', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        let infos ={ hostname:'blah' };
        hostInformation.updateHostInformation(infos)
            .catch(err=> {
                expect(err).to.be.equal("Host information object doesn't have a 'serial' property !");
                done();
            });
    });
    it('updateHostInformation complains if no hostname property provided', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        let infos ={ serial:'blah' };
        hostInformation.updateHostInformation(infos)
            .catch(err=> {
                expect(err).to.be.equal("Host information object doesn't have a 'hostname' property !");
                done();
            });
    });

    it('updateHostInformation update existing host info based on serial', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        let infos ={ serial:'serial2', hostname:"hostname18" };
        hostInformation.updateHostInformation(infos)
            .then(_=> {
                hostInformation.getHostInformation(infos.serial)
                    .then(res=>{
                        expect(res.serial).to.be.equal(infos.serial);
                        expect(res.hostname).to.be.equal(infos.hostname);
                        done();
                    });


            });
    });

    it('updateHostInformation add new host info when serial doesnt exists', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        let infos ={ serial:'serial-new', hostname:"hostnamenew" };
        hostInformation.updateHostInformation(infos)
            .then(_=> {
                hostInformation.getHostInformation(infos.serial)
                    .then(res=>{
                        expect(res.serial).to.be.equal(infos.serial);
                        expect(res.hostname).to.be.equal(infos.hostname);
                        done();
                    });


            });
    });

    it('importHostInformation will reject objects not containing a length property', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        hostInformation.importHostInformation()
            .catch(err=>{
                expect(err).to.be.equal('hostlist must have a length property!');
                done();
            });
    });
    //
    it('importHostInformation will return non valid hosts in the host list', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        let hostlist = [
            {saerial: 'serial111', hostname:'hostname111', something:'else'},
            {sesrial: 'serial112', hostname:'hostname112', something:'else'},
            {serial: 'serial113', hogtname:'hostname113', something:'else'},
            {serigal: 'serial114', hostname:'hostname114', something:'else'},
            {serial: 'serial115', hostname:'hostname115', something:'else'}
        ];
        hostInformation.importHostInformation(hostlist)
            .then(errorList=>{
                expect(errorList).to.be.an('array');
                expect(errorList.length).to.be.equal(4);
                done();
            });
    });

    it('listHostInformations will return the full list of hosts', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        hostInformation.listHostInformations()
            .then(res=>{
                expect(res).to.be.an('array');
                expect(res.length).to.be.equal(5);
                done();
            })
    });

    it('importHostInformation will import objects', function (done) {
        const HostInformation = HostInformationFactory(helper.db);
        let hostInformation = new HostInformation();
        let hostlist = [
            {serial: 'serial111', hostname:'hostname111', something:'else'},
            {serial: 'serial112', hostname:'hostname112', something:'else'},
            {serial: 'serial113', hostname:'hostname113', something:'else'},
            {serial: 'serial114', hostname:'hostname114', something:'else'}
        ];
        hostInformation.importHostInformation(hostlist)
            .then(errorList=>{
                expect(errorList).to.be.an('array');
                expect(errorList.length).to.be.equal(0);
                return hostInformation.listHostInformations()
            })
            .then(infos=>{
                expect(infos).to.be.an('array');
                expect(infos.length).to.be.equal(5 + hostlist.length);
                done();

            });
    });

});



