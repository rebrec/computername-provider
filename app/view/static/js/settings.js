document.addEventListener('DOMContentLoaded', main);

let api;

function main() {
    api = new Api(config);
    $('#settings-button-update-template').on('click', onSettingsButtonUpdateTemplateClick);
    loadData();
}

function loadData() {
    api.getTemplate()
        .then(res=> {
            $('#settings-template-string').val(res.templateString);
            $('#settings-counter').val(res.counter);
            $('#settings-tasksequenceid').val(res.taskSequenceID);
        });
    api.getGlpiSettings()
        .then(apiSettings=> {
            $('#settings-glpi-user').val(apiSettings.user);
            $('#settings-glpi-password').val(apiSettings.password);
            $('#settings-glpi-hostname').val(apiSettings.hostname);
            $('#settings-glpi-port').val(apiSettings.port);
            $('#settings-glpi-endpoint').val(apiSettings.endpoint);
        });
}

function onSettingsButtonUpdateTemplateClick(e){
    let promises = [];
    let templateString = $('#settings-template-string').val();
    let counter = $('#settings-counter').val();
    let taskSequenceID = $('#settings-tasksequenceid').val();

    let glpiApiUser    = $('#settings-glpi-user').val();
    let glpiApiPassword = $('#settings-glpi-password').val();
    let glpiApiHostname = $('#settings-glpi-hostname').val();
    let glpiApiPort     = $('#settings-glpi-port').val();
    let glpiApiEndpoint = $('#settings-glpi-endpoint').val();
    let glpiApiSettings = {
        user: glpiApiUser,
        password: glpiApiPassword,
        hostname: glpiApiHostname,
        port: glpiApiPort,
        endpoint: glpiApiEndpoint
    };


    if (templateString.length <=0) return showError('Template String must be at least 1 character!');
    if (counter.length <=0) return showError('Counter String must be at least 1 character!');
    promises.push(api.setTemplate(templateString, counter, taskSequenceID));
    promises.push(api.setGlpiSettings(glpiApiSettings));
    Promise.all(promises)
        .then(loadData);
}

function showError(msg){
    let box = $('#settings-errorBox');
    box.html(msg);
    box.show();
    setTimeout(_=>{box.hide()},3000);
}