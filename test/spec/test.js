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

        function closeDialog (dialog) {
            dialog.close();
        }

        describe('#open()', function() {
            var dialog;

            afterEach(function() {
                closeDialog(dialog);
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
                closeDialog(dialog);
                dialog = openDialog();
                expect($('.prompt-overlay')).to.have.length(1);
            });
        });

        describe('#close()', function() {
            var dialog;

            beforeEach(function() {
                dialog = openDialog();
            });

            it('should hide the dialog', function() {
                closeDialog(dialog);
                expect(isVisible($('.prompt-modal'))).to.be.false;
            });

            it('should hide the overlay', function() {
                closeDialog(dialog);
                expect(isVisible($('.prompt-overlay'))).to.be.false;
            });
        });

        describe.skip('#destroy()', function() {
            // doesn't work because tests are not sandboxed
            // we have multiple prompt instances left from the previous test runs
            it('should remove overlay element from DOM', function() {
                var dialog = openDialog();
                dialog.destroy();
                expect($('.prompt-overlay')).to.be.empty(0);
            });

            it('should remove attached event handlers');
        });

        describe('behavior', function() {
            it('should be closed on "esc" key press', function() {
                openDialog();
                $(document.activeElement).simulate('keydown', {keyCode: $.simulate.keyCode.ESCAPE});
                expect(isVisible($('.prompt-modal'))).to.be.false;
            });

            it('should focus a first focusable element within the dialog on open');

            it('should focus the dialog element itself when there is no focusable elements within the dialog on open', function() {
                var dialog = openDialog();
                expect(document.activeElement).to.be.equal(dialog.element);
                closeDialog(dialog);
            });

            it('should return focus to the element which had focus before on close', function() {
                var inputInDocument = document.getElementById('doc_input');
                inputInDocument.focus();
                var dialog = openDialog();
                expect(document.activeElement).to.be.not.equal(inputInDocument);
                closeDialog(dialog);
                expect(document.activeElement).to.be.equal(inputInDocument);
            });
        });
    });
})();
