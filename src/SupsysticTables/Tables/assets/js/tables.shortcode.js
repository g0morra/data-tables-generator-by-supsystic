(function ($, app) {

    $(document).ready(function () {
        var $tables = $('.supsystic-table');

        $tables.each(function () {
            app.initializeTable(this);
        });
    });

}(window.jQuery, window.supsystic.Tables));