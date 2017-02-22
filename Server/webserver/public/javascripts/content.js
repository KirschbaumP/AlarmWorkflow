$(document).ready(function () {
    $("#navbarCollapse a").each(function (index, item) {
        if ($(this).hasClass("nav-link") && !$(this).hasClass("dropdown-toggle")) {
            if ($(this).attr("href") == window.location.pathname) {
                $(this).addClass("active");
            }
        }
        else if ($(this).hasClass("dropdown-item")) {
            if ($(this).attr("href") == window.location.pathname) {
                $(this).parent().parent().children("a.dropdown-toggle").addClass("active");
                $(this).addClass("active");
            }
        }
    });
});