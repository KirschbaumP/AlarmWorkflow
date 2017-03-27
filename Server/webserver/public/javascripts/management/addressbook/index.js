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

    $('#dataTable tbody').on( 'click', 'tr', function () {
        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
        //table.row('.selected').data()
    } );



    // Edit Modal
    $('#createForm').submit(function () {
        $("#saveCreate").attr('disabled', 'disabled');
        $(this).ajaxSubmit({
            success: function (responseText, statusText, xhr, $form) {
                table.ajax.reload();
                $('#createModal').modal('hide');
                $('#createForm')[0].reset();
                $("#saveCreate").removeAttr("disabled");
            }
        });
        return false;
    });
    $("#saveCreate").click(function () {
        $("#createForm").submit();
    });


    $("#addDetail").click(function () {
        var type = $("#addDetailOption option:selected").val();
        if(type=="mail"){
            
        }
    });

    $("#test1").click(function () {
        table.ajax.reload();
    });
});