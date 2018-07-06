document.addEventListener('DOMContentLoaded', main);

let myApp = {
};
let api;



function main() {
    api = new Api(config);
    hostDataTable = new DataTable('#host-datatable');

    hostDataTable.onRemove              = onRemoveHost;
    hostDataTable.onUpdateBtnClick      = onUpdateForm;

    hostDataTable.setDataSourceURL(config.apiGetComputerlistURL);

}


function onDropDownScriptnamesChange(scriptname) {
    if (  !settingsLoaded
        && savedSettings.scriptname
        && savedSettings.scriptname !== scriptname ) return dropdownScriptnames.select(savedSettings.scriptname);

    myApp.scriptname = scriptname;
    let url = config.scriptnameListURL + '/' + scriptname;
    dropdownScriptVersions.setDataSourceURL(url)
}

function onDropDownScriptVersionsChange(scriptversion) {
    if (  !settingsLoaded
        && savedSettings.scriptversion
        && savedSettings.scriptversion !== scriptversion ) {
        return dropdownScriptVersions.select(savedSettings.scriptversion);
    }
    if (!settingsLoaded && savedSettings.scriptversion === scriptversion) settingsLoaded = true;

    myApp.scriptversion = scriptversion;
    localStorage.setItem('myApp', JSON.stringify(myApp));
    updateHostDataTable();
    updateSettingStatus();
}

function updateHostDataTable(){
    let url = config.scriptnameListURL + '/' + myApp.scriptname + '/' + myApp.scriptversion;
    api.getScriptSettings(myApp.scriptname,  myApp.scriptversion)
        .then(settings => {
            hostDataTable.setScriptSettings(settings);
            hostDataTable.setDataSourceURL(url);
        });


}

function onRemoveHost(hostname) {
    api.removeHost(hostname)
        .then(res =>{
            hostDataTable._updateDataSource();
            // Do something with the result
        });
}

function onAddTesterClick(hostname) {
    api.addTester(myApp.scriptname, myApp.scriptversion, hostname)
        .then(res => {
            updateHostDataTable();
        });
}

function onRemoveTesterClick(hostname) {
    api.removeTester(myApp.scriptname, myApp.scriptversion, hostname)
        .then(res => {
            updateHostDataTable();
        });
}

function updateSettingStatus() {
    settingStatus.setScript(myApp.scriptname, myApp.scriptversion);
}
function onUpdateForm(hostObj) {
    api.updateComputerInfos(hostObj)
        .then(res => {
            hostDataTable._updateDataSource();
        });
}