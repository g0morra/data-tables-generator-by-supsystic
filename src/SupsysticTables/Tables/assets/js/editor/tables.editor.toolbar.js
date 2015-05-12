(function ($, app, undefined) {

    var getValidRange = function (range) {
        if (range === undefined) {
            return undefined;
        }

        var startRow = range.from.row,
            endRow = range.to.row,
            startCol = range.from.col,
            endCol = range.to.col;

        if (startRow > endRow) {
            startRow = range.to.row;
            endRow = range.from.row;
        }

        if (startCol > endCol) {
            startCol = range.to.col;
            endCol = range.from.col;
        }

        return {
            from: {
                col: startCol,
                row: startRow
            },
            to: {
                col: endCol,
                row: endRow
            }
        }
    };

    var toggleClass = function (editor, className) {
        var range = getValidRange(editor.getSelectedRange());

        if (range === undefined) {
            return;
        }

        for (var row = range.from.row; row <= range.to.row; row++) {
            for (var col = range.from.col; col <= range.to.col; col++) {
                var cell = $(editor.getCell(row, col));

                cell.toggleClass(className);
                editor.setCellMeta(
                    row,
                    col,
                    'className',
                    $.trim(cell.attr('class')
                            .replace('current', '')
                            .replace('area', '')
                            .replace('selected', '')
                    )
                );
            }
        }
    };

    var replaceClass = function (editor, className, replace) {
        var range = getValidRange(editor.getSelectedRange());

        if (range === undefined) {
            return;
        }

        for (var row = range.from.row; row <= range.to.row; row++) {
            for (var col = range.from.col; col <= range.to.col; col++) {
                var cell = $(editor.getCell(row, col));

                cell.removeClass(function () {
                    return replace.join(' ');
                });

                cell.addClass(className);

                editor.setCellMeta(
                    row,
                    col,
                    'className',
                    $.trim(cell.attr('class')
                        .replace('current', '')
                        .replace('area', '')
                        .replace('selected', '')
                    )
                );
            }
        }
    };

    var methods = {
        bold: function () {
            toggleClass(this.getEditor(), 'bold');

            this.getEditor().render();
        },
        italic: function () {
            toggleClass(this.getEditor(), 'italic');

            this.getEditor().render();
        },
        left: function () {
            replaceClass(this.getEditor(), 'htLeft', ['htRight', 'htCenter']);

            this.getEditor().render();
        },
        right: function () {
            replaceClass(this.getEditor(), 'htRight', ['htLeft', 'htCenter']);

            this.getEditor().render();
        },
        center: function () {
            replaceClass(this.getEditor(), 'htCenter', ['htLeft', 'htRight']);

            this.getEditor().render();
        },
        top: function () {
            replaceClass(this.getEditor(), 'htTop', ['htMiddle', 'htBottom']);

            this.getEditor().render();
        },
        middle: function () {
            replaceClass(this.getEditor(), 'htMiddle', ['htTop', 'htBottom']);

            this.getEditor().render();
        },
        bottom: function () {
            replaceClass(this.getEditor(), 'htBottom', ['htTop', 'htMiddle']);

            this.getEditor().render();
        }
    };

    var Toolbar = (function () {
        function Toolbar(toolbarId, editor) {
            var $container = $(toolbarId);

            this.getContainer = function () {
                return $container;
            };

            this.getEditor = function () {
                return editor;
            }
        }

        Toolbar.prototype.subscribe = function () {
            var self = this;

            this.getContainer().find('button, .toolbar-content > a').each(function () {
                var $button = $(this);

                if ($button.data('method') !== undefined && methods[$button.data('method')] !== undefined) {
                    var method = $button.data('method');

                    $button.on('click', function (e) {
                        e.preventDefault();

                        methods[method].apply(self);
                    });
                }
            });

            this.getContainer().find('button').each(function () {
                var $button = $(this);

                if ($button.data('toolbar') !== undefined) {
                    $button.toolbar({
                        content: $button.data('toolbar'),
                        position: 'bottom'
                    });
                }
            })
        };


        Toolbar.prototype.call = function (method) {
            if (methods[method] === undefined) {
                throw new Error('The method "' + method + '" is not exists.');
            }

            methods[method].apply(this);
        };

        return Toolbar;
    })();

    app.Editor = app.Editor || {};
    app.Editor.Toolbar = Toolbar;

}(window.jQuery, window.supsystic.Tables || {}));