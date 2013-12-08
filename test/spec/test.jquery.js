/*global describe, expect, it */
// jshint expr: true
'use strict';
(function () {
    describe('Akno jQuery Plugin', function () {
        function isVisible (el) {
            return el.css('visibility') !== 'hidden';
        }

        /**
         * Opens the dialog.
         * Due to css transitions used on dialog open, we have to use an async callback to proceed with test assertions.
         */
        function openDialog (el, options, callback) {
            if(typeof options === 'function') {
                callback = options;
                options = null;
            }

            el.akno(options)
                .one('akno-open', function() {
                    if (callback) {
                        callback();
                    }
                });
        }

        describe('Plugin API', function() {
            var element;
            it('should show the dialog on "open" call', function(done) {
                element = $('#modal_no_inputs');
                openDialog(element, {open: false}, function() {
                    expect(isVisible($('.akno-modal'))).to.be.true;
                    done();
                });

                element.akno('open');
            });

            it('should hide the dialog on "close" call', function() {
                element.akno('close');
                expect(isVisible($('.akno-modal'))).to.be.false;
            });
        });
    });
})();
