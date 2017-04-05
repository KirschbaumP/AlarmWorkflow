$(document).ready(function () {
    var selected = false;
    var table = $('#dataTable')
        .on('draw.dt', function () {
            var id = $.urlParam("selected");
            if (id && id != null) {

                $('#dataTable tbody tr').each(function (index) {
                    var rowData = table.row(this).data();
                    if (rowData && rowData != null) {
                        if (rowData._id == id) {
                            table.$('tr.selected').removeClass('selected');
                            $(this).addClass("selected");
                            showDetails();
                        }
                    }
                });
            }
        })
        .DataTable({
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
    $("#details").css({"display": "none"});

    var showDetails = function () {
        if (table.$('tr.selected').length) {
            $("#details").css({"display": "block"});
            var data = table.row('.selected').data();
            console.log(data);

            for(var i in data.details.mail){
                console.log(data.details.mail[i]);

            }

            /*for (var item in data.details){
             var newDiv = $(document.createElement("div"));
             newDiv.addClass("box");

             if(item.type == "mail"){
             newDiv.html("ABC");
             }
             $("#details").prepend(newDiv);
             }*/
        }
    };

    $('#dataTable tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            var href = window.location.href.substring(0, window.location.href.indexOf('?'));
            window.history.pushState('', window.title, href);
        } else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');

            var data = table.row('.selected').data();
            var str = replaceQueryParam('selected', data._id, window.location.search);
            var href = window.location.href.substring(0, window.location.href.indexOf('?'));
            window.history.pushState('', window.title, href + str);
        }

        $("#details").css({"display": "none"});
        showDetails();

    });

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

    $("#test1").click(function () {
        console.log(table.$('tr.selected').data());
        table.ajax.reload();
    });
});