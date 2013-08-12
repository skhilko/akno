/*global describe, expect, it, afterEach, Prompt */
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
                expect(isVisible($('.prompt-modal'))).to.be.ok;
            });

            it('should show the overlay', function() {
                dialog = openDialog();
                expect(isVisible($('.prompt-overlay'))).to.be.ok;
            });
        });

        describe('#close()', function() {
            var dialog;

            beforeEach(function() {
                dialog = openDialog();
            });

            it('should hide the dialog', function() {
                closeDialog(dialog);
                expect(isVisible($('.prompt-modal'))).to.not.be.ok;
            });

            it('should hide the overlay', function() {
                closeDialog(dialog);
                expect(isVisible($('.prompt-overlay'))).to.not.be.ok;
                
            });
        });

        it('should clean DOM after itself on #destroy() call');
        it('should be closed on "esc" key press');
        it('should focus a first focusable element within the dialog on open');
        it('should focus the dialog element itself when there is no focusable elements within the dialog on open');
        it('should return focus to the element which had focus before on close');
    });
})();
