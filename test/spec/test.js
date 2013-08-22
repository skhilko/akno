/*global describe, expect, it, afterEach, beforeEach, Prompt */
// jshint expr: true
'use strict';
(function () {
    describe('Prompt', function () {
        var dialog;

        function isVisible (el) {
            return el.css('visibility') !== 'hidden';
        }

        function openDialog (id, options) {
            var prompt = new Prompt(document.getElementById(id), options);
            prompt.open();

            return prompt;
        }

        describe('#open()', function() {
            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('should show the dialog', function() {
                dialog = openDialog('modal_no_inputs');
                expect(isVisible($('.prompt-modal'))).to.be.true;
            });

            it('should show the overlay', function() {
                dialog = openDialog('modal_no_inputs');
                expect(isVisible($('.prompt-overlay'))).to.be.true;
            });

            it('reuses the overlay element for multiple prompt instances', function() {
                dialog = openDialog('modal_no_inputs');
                dialog.close();

                var oneMoreDialog = openDialog('modal_no_inputs');
                expect($('.prompt-overlay').length).to.be.equal(1);
                oneMoreDialog.destroy();
            });
        });

        describe('#close()', function() {
            beforeEach(function() {
                dialog = openDialog('modal_no_inputs');
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

            it('should cleanup "service" classes', function() {
                var dialog = openDialog('modal_no_inputs');
                dialog.destroy();
                expect(document.getElementById('modal_no_inputs').classList.contains('prompt-state-visible')).to.be.false;
                expect(document.getElementById('modal_no_inputs').classList.contains('prompt-fx-scale-up')).to.be.false;
            });

            it('should erase the reference to dom element', function() {
                var dialog = openDialog('modal_no_inputs');
                dialog.destroy();
                expect(dialog.element).to.not.exist;
            });

            it('should remove overlay element from DOM', function() {
                var dialog = openDialog('modal_no_inputs');
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

                var dialog = openDialog('modal_no_inputs');
                dialog.destroy();
                $('#modal_1').simulate('keydown', {keyCode: $.simulate.keyCode.ESCAPE});
                $('#modal_1_close').simulate('click');

                Prompt.prototype.close = oldClose;
            });
        });

        describe('focus', function() {
            afterEach(function() {
                dialog.destroy();
            });

            it('should be given to the first tabbable element within the dialog on open', function() {
                var anchorElement = document.getElementById('modal_anchor');
                dialog = openDialog('modal_with_inputs');
                expect(document.activeElement).to.be.equal(anchorElement);
                dialog.close();
            });

            it('should be given to the first element with "autofocus" attribute within the dialog on open', function() {
                document.getElementById('modal_input_2').autofocus = true;

                var elementWithAutofocus = document.getElementById('modal_input_2');
                dialog = openDialog('modal_with_inputs');
                expect(document.activeElement).to.be.equal(elementWithAutofocus);
                dialog.close();

                document.getElementById('modal_input_2').autofocus = false;
            });

            it('should be given to the dialog element when there is no focusable elements within the dialog', function() {
                dialog = openDialog('modal_no_inputs');
                expect(document.activeElement).to.be.equal(dialog.element);
                dialog.close();
            });

            it('should be returned to the previously focused element on dialog close', function() {
                var inputInDocument = document.getElementById('doc_input');
                inputInDocument.focus();
                dialog = openDialog('modal_no_inputs');
                expect(document.activeElement).to.be.not.equal(inputInDocument);
                dialog.close();
                expect(document.activeElement).to.be.equal(inputInDocument);
            });

            it('should be removed from the dialog on close even if there was no explicitly focused element on open', function() {
                var lastActiveElement = document.activeElement;
                dialog = openDialog('modal_no_inputs');
                expect(document.activeElement).to.be.not.equal(lastActiveElement);
                dialog.close();
                expect(document.activeElement).to.be.not.equal(dialog.element);
            });
        });

        describe('default initialization option', function() {
            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('should be applied when an initialization option is not supplied', function() {
                dialog = openDialog('modal_no_inputs');
                expect(document.getElementById('modal_no_inputs').classList.contains('prompt-fx-scale-up')).to.be.true;
            });

            it('should not override a supplied initialization option', function() {
                dialog = openDialog('modal_no_inputs', {effect: 'slide-in-right'});
                expect(document.getElementById('modal_no_inputs').classList.contains('prompt-fx-scale-up')).to.be.false;
                expect(document.getElementById('modal_no_inputs').classList.contains('prompt-fx-slide-in-right')).to.be.true;
            });
        });

        describe('behavior', function() {
            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('should be closed on "esc" key press', function() {
                dialog = openDialog('modal_no_inputs');
                $(document.activeElement).simulate('keydown', {keyCode: $.simulate.keyCode.ESCAPE});
                expect(isVisible($('.prompt-modal'))).to.be.false;
            });
        });
    });
})();
