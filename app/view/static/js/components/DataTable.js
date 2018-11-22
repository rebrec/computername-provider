class DataTable {
    constructor(container, opt) {
        this._containerSelector = container;
        this.opt = opt || {};
        this._DOMContainer = document.querySelector(this._containerSelector);
        if (!this._DOMContainer) throw ('Fail to retrieve container with selector : "' + this._containerSelector + '".');
        this._datasourceURL = null;
        this._datasourceCache = null;
        this.onRemove = function () {
        };
        this.onRemoveTesterClick = function () { 
        };
        this.onUpdateBtnClick = function () {
        };
        this.onManualAdd = function () {};
        this.onAddTesterClick = function () {
        };
        this._sortedKey = 'hostname'
        this._sortAscending = true;
        this._scriptSettings = {testers: []};
        this._columns = [
            {title: 'Serial', property: 'serial'},
            {title: 'Hostname', property: 'hostname'},
            {title: 'TaskSequenceId', property: 'taskSequenceID'},
            {title: 'Domain', property: 'domainJoin'}
        ];
        this._patchedColumns = []; //['ipaddresses', 'username']; // columns that will be copied frop additionnalData, to parent object
        this._scriptSettings = {
            testers: ['PC1706-055']
        }
    }

    setDataSourceURL(url) {
        this._datasourceURL = url;
        return this._updateDataSource()
    }


    _updateDataSource() {
        return new Promise((resolve, reject) => {
            $.getJSON(this._datasourceURL, data => {
                if (data.status !== 'success')      return reject('Failed to fetch url : ' + JSON.stringify(data));
                if (typeof data.data.length !== 'number')   return reject('Retrieved data is not an Array! (no length property)');

                this._datasourceCache = data.data;
                return resolve();
            });
        })
            .then(this._build.bind(this));
    }

    _sortDatasourceCache() {
        this._datasourceCache.sort((a, b)=> {
            let res;
            if (this._sortAscending) {
                res = (a[this._sortedKey] < b[this._sortedKey]) ? 1 : -1;
            } else {
                res = (a[this._sortedKey] < b[this._sortedKey]) ? -1 : 1;
            }
            return res;
        })
    }

    _sort(sortedKey) {
        if (!sortedKey || sortedKey === this._sortedKey) {
            this._sortAscending = !this._sortAscending;
        } else {
            this._sortedKey = sortedKey;
            this._sortAscending = true;
        }
        this._build();
    }

    _patchDatasourceCache() { // used temporarily to place additionnaldata.ipaddresses within hostobj (one level up)
        // because every column need to be withing hostobj and not hostobj.additionnalData.something
        for (let i = 0; i < this._datasourceCache.length; i++) {
            let obj = this._datasourceCache[i];
            for (let j = 0; j < this._patchedColumns.length; j++) {
                let patchedColumn = this._patchedColumns[j];
                obj[patchedColumn] = '';
                if (obj.additionnalData && obj.additionnalData[patchedColumn]) obj[patchedColumn] = obj.additionnalData[patchedColumn];
            }

        }
    }

    _build() {
        this._sortDatasourceCache();
        let c = this._DOMContainer;
        let html = '';

        html += '<div class="row">';
        // html += '    <div class="col-sm-3"><h2>';
        // html += '        Executed : ' + executed.length;
        // html += '    </h2></div>';
        // html += '    <div class="col-sm-3"><h2>';
        // html += '        Testers : ' + this._scriptSettings.testers.length
        // html += '    </h2></div>';
        // html += '    <div class="col-sm-3"><h2>';
        // html += '        Total : ' + this._datasourceCache.length;
        // html += '    </h2></div>';
        // html += '    <div class="col-sm-2">';
        // html += '    </div>';
        html += '    <div class="col-sm-1">';
        html += '        <span style="font-size:1.5rem" class="fa fa-refresh datable-refresh-btn right"></span>';
        html += '    </div>';
        html += '</div>';
        // Header
        html += '<table class="col-12">';
        html += '   <thead>';
        html += '      <tr>';
        for (let i = 0; i < this._columns.length; i++) {
            let column = this._columns[i];
            html += '         <td class="datatable-_sort-btn" data-columnname="' + column.property + '"><b>';
            html += '       ' + column.title;
            html += '         </b></td>';
        }
        html += '         <td><b>';
        html += '       ' + 'Actions';
        html += '         </b></td>';
        html += '      </tr>';
        html += '   </thead>';

        html += '   <tbody id="accordion">';
        html += '   </tbody>';
        html += '</table>';
        ////////////////////////////////////// MODAL
        html += '<div class="modal fade" id="modalUpdateForm" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
        html += '    <div class="modal-dialog" role="document">';
        html += '            <div class="modal-content">';
        html += '            <div class="modal-header text-center">';
        html += '            <h4 class="modal-title w-200 font-weight-bold">Update</h4>';
        html += '            <button type="button" class="close" data-dismiss="modal" aria-label="Close">';
        html += '            <span aria-hidden="true">&times;</span>';
        html += '        </button>';
        html += '        </div>';
        html += '        <div class="modal-body mx-3">';
        html += '            <div class="md-form mb-5">';
        html += '            <i class="fa fa-server prefix grey-text"></i>';
        html += '            <label data-error="wrong" data-success="right" for="defaultForm-hostname">Hostname</label>';
        html += '            <input type="text" id="defaultForm-hostname" class="form-control validate">';
        html += '        </div>';
        html += '';
        html += '        <div class="md-form mb-4">';
        html += '            <i class="fa fa-lock prefix grey-text"></i>';
        html += '            <label data-error="wrong" data-success="right" for="defaultForm-serial">Serial</label>';
        html += '            <input type="text" id="defaultForm-serial" class="form-control validate">';
        html += '        </div>';
        html += '            <input type="hidden" id="defaultForm-hostobj" class="form-control validate">';

        html += '';
        html += '        </div>';
        html += '        <div class="modal-footer d-flex justify-content-center">';
        html += '            <button id=defaultForm-update-btn class="btn btn-default">Update</button>';
        html += '        </div>';
        html += '    </div>';
        html += '  </div>';
        html += ' </div>';
        //////////////////////////////////////////// MODAL ////////////////////////////////////////////////////////

        // Rows
        c.innerHTML = html;

        let accordion = $('#accordion');
        for (let i = 0; i < this._datasourceCache.length; i++) {
            let hostObj = this._datasourceCache[i];
            let panelSelector = hostObj.hostname;
            let tr = $('<tr class="highlightable bottom-line"></tr>').data('hostobj', hostObj);
            let trBody = '';
            for (let j = 0; j < this._columns.length; j++) {
                let column = this._columns[j];
                trBody += '         <td>';
                trBody += '       ' + hostObj[column.property];
                trBody += '         </td>';
            }

            // ACTIONS
            trBody += '                    <td class="">';
            trBody += '                       <table>';
            trBody += '                           <tr>';
            trBody += '                              <td>';
            trBody += '                                <span class="fa fa-refresh datatable-update-btn" title="Modify" data-toggle="modal" data-target="#modalUpdateForm"></span>';
            trBody += '                              </td>';
            trBody += '                              <td>';
            trBody += '                                <span class="fa fa-arrow-right datatable-manual-add-btn" title="Add To GLPI"></span>';
            trBody += '                              </td>';
            trBody += '                              <td>';
            trBody += '                               <span class="fa fa-remove datatable-remove-btn" title="Remove"></span>';
            trBody += '                              </td>';
            trBody += '                           </tr>';
            trBody += '                       </table>';
            trBody += '                    </td>';
            tr.append(trBody);
            accordion.append(tr);
            // accordion.append(this._buildDetailPanel(panelSelector, hostObj));
            // if (i>4)break;
        }

        // html += '   </tbody>';
        // html += '</table>';


        let selectSelector = '.datatable-remove-btn';
        let selectNode = $(selectSelector);
        selectNode.on('click', this._onRemoveBtnClick.bind(this));
        $('.datatable-_sort-btn').on('click', this._sortBtnClick.bind(this));
        $('.datatable-update-btn').on('click', this._updateBtnClick.bind(this));
        $('.datatable-manual-add-btn').on('click', this._manualAddBtnClick.bind(this));
        $('#defaultForm-update-btn').on('click', this._defaultFormUpdateBtnClick.bind(this));
        $('.datable-refresh-btn').on('click', this._updateDataSource.bind(this));

    }

    _buildDetailPanel(panelSelector, hostObj) {
        let additionalData = hostObj.additionnalData || {};
        if (Object.keys(additionalData).length === 0) return '';
        let html = '';

        html += '<tr class="panel">'; // parent class needed
        html += '  <td  colspan="42" class="collapse" id="' + panelSelector + '">';
        html += '    <div class="row datatable-additionaldata-panel" >';

        let keys = Object.keys(additionalData);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = additionalData[key];
            html += '<div class="col-sm-1"></div>';
            html += '<div class="col-sm-3 datatable-additionnaldata-key">' + key + '</div>';
            html += '<div class="col-sm-8 datatable-additionnaldata-value">';

            if ((key === 'logs') && value.hasOwnProperty('length')) {
                html += '<div class="datatable-additionnaldata-logs">';
                for (let j = 0; j < value.length; j++) {
                    html += '   ' + value[j] + '<br/>';
                }
                html += '</div>';
            } else {
                html += '   ' + value;
            }

            html += '</div>';
            // break;
        }
        html += '   </div>';
        html += '  </td>';
        html += '</tr>';
        return html;
    }

    _onRemoveBtnClick(e) {
        let hostname = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode).data('hostobj').hostname;
        this.onRemove(hostname);
    }

    _sortBtnClick(e) {
        let selectedCol = $(e.target.parentNode).data('columnname');
        console.log('col : ' + selectedCol);
        this._sort(selectedCol);
    }

    _updateBtnClick(e) {
        let hostObj = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode).data('hostobj');
        $('#defaultForm-hostname').val(hostObj.hostname);
        $('#defaultForm-serial').val(hostObj.serial);
        $('#defaultForm-hostobj').data('hostobj', hostObj);
        
    }
    _manualAddBtnClick(e) {
        let hostObj = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode).data('hostobj');
        this.onManualAdd(e, hostObj);
    }
    _defaultFormUpdateBtnClick(e) {
        let hostObj  = $('#defaultForm-hostobj').data('hostobj');
        let hostname = $('#defaultForm-hostname').val();
        let serial   = $('#defaultForm-serial').val();
        if  (hostname.length <= 0  && serial.length <= 0) throw "Empty string are not allowed";
        hostObj.hostname = hostname;
        hostObj.serial = serial;
        this.onUpdateBtnClick(hostObj);
    }
    
    _onRemoveTesterClick(e) {
        let hostname = $(e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode).data('hostobj').hostname;
        this.onRemoveTesterClick(hostname);
    }

}
