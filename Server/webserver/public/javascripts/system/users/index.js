$(document).ready(function () {
    var table = $('#dataTable').DataTable({
        "ajax": "/system/users/ajax/users",
        "columns": [
            {"data": "username"},
            {"data": "admin"},
            {"data": "buttons", "orderable": false, "width": "240px"}
        ],
        "paging": false,
        "info": false,
        "language": {
            "url": "/static/javascripts/dataTable.german.json"
        }
    });
    $('#dataTable tbody').on('click', 'button', function () {
        var data = table.row($(this).parents('tr')).data();
        if ($(this).hasClass("edit")) {
            $("#editId").val(data.id);
            $('#editModal').modal('show');
        }
        else {

        }
    });


    // Edit Modal
    $('#editForm').submit(function () {
        $(this).ajaxSubmit({
            success: function (responseText, statusText, xhr, $form) {
                table.ajax.reload();
                $('#editModal').modal('hide');
                $('#editForm')[0].reset();
            }
        });
        return false;
    });
    $("#editInputPassword").on('input', function (e) {
        if ($(this).val().length >= 6) {
            $("#saveEdit").removeAttr("disabled");
        }
        else {
            $("#saveEdit").attr("disabled", "disabled");
        }
    });
    $("#saveEdit").click(function () {
        $("#editForm").submit();
    });
    $('#editModal').on('hidden.bs.modal', function (e) {
        $("#editForm")[0].reset();
    })


    // Create Modal
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

    var uniqueUsername = false;
    var createActive = function () {
        if ($("#createInputPassword").val().length >= 6 && uniqueUsername) {
            $("#saveCreate").removeAttr("disabled");
        }
        else {
            $("#saveCreate").attr("disabled", "disabled");
        }
    }
    $("#createInputPassword").on('input', function (e) {
        createActive();
    });
    $("#createInputUsername").on('input', function (e) {
        if ($(this).val().length >= 5) {
            $.ajax({
                url: "/system/users/check/username/" + $(this).val(),
            }).done(function (data) {
                uniqueUsername = data.count == 0;
                createActive();
            });
        }
        else {
            uniqueUsername = false;
            $("#saveCreate").attr("disabled", "disabled");
        }
    });
    $("#saveCreate").click(function () {
        $("#createForm").submit();
    });
    $('#createModal').on('hidden.bs.modal', function (e) {
        $("#createForm")[0].reset();
        uniqueUsername = false;
    })

    //disable link
    $("a").on("click", function(event){
        if ($(this).is("[disabled]")) {
            event.preventDefault();
        }
    });
});