$(document).ready(function () {
    var table = $('#dataTable').DataTable({
        "ajax": "/system/jobs/list",
        "columns": [
            {"data": "job"},
            {"data": "buttons", "orderable": false, "width": "240px"}
        ],
        "paging": false,
        "info": false,
        "language": {
            "url": "/static/javascripts/dataTable.german.json"
        }
    });
});