/*global describe, expect, it, afterEach, beforeEach, Prompt */
// jshint expr: true
'use strict';
(function () {
    describe('Prompt', function () {

        function isVisible (el) {
            return el.css('visibility') !== 'hidden';
        }

        function openDialog () {
            var prompt = new Prompt(document.getElementById('modal_1'));
            prompt.open();

            return prompt;
        }

        describe('#open()', function() {
            var dialog;

            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('should show the dialog', function() {
                dialog = openDialog();
                expect(isVisible($('.prompt-modal'))).to.be.true;
            });

            it('should show the overlay', function() {
                dialog = openDialog();
                expect(isVisible($('.prompt-overlay'))).to.be.true;
            });

            it('reuses the overlay element for multiple prompt instances', function() {
                dialog = openDialog();
                dialog.close();

                var oneMoreDialog = openDialog();
                expect($('.prompt-overlay').length).to.be.equal(1);
                oneMoreDialog.destroy();
            });
        });

        describe('#close()', function() {
            var dialog;

            beforeEach(function() {
                dialog = openDialog();
            });

            afterEach(function() {
                dialog.destroy();
            });

            it('should hide the dialog', function() {
                dialog.close();
                expect(isVisible($('.prompt-modal'))).to.be.false;
            });

            it('should hide the overlay', function() {
                dialog.close();
                expect(isVisible($('.prompt-overlay'))).to.be.false;
            });
        });

        describe('#destroy()', function() {
            var dialog;
            beforeEach(function() {
                dialog = openDialog();
            });

            it('should remove overlay element from DOM', function() {
                dialog.destroy();
                expect($('.prompt-overlay').length).to.be.equal(0);
            });

            it('should remove attached event handlers', function() {
                // Close method is executed in the handlers which should be removed on destroy.
                // Overwriting the method to add an assertion.
                var oldClose = Prompt.prototype.close;
                Prompt.prototype.close = function() {
                    oldClose.call(this);
                    // intentionaly failing the test
                    expect(false, 'event is not removed').to.be.true;
                };

                dialog.destroy();
                $('#modal_1').simulate('keydown', {keyCode: $.simulate.keyCode.ESCAPE});
                $('#modal_1_close').simulate('click');

                Prompt.prototype.close = oldClose;
            });
        });

        describe('behavior', function() {
            var dialog;
            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('should be closed on "esc" key press', function() {
                dialog = openDialog();
                $(document.activeElement).simulate('keydown', {keyCode: $.simulate.keyCode.ESCAPE});
                expect(isVisible($('.prompt-modal'))).to.be.false;
            });

            it('should focus a first focusable element within the dialog on open');

            it('should focus the dialog element itself when there is no focusable elements within the dialog on open', function() {
                dialog = openDialog();
                expect(document.activeElement).to.be.equal(dialog.element);
            });

            it('should return focus to the element which had focus before on close', function() {
                var inputInDocument = document.getElementById('doc_input');
                inputInDocument.focus();
                dialog = openDialog();
                expect(document.activeElement).to.be.not.equal(inputInDocument);
                dialog.close();
                expect(document.activeElement).to.be.equal(inputInDocument);
            });
        });
    });
})();
