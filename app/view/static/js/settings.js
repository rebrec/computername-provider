document.addEventListener('DOMContentLoaded', main);

let api;

function main() {
    api = new Api(config);
    $('#settings-button-update-template').on('click', onSettingsButtonUpdateTemplateClick);
    loadData();
}

function loadData(){
    api.getTemplate()
        .then(res=>{
            $('#settings-template-string').val(res.templateString);
            $('#settings-counter').val(res.counter);
        });

}

function onSettingsButtonUpdateTemplateClick(e){
    let templateString = $('#settings-template-string').val();
    let counter = $('#settings-counter').val();
    
    if (templateString.length <=0) return showError('Template String must be at least 1 character!');
    if (counter.length <=0) return showError('Counter String must be at least 1 character!');
    api.setTemplate(templateString, counter)
        .then(loadData);
}

function showError(msg){
    let box = $('#settings-errorBox');
    box.html(msg);
    box.show();
    setTimeout(_=>{box.hide()},3000);
}