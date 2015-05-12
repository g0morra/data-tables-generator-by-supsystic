(function ($, app, undefined) {

    $(document).ready(function () {

        function initializeEditor() {
            var container = document.getElementById('tableEditor');

            return new Handsontable(container, {
                rowHeaders: true,
                colHeaders: true,
                manualColumnResize: true,
                manualRowResize: true,
                colWidths: 100,
                contextMenu: true,
                startRows: app.getParameterByName('rows') || 5,
                startCols: app.getParameterByName('cols') || 5,
                outsideClickDeselects: false
            });
        }

        function initializeTabs() {
            var $rows = $('.row-tab'),
                $buttons = $('.subsubsub .button');

            var current = $buttons.filter('.current')
                .attr('href');

            $rows.filter(current)
                .show();

            $buttons.on('click', function (e) {
                e.preventDefault();

                var $button = $(this),
                    current = $button.attr('href');

                $rows.hide();

                $buttons.filter('.current').removeClass('current');
                $button.addClass('current');
                $rows.filter(current).show();

                if (current === '#row-tab-editor') {
                    editor.render();
                } else if (current === '#row-tab-preview') {
                    var $container = $(current).find('#table-preview'),
                        $_previewTable = null;

                    saveTable.call($container).done(function () {

                        app.Models.Tables.render(app.getParameterByName('id'))
                            .done(function (response) {
                                var $preview = $(response.table);

                                if ($_previewTable !== null) {
                                    $_previewTable.destroy();
                                    console.log('table destroyed.');
                                }

                                $container.empty().append($preview);

                                $_previewTable = app.initializeTable($container.find('table'));
                            });
                    });
                }
            });
        }

        function saveTable() {
            var $loadable = $(this),
                defaultHtml = $loadable.html(),
                id = app.getParameterByName('id');

            $loadable.html(app.createSpinner());

            // Request to save settings.
            var settings = app.Models.Tables.request('saveSettings', {
                id: id,
                settings: $('form#settings').serialize()
            });

            // Request to save the table rows.
            var data = [];

            $.each(editor.getData(), function (x, rows) {
                var row = { cells: [] };

                $.each(rows, function (y, cell) {
                    var meta = editor.getCellMeta(x, y),
                        classes = [];

                    if (meta.className !== undefined) {
                        $.each(meta.className.split(' '), function (index, element) {
                            if (element.length) {
                                classes.push($.trim(element));
                            }
                        });
                    }

                    row.cells.push({ data: cell, meta: classes, width: editor.getColWidth(y) });
                });

                // Row height
                row.height = editor.getRowHeight(x);
                if (row.height === undefined || parseInt(row.height) < 10) {
                    row.height = null;
                }

                data.push(row);
            });

            var deferred = $.when(
                app.Models.Tables.setRows(id, data),
                settings
            );

            return deferred.always(function () {
                $loadable.html(defaultHtml);
            });
        }

        initializeTabs();

        var editor, tableId = app.getParameterByName('id');
        editor = initializeEditor();

        /* DEBUG */
        window.editor = editor;

        var toolbar = new app.Editor.Toolbar('#tableToolbar', editor);
        toolbar.subscribe();
        window.tb = toolbar;

        var loading = $.when(
            //app.Models.Tables.getColumns(tableId),
            app.Models.Tables.getRows(tableId)
        );

        loading.done(function (/*c,*/ response) {
            //var columns = c[0].columns,
            var rows = response.rows;
            // @todo: cleanup code
            //if (columns.length > 0) {
            //    editor.updateSettings({ colHeaders: columns });
            //}

            if (rows.length > 0) {
                var data = [], meta = [], heights = [], widths = [];

                $.each(rows, function (x, row) {
                    var cells = [];

                    heights.push(row.height);

                    $.each(row.cells, function (y, cell) {
                        cells.push(cell.data);

                        if ('meta' in cell && cell.meta !== undefined) {
                            meta.push({ row: x, col: y, className: cell.meta });
                        }

                        if (x === 0) {
                            widths.push(cell.width === undefined ? 100 : cell.width);
                        }
                    });

                    data.push(cells);
                });

                console.log(widths);

                // Height & width
                editor.updateSettings({
                    rowHeights: heights,
                    colWidths: widths
                });

                // Load extracted data.
                editor.loadData(data);

                // Load extracted metadata.
                $.each(meta, function (i, meta) {
                    editor.setCellMeta(meta.row, meta.col, 'className', meta.className.join(' '));
                });
            }

            editor.render();
        }).fail(function (error) {
            alert('Failed to load table data: ' + error);
        }).always(function () {
            $('#loadingProgress').remove();
        });

        $('#buttonSave').on('click', function () {
            saveTable.call(this).fail(function (error) {
                alert('Failed to save table data: ' + error);
            });
        });

        $('#buttonDelete').on('click', function () {
            var $button = $(this),
                html = $button.html();

            if (!confirm('Are you sure?')) {
                return;
            }

            // Do loading animation inside the button.
            $button.html(app.createSpinner());

            app.Models.Tables.remove(app.getParameterByName('id'))
                .done(function () {
                    window.location.href = $('#menuItem_tables').attr('href');
                })
                .fail(function (error) {
                    alert('Failed to delete table: ' + error);
                })
                .always(function () {
                    $button.html(html);
                });
        });

        $('.table-title[contenteditable]').on('keydown', function (e) {
            if (!('keyCode' in e) || e.keyCode !== 13) {
                return;
            }

            var $heading = $(this),
                title = $heading.text();

            $heading.removeAttr('contenteditable')
                .html(app.createSpinner());

            app.Models.Tables.rename(app.getParameterByName('id'), title)
                .done(function () {
                    $heading.text(title);
                    $heading.attr('data-table-title', title);
                })
                .fail(function (error) {
                    $heading.text($heading.attr('data-table-title'));
                    alert('Failed to rename table: ' + error);
                });
        });
    });

}(window.jQuery, window.supsystic.Tables));