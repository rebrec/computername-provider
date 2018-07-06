const helper = require('../../helpers/data');

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const config = require('../../../config');
const NameProviderConfigFactory = require(config.projectRoot + '/app/models/NameProviderConfig');


chai.use(chaiHttp);


describe('NameProviderConfig', function () {

    beforeEach(helper.beforeTest);
    afterEach(helper.afterTest);

    it('getTemplateString return a non empty string', function (done) {
        const NameProviderConfig= NameProviderConfigFactory(helper.db);
        let nameProviderConfig = new NameProviderConfig();
        nameProviderConfig.getTemplateString()
            .then(res=>{
                expect(res).not.to.be.equal(null);
                expect(res).to.be.a('string');
                expect(res).not.to.be.equal('');
                done();
            });
    });

    it('setTemplateString reject empty value', function (done) {
        const NameProviderConfig= NameProviderConfigFactory(helper.db);
        let nameProviderConfig = new NameProviderConfig();
        nameProviderConfig.setTemplateString()
            .catch(err=>{
                expect(err).to.be.equal("Used setTemplateString with an empty value !");
                done();
            });
    });
    it('setTemplateString overwrite existing value', function (done) {
        const NameProviderConfig= NameProviderConfigFactory(helper.db);
        let nameProviderConfig = new NameProviderConfig();
        let newName = 'PC1234';
        nameProviderConfig.setTemplateString(newName)
            .then(_=>{
                nameProviderConfig.getTemplateString()
                    .then(res=>{
                    expect(res).to.be.equal(newName);
                    done();
                });
            });
    });

    it('getCounter return the current counter value', function (done) {
        const NameProviderConfig= NameProviderConfigFactory(helper.db);
        let nameProviderConfig = new NameProviderConfig();
        let newName = 'PC1234';
        nameProviderConfig.getCounter()
            .then(res=>{
                expect(res).to.be.a('number');
                expect(res).to.be.equal(3);
                done();
            });
    });

    it('setCounter reject empty value', function (done) {
        const NameProviderConfig= NameProviderConfigFactory(helper.db);
        let nameProviderConfig = new NameProviderConfig();
        nameProviderConfig.setCounter()
            .catch(err=>{
                expect(err).to.be.equal("Used setCounter with an empty value !");
                done();
            });
    });
    it('setCounter reject non int value', function (done) {
        const NameProviderConfig= NameProviderConfigFactory(helper.db);
        let nameProviderConfig = new NameProviderConfig();
        nameProviderConfig.setCounter('aze')
            .catch(err=>{
                expect(err).to.be.equal("Used setCounter with a non int value !");
                done();
            });
    });

    it('setCounter(value) set the counter to value', function (done) {
        const NameProviderConfig= NameProviderConfigFactory(helper.db);
        let nameProviderConfig = new NameProviderConfig();
        let value = 123;
        nameProviderConfig.setCounter(123)
            .then(_=>{
                nameProviderConfig.getCounter()
                    .then(res=>{
                        expect(res).to.be.equal(value);
                        done();
                    });
            });
    });

    it('incCounter increment the counter by 1 by default', function (done) {
        const NameProviderConfig= NameProviderConfigFactory(helper.db);
        let nameProviderConfig = new NameProviderConfig();
        let initialValue = 3;
        nameProviderConfig.incCounter()
            .then(_=>{
                nameProviderConfig.getCounter()
                    .then(res=>{
                        expect(res).to.be.equal(initialValue + 1);
                        done();
                    });
            });
    });
    it('incCounter(X) increment the counter by X', function (done) {
        const NameProviderConfig= NameProviderConfigFactory(helper.db);
        let nameProviderConfig = new NameProviderConfig();
        let initialValue = 3;
        let x = 10
        nameProviderConfig.incCounter(x)
            .then(_=>{
                nameProviderConfig.getCounter()
                    .then(res=>{
                        expect(res).to.be.equal(initialValue + x);
                        done();
                    });
            });
    });




});



