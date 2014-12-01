/*global describe, expect, it, beforeEach, afterEach, before, after, Akno*/
// jshint expr: true
'use strict';
(function () {
    describe('Akno', function () {

        var dialog;

        function isVisible (el) {
            return el.css('visibility') !== 'hidden' && el.css('display') !== 'none';
        }


        // TODO ideally implement or find an 'eventually' chai plugun
        // which would hide the `repeat` implementation.
        // Eg. expect(isVisible($('.akno-dialog'))).to.be.eventually.true;

        /**
         * Repeatedly executes the provided assertion for a maximum time of 1 sec. until the assertion returns true.
         * Fails after 1 second.
         *
         * @param  {Function} assertion a function which checks for a specific condition.
         *                              Should return `true` when the condition is satisfied.
         * @param  {String} errorMsg    an error message to display when failed
         * @return {$.Deferred}         a deferred object which is resolved when the assertion
         */
        function repeat (assertion, errorMsg) {
            var loopInterval;
            var timeoutInterval;
            var deferred = $.Deferred();

            // first synchronious check to avoid timeout delays
            if (assertion()) {
                deferred.resolve();
                return deferred.promise();
            }

            (function loop () {
                loopInterval = setTimeout(function() {
                    if (assertion()) {
                        clearTimeout(loopInterval);
                        clearTimeout(timeoutInterval);
                        deferred.resolve();
                        return;
                    }
                    loop();
                }, 10);
            })();

            if (deferred.state() === 'pending') {
                timeoutInterval = setTimeout(function() {
                    if (loopInterval) {
                        clearTimeout(loopInterval);
                        deferred.reject(new Error(errorMsg));
                    }
                }, 1000);
            }

            return deferred.promise();
        }

        /**
         * Opens the dialog.
         * Due to css transitions used on dialog open, we have to use an async callback to proceed with test assertions.
         */
        function openDialog (id, options, openCallback, closeCallback) {
            if(typeof options === 'function') {
                closeCallback = openCallback;
                openCallback = options;
                options = null;
            }

            var el = document.getElementById(id);
            var openHandler = function() {
                el.removeEventListener('akno-open', openHandler);
                if (openCallback) {
                    openCallback();
                }
            };
            var closeHandler = function() {
                el.removeEventListener('akno-close', closeHandler);
                if (closeCallback) {
                    closeCallback();
                }
            };
            el.addEventListener('akno-open', openHandler);
            el.addEventListener('akno-close', closeHandler);
            var akno = new Akno(el, options);

            return akno;
        }

        /**
         * Destroys the akno.
         * Due to css transitions, the akno is not immediately hidden.
         * We need to handle `close` event to make sure the transitions has settled.
         */
        function destroyAkno (dialog, done) {
            if (dialog) {
                var dialogWrapper = dialog.dialog;
                dialog.destroy();
                repeat(function() {
                    // check the existence of the generated wrapper in the dom
                    // if removed, consider the akno to be destroyed
                    return dialogWrapper.parentNode === null;
                }, 'cannot destroy the akno').done(done);
            } else {
                done();
            }
        }



        describe('.open()', function() {
            afterEach(function(done) {
                destroyAkno(dialog, done);
            });

            it('should show the dialog', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    expect(isVisible($('.akno-dialog'))).to.be.true;
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

            it('can be cancelled if .preventDefault() is called on "akno-before-open"', function(done) {
                var beforeOpenHandler = function(ev) {
                    ev.preventDefault();
                    document.body.removeEventListener('akno-before-open', beforeOpenHandler);
                    // give the akno a chance to close, which should not happen anyway
                    setTimeout(function() {
                        expect(!isVisible($('.akno-dialog'))).to.be.true;
                        done();
                    }, 0);
                };
                document.body.addEventListener('akno-before-open', beforeOpenHandler);
                dialog = openDialog('modal_no_inputs');
            });
        });


        describe('.close()', function() {
            afterEach(function(done) {
                destroyAkno(dialog, done);
            });

            it('should hide the dialog', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    dialog.close();
                }, function() {
                    repeat(function() {
                        return !isVisible($('.akno-dialog'));
                    }, 'akno should not be visible').always(done);
                });
            });

            it('should hide the overlay', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    dialog.close();
                }, function() {
                    repeat(function() {
                        return !isVisible($('.akno-overlay'));
                    }, 'overlay should not be visible').always(done);
                });
            });

            it('can be cancelled if .preventDefault() is called on "akno-before-close"', function(done) {
                var beforeCloseHandler = function(ev) {
                    ev.preventDefault();
                    document.body.removeEventListener('akno-before-close', beforeCloseHandler);
                    // give the akno a chance to close, which should not happen anyway
                    setTimeout(function() {
                        expect(isVisible($('.akno-dialog'))).to.be.true;
                        done();
                    }, 0);
                };
                document.body.addEventListener('akno-before-close', beforeCloseHandler);
                dialog = openDialog('modal_no_inputs', function() {
                    dialog.close();
                });
            });
        });


        describe('.destroy()', function() {

            it('should remove overlay element from DOM', function(done) {
                var dialog = openDialog('modal_no_inputs', function() {
                    dialog.destroy();
                }, function() {
                    repeat(function() {
                        return $('.akno-overlay').length === 0;
                    }, 'overlay should be destroyed').always(done);
                });
            });

            it('should remove dialog wrapper element from DOM', function(done) {
                var dialog = openDialog('modal_no_inputs', function() {
                    dialog.destroy();
                }, function() {
                    repeat(function() {
                        return $('.akno-dialog').length === 0;
                    }, 'dialog wrapper should be destroyed').always(done);
                });
            });


            describe('initial position', function() {


                describe('the target element has siblings', function() {
                    before(function() {
                        var template = '<div class="generated-sibling">';
                        $('#modal_no_inputs')
                            .before(template)
                            .after(template);
                    });

                    it('should return the target element to the initial position', function(done) {
                        var dialog = openDialog('modal_no_inputs', function() {
                            dialog.destroy();
                        }, function() {
                            var el = $('#modal_no_inputs');
                            repeat(function() {
                                return el.prev().hasClass('generated-sibling') && el.next().hasClass('generated-sibling');
                            }, 'dialog should be placed between old siblings').always(done);
                        });
                    });

                    after(function() {
                        $('.generated-sibling').remove();
                    });
                });


                describe('the target element doesn\'t have siblings', function() {
                    before(function() {
                        var template = '<div class="generated-parent">';
                        $('#modal_no_inputs').wrap(template);
                    });

                    it('should return the target element to the initial position', function(done) {
                        var dialog = openDialog('modal_no_inputs', function() {
                            dialog.destroy();
                        }, function() {
                            var el = $('#modal_no_inputs');
                            repeat(function() {
                                return el.parent().hasClass('generated-parent');
                            }, 'dialog should be placed into its old parent').always(done);
                        });
                    });

                    after(function() {
                        $('#modal_no_inputs').unwrap();
                    });
                });
            });


            describe('the target element has an initial display value', function() {
                before(function() {
                    $('#modal_no_inputs').css('display', 'inline-block');
                });

                it('should not modify the original display value', function(done) {
                    var dialog = openDialog('modal_no_inputs', function() {
                            dialog.destroy();
                        }, function() {
                            expect($('#modal_no_inputs').css('display')).to.be.equal('inline-block');
                            done();
                        });
                });

                after(function() {
                    $('#modal_no_inputs').css('display', '');
                });
            });


            describe('akno is open', function() {
                beforeEach(function(done) {
                    dialog = openDialog('modal_no_inputs', function() {
                        done();
                    });
                });

                it('should allow "akno-close" event to complete', function(done) {
                    $(dialog.element).one('akno-close', function() {
                        expect(true).to.be.true;
                        done();
                    });
                    dialog.destroy();
                });


                describe('.close() is called just before .destroy()', function() {

                    it('should allow "akno-close" event to complete', function(done) {
                        $(dialog.element).one('akno-close', function() {
                            expect(true).to.be.true;
                            done();
                        });
                        dialog.close();
                        dialog.destroy();
                    });

                });

            });
        });

        describe('action buttons', function() {
            afterEach(function(done) {
                destroyAkno(dialog, done);
            });

            it('should be possible to define custom action buttons for the akno', function(done) {
                dialog = openDialog('modal_no_inputs', {
                    buttons: [
                        {
                            text: 'Action 1'
                        },
                        {
                            text: 'Action 2'
                        }
                    ]
                }, function() {
                    expect($('.akno-state-open .akno-footer button')).to.have.length(2);
                    done();
                });
            });

            it('should be possible to display names for action buttons', function(done) {
                dialog = openDialog('modal_no_inputs', {
                    buttons: [
                        {
                            text: 'Action 1'
                        }
                    ]
                }, function() {
                    expect($('.akno-state-open .akno-footer button').text()).to.be.equal('Action 1');
                    done();
                });
            });

            it('should be possible to define class names for action buttons', function(done) {
                dialog = openDialog('modal_no_inputs', {
                    buttons: [
                        {
                            text: 'Action 1',
                            className: 'custom-action'
                        }
                    ]
                }, function() {
                    expect($('.akno-state-open .akno-footer .custom-action')).to.have.length(1);
                    done();
                });
            });

            describe('click event handler', function() {
                it('should be executed when clicked on an action button', function(done) {
                    dialog = openDialog('modal_no_inputs', {
                        buttons: [
                            {
                                text: 'Action 1',
                                action: function() {
                                    expect(true).to.be.ok;
                                    done();
                                }
                            }
                        ]
                    }, function() {
                        $('.akno-state-open .akno-footer button').simulate('click');
                    });
                });

                it('should have the akno instance as `this` execution context', function(done) {
                    dialog = openDialog('modal_no_inputs', {
                        buttons: [
                            {
                                text: 'Action 1',
                                action: function() {
                                    expect(this).to.be.equal(dialog);
                                    done();
                                }
                            }
                        ]
                    }, function() {
                        $('.akno-state-open .akno-footer button').simulate('click');
                    });
                });
            });

        });

        describe('focus', function() {
            afterEach(function(done) {
                destroyAkno(dialog, done);
            });

            it('should be given to the first tabbable element within the dialog on open', function(done) {
                var anchorElement = document.getElementById('modal_anchor');
                dialog = openDialog('modal_with_inputs', function() {
                    expect(document.activeElement).to.be.equal(anchorElement);
                    done();
                });
            });

            describe('akno contains an element with autofocus attribute', function() {
                var autofocusEl;
                before(function() {
                    autofocusEl = document.getElementById('modal_input_2');
                    autofocusEl.autofocus = true;
                });

                it('autofocus element should recieve the focus when the akno is open', function(done) {
                    dialog = openDialog('modal_with_inputs', function() {
                        expect(document.activeElement).to.be.equal(autofocusEl);
                        done();
                    });
                });

                after(function() {
                    autofocusEl.autofocus = false;
                });
            });


            describe('akno doesn\'t contain focusable elements and a close button', function() {
                before(function() {
                    document.getElementById('localStyles').sheet.insertRule('.akno-state-open .akno-action-close { display: none; }', 0);
                });

                it('focus should be given to the akno wrapper element when the akno is open', function(done) {
                    dialog = openDialog('modal_no_inputs', function() {
                        expect(document.activeElement).to.be.equal(dialog.dialog);
                        done();
                    });
                });

                after(function() {
                    document.getElementById('localStyles').sheet.deleteRule(0);
                });
            });

            it('should be given to the first action button when the akno doesn\'t have focusable elements on open', function(done) {
                dialog = openDialog('modal_no_inputs', {
                        buttons: [{text: 'Confirm'}]
                    }, function() {
                        expect(document.activeElement).to.be.equal($('.akno-footer button:eq(0)', dialog.dialog)[0]);
                        done();
                    });
            });

            it('should be given to the close button when the akno doesn\'t have focusable elements and action buttons on open', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    expect(document.activeElement).to.be.equal($('.akno-action-close', dialog.dialog)[0]);
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
                    var lastInputEl = $('#modal_input_2');
                    var closeEl = $('.akno-state-open .akno-action-close');

                    lastInputEl.focus();
                    lastInputEl.simulate('keydown', {keyCode: $.simulate.keyCode.TAB});
                    expect(document.activeElement).to.be.equal(closeEl[0]);

                    closeEl.simulate('keydown', {keyCode: $.simulate.keyCode.TAB, shiftKey: true});
                    expect(document.activeElement).to.be.equal(lastInputEl[0]);
                    done();
                });
            });
        });

        describe('default initialization option', function() {
            afterEach(function(done) {
                destroyAkno(dialog, done);
            });

            it('should be applied when an initialization option is not supplied', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    expect(dialog.options.effect).to.be.equal('scale-up');
                    expect(dialog.options.open).to.be.true;
                    done();
                });
            });

            it('should not override a supplied initialization option', function(done) {
                dialog = openDialog('modal_no_inputs', {effect: 'slide-in-right'}, function() {
                    expect(dialog.options.effect).to.be.equal('slide-in-right');
                    done();
                });
            });

            it('should not override `null` value options', function() {
                dialog = openDialog('modal_no_inputs', {effect: null});
                expect(dialog.options.effect).to.be.null;
            });

            describe('zIndex', function() {
                var secondDialog;
                it('should be possible to define base z-index value of all Aknos on the page', function(done) {
                    dialog = openDialog('modal_no_inputs', {effect: null});
                    var zIndex = $('#akno_overlay').css('zIndex');
                    expect(String(zIndex)).to.be.equal('10');

                    Akno.zIndex = 100;
                    secondDialog = openDialog('modal_with_inputs', function() {
                        var zIndex = $('#modal_with_inputs').closest('.akno-dialog').css('zIndex');
                        expect(String(zIndex)).to.be.equal('100');
                        done();
                    });
                });

                after(function(done) {
                    destroyAkno(secondDialog, done);
                });
            });
        });

        describe('open effect', function() {
            afterEach(function(done) {
                destroyAkno(dialog, done);
            });

            it('should be applied as a class on dialog element', function(done) {
                dialog = openDialog('modal_no_inputs', {effect: 'slide-in-right'}, function() {
                    var modalWrapper = $('.akno-dialog');
                    expect(modalWrapper.hasClass('akno-fx-slide-in-right')).to.be.true;
                    done();
                });
            });
        });

        describe('events', function() {
            afterEach(function(done) {
                destroyAkno(dialog, done);
            });

            it('triggers "akno-before-open" event when the akno is about to be open', function(done) {
                var element = document.getElementById('modal_no_inputs');
                var beforeOpenHandled;
                var openHandler = function(ev) {
                    expect(ev.target).to.be.equal(element);
                    expect(isVisible($('.akno-dialog'))).to.be.false;
                    document.body.removeEventListener('akno-before-open', openHandler);
                    beforeOpenHandled = true;
                };
                document.body.addEventListener('akno-before-open', openHandler);
                dialog = openDialog('modal_no_inputs', function() {
                    done(!beforeOpenHandled ? new Error('failed to handle "akno-before-open"') : null);
                });
            });

            it('triggers "akno-open" event when the akno is shown', function(done) {
                var element = document.getElementById('modal_no_inputs');
                var openHandler = function(ev) {
                    expect(ev.target).to.be.equal(element);
                    expect(isVisible($('.akno-dialog'))).to.be.true;
                    document.body.removeEventListener('akno-open', openHandler);
                    done();
                };
                document.body.addEventListener('akno-open', openHandler);
                dialog = openDialog('modal_no_inputs');
            });

            it('triggers "akno-before-close" event when the akno is about to be closed', function(done) {
                var element = document.getElementById('modal_no_inputs');
                var closeHandler = function(ev) {
                    expect(ev.target).to.be.equal(element);
                    expect(isVisible($('.akno-dialog'))).to.be.true;
                    document.body.removeEventListener('akno-before-close', closeHandler);
                    done();
                };
                document.body.addEventListener('akno-before-close', closeHandler);
                dialog = openDialog('modal_no_inputs', function() {
                    dialog.close();
                });
            });

            it('triggers "akno-close" event when the akno is hidden', function(done) {
                var element = document.getElementById('modal_no_inputs');
                var closeHandler = function(ev) {
                    expect(ev.target).to.be.equal(element);
                    expect(isVisible($('.akno-dialog'))).to.be.false;
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
            afterEach(function(done) {
                destroyAkno(dialog, done);
            });

            it('should be closed on "esc" key press', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    $(document.activeElement).simulate('keydown', {keyCode: $.simulate.keyCode.ESCAPE});
                }, function() {
                    done();
                });
            });

            it('should display the second modal on top of the first one', function(done) {
                dialog = openDialog('modal_no_inputs', function() {
                    var zIndexFirst = $('#modal_no_inputs').closest('.akno-dialog').css('zIndex');

                    var secondDialog = openDialog('modal_with_inputs', function() {
                        var zIndexSecond = $('#modal_with_inputs').closest('.akno-dialog').css('zIndex');
                        expect(parseInt(zIndexSecond, 10)).to.be.greaterThan(parseInt(zIndexFirst, 10));
                        secondDialog.destroy();
                        done();
                    });
                });
            });
        });

        describe('visibility of the target element', function() {
            afterEach(function (done) {
                destroyAkno(dialog, done);
            });

            describe('the target element is hidden via a style attribute', function() {
                before(function() {
                    $('#modal_no_inputs')
                        .css('display', 'none')
                        .parent().removeClass('hidden');

                    // make sure that the preparation went fine
                    expect(isVisible($('#modal_no_inputs'))).to.be.false;
                });

                it('should show the target element', function(done) {
                    dialog = openDialog('modal_no_inputs', function() {
                        expect(isVisible($('#modal_no_inputs'))).to.be.true;
                        done();
                    });
                });

                after(function() {
                    $('#modal_no_inputs')
                        .css('display', '')
                        .parent().addClass('hidden');
                });
            });

            describe('the target element is hidden via a stylesheet rule', function() {
                before(function() {
                    document.getElementById('localStyles').sheet.insertRule('#modal_no_inputs { display: none; }', 0);
                    $('#modal_no_inputs').parent().removeClass('hidden');
                    // make sure that the preparation went fine
                    expect(isVisible($('#modal_no_inputs'))).to.be.false;
                });

                it('should show the target element', function(done) {
                    dialog = openDialog('modal_no_inputs', function() {
                        expect(isVisible($('#modal_no_inputs'))).to.be.true;
                        done();
                    });
                });

                after(function() {
                    document.getElementById('localStyles').sheet.deleteRule(0);
                    $('#modal_no_inputs').parent().addClass('hidden');
                });
            });
        });

        describe('viewport scrollbar', function() {
            function isViewportScrollExists() {
                var viewport = document.documentElement;
                return viewport.scrollHeight > viewport.clientHeight;
            }

            function assertScrollbarHidden () {
                // we use 'overflow: hidden' on body element to remove the scroll bar
                expect(getComputedStyle(document.body).overflow).to.be.equal('hidden');
            }

            afterEach(function(done) {
                destroyAkno(dialog, done);
            });

            describe('vertical scrollbar exists', function() {
                before(function() {
                    $('<div id="spreader" style="height:2000px;">').appendTo(document.body);
                    expect(isViewportScrollExists()).to.be.true;
                });

                it('should be hidden when the akno is open', function(done) {
                    dialog = openDialog('modal_no_inputs', function() {
                        assertScrollbarHidden();

                        // the content is padded for the width of the removed scroll bar
                        var rightPadding = getComputedStyle(document.body).paddingRight;
                        rightPadding = parseInt(rightPadding.slice(0, -2), 10);
                        expect(rightPadding).to.be.greaterThan(0);
                        done();
                    });
                });

                describe('body element has initial `overflow` value', function() {
                    before(function() {
                        document.body.style.overflow = 'auto';
                    });

                    it('should be reverted to the original value when the akno is closed', function(done) {
                        dialog = openDialog('modal_no_inputs', function() {
                            dialog.close();
                        }, function() {
                            expect(document.body.style.overflow).to.be.equal('auto');
                            done();
                        });
                    });

                    after(function() {
                        document.body.style.overflow = '';
                    });
                });

                describe('body element has initial `padding` value', function() {
                    before(function() {
                        document.body.style.paddingRight = '1px';
                    });

                    it('should be reverted to the original value when the akno is closed', function(done) {
                        dialog = openDialog('modal_no_inputs', function() {
                            dialog.close();
                        }, function() {
                            expect(document.body.style.paddingRight).to.be.equal('1px');
                            done();
                        });
                    });

                    after(function() {
                        document.body.style.paddingRight = '';
                    });
                });

                describe('second akno is open simultaneously', function() {
                    var secondAkno;
                    before(function(done) {
                        dialog = openDialog('modal_no_inputs', function() {
                            secondAkno = openDialog('modal_with_inputs', function() {
                                done();
                            });
                        });
                    });

                    it('should not show the scrollbar when closed', function(done) {
                        $(secondAkno.element).one('akno-close', function() {
                            assertScrollbarHidden();
                        });
                        $(dialog.element).one('akno-close', function() {
                            repeat(function() {
                                return getComputedStyle(document.body).overflow !== 'hidden';
                            }, 'overflow value was not reverted').done(done);
                        });
                        secondAkno.close();
                        dialog.close();
                    });

                    after(function(done) {
                        destroyAkno(secondAkno, done);
                    });
                });

                after(function() {
                    $('#spreader').remove();
                });
            });

            describe('vertical scrollbar does not exist', function() {
                before(function() {
                    document.body.style.overflow = 'hidden';
                });

                describe('body element has initial `overflow` value', function() {
                    it('should not be changed when the akno is opened', function(done) {
                        dialog = openDialog('modal_no_inputs', function() {
                            expect(getComputedStyle(document.body).overflow).to.be.equal('hidden');
                            expect(document.body.style.paddingRight).to.be.equal('');
                            done();
                        });
                    });
                });

                after(function() {
                    document.body.style.overflow = '';
                });
            });
        });
    });
})();
