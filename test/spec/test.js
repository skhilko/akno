/*global describe, it */
'use strict';
(function () {
    describe('Prompt', function () {
        it('should open the dialog on #open() call');
        it('should close the  dialg on #close() call');
        it('should clean DOM after itself on #destroy() call');
        it('should be closed on "esc" key press');
        it('should focus a first focusable element within the dialog on open');
        it('should focus the dialog element itself when there is no focusable elements within the dialog on open');
        it('should return focus to the element which had focus before on close');
    });
})();
