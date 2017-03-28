$(document).ready(function () {
    var selected = false;
    var table = $('#dataTable')
        /*.on('xhr.dt', function (e, settings, json, xhr) {
         var id = $.urlParam("selected");
         alert(id);
            if (id && id != null) {
                table.row(function (idx, data, node) {
                    return data._id === id ?
                        true : false;
                }).select();

            }
        })*/.on( 'draw.dt', function () {
        $('#dataTable tbody tr').each(function( index ) {
            console.log( index + ": " + $( this ).text() );
        });
            var id = $.urlParam("selected");
            alert(id);
            console.log( 'Redraw occurred at: '+new Date().getTime() );
        } )
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
        if (table.$('tr.selected').length) {
            $("#details").css({"display": "block"});
            var data = table.row('.selected').data();

            /*for (var item in data.details){
             var newDiv = $(document.createElement("div"));
             newDiv.addClass("box");

             if(item.type == "mail"){
             newDiv.html("ABC");
             }
             $("#details").prepend(newDiv);
             }*/
        }
    });


    $("#addDetail").click(function () {
        if (table.$('tr.selected').length != 1) return;

        /*var type = $("#addDetailOption option:selected").val();
         var newDiv = $(document.createElement("div"));
         newDiv.addClass("box");
         newDiv.html("ABC");
         if (type == "mail") {

         }
         $("#details").prepend(newDiv);*/
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