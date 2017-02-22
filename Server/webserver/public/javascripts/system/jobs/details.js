$(document).ready(function () {
    var table = $('#logTable').DataTable({
        "ajax": "/system/jobs/log/" + jobLogName,
        "columns": [
            {"data": "time", "width": "240px", "order": "asc"},
            {"data": "level", "width": "100px"},
            {"data": "message"}
        ],
        "order": [[0, 'desc']],
        "paging": true,
        "info": false,
        "language": {
            "url": "/static/javascripts/dataTable.german.json"
        }
    });
    $("#saveModal").modal({
        'show': false,
        'keyboard': false,
        'backdrop': 'static'
    });
    $("#alertSavedSuccess").css("display", "none");
    $('#job-settings-form').submit(function () {
        $("#saveModal").modal('show');
        $(this).ajaxSubmit({
            success: function (responseText, statusText, xhr, $form) {
                $("#saveModal").modal('hide');
                $("#alertSavedSuccess").fadeIn("slow");
                setTimeout(function () {
                    $("#alertSavedSuccess").fadeOut("slow");
                }, 4000);
            }
        });
        return false;
    });
    $('#job-settings-form .form-control').on('input', function () {
        var input = $(this);
        var value = input.val();
        var setting = input.attr("name");
        if (input.attr("type") == "password") {
            var gr = input.attr("gr");
            var row = $("#row-" + gr);
            var pw1 = $("#" + gr);
            var pw2 = $("#" + gr + "-repetition");
            if (pw1.val() == pw2.val()) {
                pw2.removeClass("form-control-danger");
                pw2.addClass("form-control-success");
                row.removeClass("has-danger");
                row.addClass("has-success");
            }
            else {
                pw2.removeClass("form-control-success");
                pw2.addClass("form-control-danger");
                row.removeClass("has-success");
                row.addClass("has-danger");
            }
            return;
        }
        $.get("/system/jobs/check", {value: value, setting: setting, job: jobFileName}).done(function (data) {
            if (data.result != "error") {
                var element = $("#" + data.setting);
                var row = $("#row-" + data.setting);
                if (data.result) {
                    element.removeClass("form-control-danger");
                    element.addClass("form-control-success");
                    row.removeClass("has-danger");
                    row.addClass("has-success");
                }
                else {
                    element.removeClass("form-control-success");
                    element.addClass("form-control-danger");
                    row.addClass("has-danger");
                    row.removeClass("has-success");
                }
            }
        });
    });
});