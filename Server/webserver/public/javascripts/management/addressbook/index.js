$(document).ready(function () {
    var table = $('#dataTable').DataTable({
        "ajax": "/management/addressbook/list",
        "columns": [
            {"data": "nachname"},
            {"data": "vorname"},
            {"data": "buttons", "orderable": false, "width": "240px"}
        ],
        "paging": false,
        "info": false,
        "language": {
            "url": "/static/javascripts/dataTable.german.json"
        }
    });


    // Edit Modal
    $('#createForm').submit(function () {
        $(this).ajaxSubmit({
            success: function (responseText, statusText, xhr, $form) {
                table.ajax.reload();
                $('#createModal').modal('hide');
                $('#createForm')[0].reset();
            }
        });
        return false;
    });
    $("#saveCreate").click(function () {
        $("#createForm").submit();
    });
});