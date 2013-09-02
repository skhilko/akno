/*global describe, expect, it, afterEach, beforeEach, Prompt */
// jshint expr: true
'use strict';
(function () {
    describe('Prompt', function () {
        var dialog;

        function isVisible (el) {
            return el.css('visibility') !== 'hidden';
        }

        /**
         * Opens the dialog.
         * Due to css transitions used on dialog open, we have to use an async callback to proceed with test assertions.
         */
        function openDialog (id, options, callback) {
            if(typeof options === 'function') {
                callback = options;
                options = null;
            }
            var prompt = new Prompt(document.getElementById(id), options);
            // TODO need a solution: transition doesn't work when dialog is being opened immediately
            setTimeout(function() {
                prompt.open();
            }, 0);

            var openHandler = function() {
                prompt.element.removeEventListener('prompt-open', openHandler);
                if (callback) {
                    callback();
                }
            };
            prompt.element.addEventListener('prompt-open', openHandler);

            return prompt;
        }

        describe('#open()', function() {
            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('should show the dialog', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    expect(isVisible($('.prompt-modal'))).to.be.true;
                    done();
                });
            });

            it('should show the overlay', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    expect(isVisible($('.prompt-overlay'))).to.be.true;
                    done();
                });
            });

            it('reuses the overlay element for multiple prompt instances', function(done) {
                dialog = openDialog('modal_no_inputs', function() {

                    dialog.close();

                    var oneMoreDialog = openDialog('modal_with_inputs', function() {
                        expect($('.prompt-overlay').length).to.be.equal(1);
                        oneMoreDialog.destroy();
                        done();
                    });
                });
            });
        });

        describe('#close()', function() {
            afterEach(function() {
                dialog.destroy();
            });

            it('should hide the dialog', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    dialog.close();
                    expect(isVisible($('.prompt-modal'))).to.be.false;
                    done();
                });
            });

            it('should hide the overlay', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    dialog.close();
                    expect(isVisible($('.prompt-overlay'))).to.be.false;
                    done();
                });
            });
        });

        describe('#destroy()', function() {

            it('should erase the reference to dom element', function(done) {
                var dialog = openDialog('modal_no_inputs', function() {
                    dialog.destroy();
                    expect(dialog.element).to.not.exist;
                    done();
                });
            });

            it('should return dom element where it was before prompt initialization', function(done) {
                var element = document.getElementById('modal_no_inputs');
                var sibling = element.previousElementSibling;
                var dialog = openDialog('modal_no_inputs', function() {
                    dialog.destroy();
                    expect(sibling.nextElementSibling).to.be.equal(element);
                    done();
                });
            });

            it('should remove overlay element from DOM', function(done) {
                var dialog = openDialog('modal_no_inputs', function() {
                    dialog.destroy();
                    expect($('.prompt-overlay').length).to.be.equal(0);
                    done();
                });
            });

            it('should remove dialog wrapper element from DOM', function(done) {
                var dialog = openDialog('modal_no_inputs', function() {
                    dialog.destroy();
                    expect($('.prompt-modal').length).to.be.equal(0);
                    done();
                });
            });

            it('should remove attached event handlers', function(done) {
                // Close method is executed in the handlers which should be removed on destroy.
                // Overwriting the method to add an assertion.
                var oldClose = Prompt.prototype.close;
                Prompt.prototype.close = function() {
                    oldClose.call(this);
                    // intentionaly failing the test
                    expect(false, 'event is not removed').to.be.true;
                };

                var dialog = openDialog('modal_no_inputs', function() {
                    dialog.destroy();
                    $('#modal_1').simulate('keydown', {keyCode: $.simulate.keyCode.ESCAPE});
                    $('#modal_1_close').simulate('click');

                    Prompt.prototype.close = oldClose;
                    done();
                });
            });
        });

        describe('focus', function() {
            afterEach(function() {
                dialog.destroy();
            });

            it('should be given to the first tabbable element within the dialog on open', function(done) {
                var anchorElement = document.getElementById('modal_anchor');
                dialog = openDialog('modal_with_inputs', function() {
                    expect(document.activeElement).to.be.equal(anchorElement);
                    dialog.close();
                    done();
                });
            });

            it('should be given to the first element with "autofocus" attribute within the dialog on open', function(done) {
                document.getElementById('modal_input_2').autofocus = true;

                var elementWithAutofocus = document.getElementById('modal_input_2');
                dialog = openDialog('modal_with_inputs', function() {
                    expect(document.activeElement).to.be.equal(elementWithAutofocus);
                    dialog.close();

                    document.getElementById('modal_input_2').autofocus = false;
                    done();
                });
            });

            it('should be given to the dialog element when there is no focusable elements within the dialog', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    expect(document.activeElement).to.be.equal(dialog.dialog);
                    dialog.close();
                    done();
                });
            });

            it('should be returned to the previously focused element on dialog close', function(done) {
                var inputInDocument = document.getElementById('doc_input');
                inputInDocument.focus();
                dialog = openDialog('modal_no_inputs', function() {
                    expect(document.activeElement).to.be.not.equal(inputInDocument);
                    dialog.close();
                    expect(document.activeElement).to.be.equal(inputInDocument);
                    done();
                });
            });

            it('should be removed from the dialog on close even if there was no explicitly focused element on open', function(done) {
                var lastActiveElement = document.activeElement;
                dialog = openDialog('modal_no_inputs', function() {
                    expect(document.activeElement).to.be.not.equal(lastActiveElement);
                    dialog.close();
                    expect(document.activeElement).to.be.not.equal(dialog.element);
                    done();
                });
            });
        });

        describe('default initialization option', function() {
            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('should be applied when an initialization option is not supplied', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    expect(document.querySelector('.prompt-modal').classList.contains('prompt-fx-scale-up')).to.be.true;
                    done();
                });
            });

            it('should not override a supplied initialization option', function(done) {
                dialog = openDialog('modal_no_inputs', {effect: 'slide-in-right'}, function() {
                    var modalWrapper = document.querySelector('.prompt-modal');
                    expect(modalWrapper.classList.contains('prompt-fx-scale-up')).to.be.false;
                    expect(modalWrapper.classList.contains('prompt-fx-slide-in-right')).to.be.true;
                    done();
                });
            });
        });

        describe('events', function() {
            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('triggers "prompt-open" event when the prompt is shown', function(done) {
                var element = document.getElementById('modal_no_inputs');
                var openHandler = function(ev) {
                    expect(ev.target).to.be.equal(element);
                    document.body.removeEventListener('prompt-open', openHandler);
                    done();
                };
                document.body.addEventListener('prompt-open', openHandler);
                dialog = openDialog('modal_no_inputs');
            });

            it('triggers "prompt-close" event when the prompt is hidden', function(done) {
                var element = document.getElementById('modal_no_inputs');
                var closeHandler = function(ev) {
                    expect(ev.target).to.be.equal(element);
                    document.body.removeEventListener('prompt-close', closeHandler);
                    done();
                };
                document.body.addEventListener('prompt-close', closeHandler);
                dialog = openDialog('modal_no_inputs', function() {
                    dialog.close();
                });
            });
        });

        describe('behavior', function() {
            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('should be closed on "esc" key press', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    $(document.activeElement).simulate('keydown', {keyCode: $.simulate.keyCode.ESCAPE});
                    expect(isVisible($('.prompt-modal'))).to.be.false;
                    done();
                });
            });
        });
    });
})();
