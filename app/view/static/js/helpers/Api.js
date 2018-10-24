class Api {
    constructor(config) {
        this._config = config;
    }

    getComputerlist() {
        let url = this._config.apiGetComputerlistURL;
        return new Promise((resolve, reject) =>{
            $.getJSON(url, data => {
                if (data.status !== 'success')      return reject('Failed to fetch url : ' + JSON.stringify(data));
                // if (typeof data.data.length !== 'number')   return reject('Retrieved data is not an Array! (no length property)');
                return resolve(data.data);
            });
        });
    }
    getTemplate() {
        let url = this._config.apiGetTemplateString;
        return new Promise((resolve, reject) =>{
            $.getJSON(url, data => {
                if (data.status !== 'success')      return reject('Failed to fetch url : ' + JSON.stringify(data));
                // if (typeof data.data.length !== 'number')   return reject('Retrieved data is not an Array! (no length property)');
                return resolve(data.data);
            });
        });
    }

    updateComputerInfos(infos) {
        let url = config.apiUpdateComputerInfosURL;
        let data = infos;
        return $.ajax({
            url: url,
            type: 'PUT',
            data: data
        });
    }

    addToGlpi(infos) {
        let url = config.apiAddToGlpiURL;
        let data = infos;
        return $.ajax({
            url: url,
            type: 'PUT',
            data: data
        });
    }

    setTemplate(templateString, counter, taskSequenceID) {
        let data = {
            templateString: templateString,
            counter: counter,
            taskSequenceID: taskSequenceID
        };
        let url = this._config.apiSetTemplateNameURL;
        return $.ajax({
            url: url,
            type: 'PUT',
            data: data
        });
        
        
    }
    getGlpiSettings() {
        let url = this._config.apiGetGlpiSettingsURL;
        return new Promise((resolve, reject) =>{
            $.getJSON(url, data => {
                if (data.status !== 'success')      return reject('Failed to fetch url : ' + JSON.stringify(data));
                // if (typeof data.data.length !== 'number')   return reject('Retrieved data is not an Array! (no length property)');
                return resolve(data.data);
            });
        });    }
    setGlpiSettings(settings) {
        let data = {};
        let url = this._config.apiSetGlpiSettingsURL;
        return $.ajax({
            url: url,
            type: 'PUT',
            data: settings
        });
    }
}