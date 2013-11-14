/*global describe, expect, it, afterEach, Akno */
// jshint expr: true
'use strict';
(function () {
    describe('Akno', function () {
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
            var akno = new Akno(document.getElementById(id), options);
            // TODO need a solution: transition doesn't work when dialog is being opened immediately
            setTimeout(function() {
                akno.open();
            }, 0);

            var openHandler = function() {
                akno.element.removeEventListener('akno-open', openHandler);
                if (callback) {
                    callback();
                }
            };
            akno.element.addEventListener('akno-open', openHandler);

            return akno;
        }

        describe('#open()', function() {
            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('should show the dialog', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    expect(isVisible($('.akno-modal'))).to.be.true;
                    done();
                });
            });

            it('should show the overlay', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    expect(isVisible($('.akno-overlay'))).to.be.true;
                    done();
                });
            });

            it('reuses the overlay element for multiple akno instances', function(done) {
                dialog = openDialog('modal_no_inputs', function() {

                    dialog.close();

                    var oneMoreDialog = openDialog('modal_with_inputs', function() {
                        expect($('.akno-overlay').length).to.be.equal(1);
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
                    expect(isVisible($('.akno-modal'))).to.be.false;
                    done();
                });
            });

            it('should hide the overlay', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    dialog.close();
                    expect(isVisible($('.akno-overlay'))).to.be.false;
                    done();
                });
            });
        });

        describe('#destroy()', function() {

            describe('initial position', function() {
                it('should return dom element to the initial position in case the element had siblings', function(done) {
                    var element = document.getElementById('modal_no_inputs');
                    var sibling = element.previousElementSibling;
                    var dialog = openDialog('modal_no_inputs', function() {
                        dialog.destroy();
                        expect(sibling.nextElementSibling).to.be.equal(element);
                        done();
                    });
                });

                it('should return dom element to the initial position in case the element didn\'t have siblings', function(done) {
                    var element = document.getElementById('modal_no_inputs');
                    var oldSibling = element.nextElementSibling;
                    var parent = createParent(element);

                    var dialog = openDialog('modal_no_inputs', function() {
                        dialog.destroy();
                        expect(parent.firstChild).to.be.equal(element);
                        // revert dom structure
                        document.body.insertBefore(element, oldSibling);
                        document.body.removeChild(parent);
                        done();
                    });
                });
            });

            function createParent (element) {
                var parent = document.createElement('div');
                parent.appendChild(element);
                document.body.appendChild(parent);
                return parent;
            }

            it('should remove overlay element from DOM', function(done) {
                var dialog = openDialog('modal_no_inputs', function() {
                    dialog.destroy();
                    expect($('.akno-overlay').length).to.be.equal(0);
                    done();
                });
            });

            it('should remove dialog wrapper element from DOM', function(done) {
                var dialog = openDialog('modal_no_inputs', function() {
                    dialog.destroy();
                    expect($('.akno-modal').length).to.be.equal(0);
                    done();
                });
            });

            it('should remove attached event handlers', function(done) {
                // Close method is executed in the handlers which should be removed on destroy.
                // Overwriting the method to add an assertion.
                var oldClose = Akno.prototype.close;
                Akno.prototype.close = function() {
                    oldClose.call(this);
                    // intentionaly failing the test
                    expect(false, 'event is not removed').to.be.true;
                };

                var dialog = openDialog('modal_no_inputs', function() {
                    dialog.destroy();
                    $('#modal_1').simulate('keydown', {keyCode: $.simulate.keyCode.ESCAPE});
                    $('#modal_1_close').simulate('click');

                    Akno.prototype.close = oldClose;
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

            it('should cycle through dialog focusable elements when focus reaches the last element or the first in case `shift` key is pressed', function(done) {
                dialog = openDialog('modal_with_inputs', function() {
                    $('#modal_1_close').focus();
                    $('#modal_1_close').simulate('keydown', {keyCode: $.simulate.keyCode.TAB});
                    expect(document.activeElement).to.be.equal(document.getElementById('modal_anchor'));
                    $('#modal_anchor').simulate('keydown', {keyCode: $.simulate.keyCode.TAB, shiftKey: true});
                    expect(document.activeElement).to.be.equal(document.getElementById('modal_1_close'));
                    dialog.close();
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
                    expect(dialog.options.effect).to.be.equal('scale-up');
                    done();
                });
            });

            it('should not override a supplied initialization option', function(done) {
                dialog = openDialog('modal_no_inputs', {effect: 'slide-in-right'}, function() {
                    var modalWrapper = $('.akno-modal');
                    expect(dialog.options.effect).to.be.equal('slide-in-right');
                    done();
                });
            });

            it('should not override `null` value options', function(done) {
                dialog = openDialog('modal_no_inputs', {effect: null}, function() {
                    var modalWrapper = $('.akno-modal');
                    expect(dialog.options.effect).to.be.null;
                    done();
                });
            });
        });

        describe('open effect', function() {
            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('should be applied as a class on dialog element', function(done) {
                dialog = openDialog('modal_no_inputs', {effect: 'slide-in-right'}, function() {
                    var modalWrapper = $('.akno-modal');
                    expect(modalWrapper.hasClass('akno-fx-slide-in-right')).to.be.true;
                    done();
                });
            });
        });

        describe('events', function() {
            afterEach(function() {
                dialog.close();
                dialog.destroy();
            });

            it('triggers "akno-open" event when the akno is shown', function(done) {
                var element = document.getElementById('modal_no_inputs');
                var openHandler = function(ev) {
                    expect(ev.target).to.be.equal(element);
                    document.body.removeEventListener('akno-open', openHandler);
                    done();
                };
                document.body.addEventListener('akno-open', openHandler);
                dialog = openDialog('modal_no_inputs');
            });

            it('triggers "akno-close" event when the akno is hidden', function(done) {
                var element = document.getElementById('modal_no_inputs');
                var closeHandler = function(ev) {
                    expect(ev.target).to.be.equal(element);
                    document.body.removeEventListener('akno-close', closeHandler);
                    done();
                };
                document.body.addEventListener('akno-close', closeHandler);
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
                    expect(isVisible($('.akno-modal'))).to.be.false;
                    done();
                });
            });
        });
    });
})();
