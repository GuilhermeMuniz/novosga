/**
 * Novo SGA - Install
 * @author rogeriolino
 */
var SGA = SGA || {};

SGA.Install = {

    stepKey: '',
    pageKey: '',
    currStep: 0,
    totalSteps: 0,
    adapter: '',
    dbData: {},
    adminData: {},
    isMigration: false,
    
    prevStep: function() {
        if (SGA.Install.currStep > 0) {
            SGA.Install.gotoStep(SGA.Install.currStep - 1);
        }
        return false;
    },
    
    nextStep: function() {
        switch (SGA.Install.currStep) { 
        case 0: // database choise
            SGA.Install.setDatabaseAdapter();
            break;
        case 4: // set admin
            if (!SGA.Install.isMigration) {
                SGA.Install.setAdminData();
            } else {
                SGA.Install.gotoStep(SGA.Install.currStep + 1);
            }
            break;
        default:
            if (SGA.Install.currStep < SGA.Install.totalSteps) {
                SGA.Install.gotoStep(SGA.Install.currStep + 1);
            }
        }
    },
    
    gotoStep: function(step) {
        window.location = SGA.Install.mountUrl(step);
    },
    
    mountUrl: function(step, page) {
        var url = window.location.pathname + '?' + SGA.Install.stepKey + '=' + step;
        if (page) {
            url += '&' + SGA.Install.pageKey + '=' + page;
        }
        return url;
    },
    
    chooseAdapter: function(id) {
        var radio = $('#' + id);
        var list = $('ul.adapters li');
        list.removeClass('ui-state-highlight');
        list.addClass('ui-state-default');
        if (radio.prop('checked')) {
            var checked = $('ul.adapters li#adapter-' + id);
            checked.removeClass('ui-state-default');
            checked.addClass('ui-state-highlight');
            if (SGA.Install.adapter == '') {
                $('#btn_next').button("enable");
            }
            SGA.Install.adapter = id;
        }
    },
    
    setDatabaseAdapter: function() {
        $.ajax({
            type: 'post',
            data: {adapter: SGA.Install.adapter},
            dataType: 'json',
            url: SGA.Install.mountUrl(SGA.Install.currStep, 'set_adapter'),
            success: function(response) {
                if (response.success) {
                    SGA.Install.gotoStep(SGA.Install.currStep + 1);
                } else {
                    alert(response.message);
                }
            },
            error: function() {
                alert('Erro ao escolher banco de dados');
            }
        });
    },
    
    changeAcceptLicense: function() {
        if ($('#check_license').prop('checked')) {
            $('#btn_next').button("enable");
        } else {
            $('#btn_next').button("disable");
        }
    },
    
    testDB: function() {
        SGA.Install.saveDatabaseData(); // updating dbData

        $('#step_3 input').prop('disabled', true);
        $('#db_test_success, #db_test_error').hide();
        
        $.ajax({
            type: 'post',
            data: SGA.Install.dbData,
            dataType: 'json',
            url: SGA.Install.mountUrl(SGA.Install.currStep, 'test_db'),
            success: function(test) {
                SGA.Install.onTestDBResult(test);
                $('#step_3 input').prop('disabled', false);
            },
            error: function() {
                $('#db_test_error').show();
                $('#db_test_error').text('Erro ao testar conexão');
                $('#step_3 input').prop('disabled', false);
            }
        });
    },
    
    onTestDBResult: function(test) {
        var selector;
        if (test.success) {
            selector = 'db_test_success';
            $('#btn_next').button('enable');
        } else {
            selector = 'db_test_error';
            $('#btn_next').button('disable');
        }
        $('#' + selector).show();
        $('#' + selector + ' p').text(test.message);
    },
    
    onChangeData: function() {
        $('#btn_next').button('disable');
    },
    
    saveDatabaseData: function() {
        for (var i in SGA.Install.dbData) {
            var input = document.getElementById(i);
            if (input) {
                SGA.Install.dbData[i] = input.value;
            }
        }
    },

    loadDatabaseData: function() {
        for (var i in SGA.Install.dbData) {
            var input = document.getElementById(i);
            if (input) {
                input.value = SGA.Install.dbData[i];
            }
        }
        $('#db_host').focus();
    },
        
    setAdminData: function() {
        $('#db_admin_error').hide();
        $('#btn_next').button('disable');
        SGA.Install.saveAdminData(); // updating adminData
        $.ajax({
            type: 'post',
            data: SGA.Install.adminData,
            dataType: 'json',
            url: SGA.Install.mountUrl(SGA.Install.currStep, 'set_admin'),
            success: function(test) {
                if (test.success) {
                    SGA.Install.gotoStep(SGA.Install.currStep + 1);
                } else {
                    $('#db_admin_error').show();
                    $('#db_admin_error p').text(test.message);
                }
                $('#btn_next').button('enable');
            },
            error: function() {
                $('#db_admin_error').show();
                $('#db_admin_error p').text('Erro ao salvar dados do admin');
            }
        });
    },
    
    saveAdminData: function() {
        for (var i in SGA.Install.adminData) {
            var input = document.getElementById(i);
            if (input) {
                SGA.Install.adminData[i] = input.value;
            }
        }
    },

    loadAdminData: function() {
        for (var i in SGA.Install.adminData) {
            var input = document.getElementById(i);
            if (input) {
                input.value = SGA.Install.adminData[i];
            }
        }
        $('#nm_usu').focus();
    },
    
    doInstall: function() {
        $('#btn_install_final').button('disable');
        $('#install-loading').show();
        $('#install_success, #install_error').hide();
        SGA.Install.saveAdminData(); // updating adminData
        $.ajax({
            type: 'post',
            data: SGA.Install.adminData,
            dataType: 'json',
            url: SGA.Install.mountUrl(SGA.Install.currStep, 'do_install'),
            success: function(test) {
                var selector;
                $('#btn_install_final').button('enable');
                if (test.success) {
                    $('#btn_redirect').show();
                    $('#btn_install_final').hide();
                    selector = 'install_success';
                } else {
                    selector = 'install_error';
                }
                $('#' + selector).show();
                $('#' + selector + ' p').text(test.message);
            },
            error: function() {
                alert('Erro ao instalar o SGA');
                $('#btn_install_final').button('enable');
            },
            complete: function() {
                $('#install-loading').hide();
            }
        });
    }
    
};
