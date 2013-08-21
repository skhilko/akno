(function(window, undefined) {
	'use strict';

	function Prompt(element) {
		this._handlers = [];

		this.element = element;
		// make the dialog focusable
		element.setAttribute('tabIndex', -1);
		this.closeButton = element.querySelector('.prompt-action-close');

		this._createOverlay();
		this._on('click', this.closeButton, closeHandler);
		this._on('keydown', element, escCloseHandler);
		promptInstances++;
	}

	Prompt.prototype.open = function() {
		this.element.classList.add('prompt-state-visible');
		this.overlay.classList.add('prompt-state-visible');
		this._lastActive = document.activeElement;
		setFocus(this.element);
	};

	Prompt.prototype.close = function() {
		if (this._lastActive) {
			this._lastActive.focus();
			// last active element can be unfocusable
			if(this._lastActive !== document.activeElement) {
				document.activeElement.blur();
			}
			this._lastActive = null;
		}
		this.element.classList.remove('prompt-state-visible');
		this.overlay.classList.remove('prompt-state-visible');
	};

	Prompt.prototype.destroy = function() {
		this.element.removeAttribute('tabIndex');
		this.element.classList.remove('prompt-state-visible');
		this.overlay.classList.remove('prompt-state-visible');
		removeEventHandlers(this);
		this._destroyOverlay();
		promptInstances--;
	};

	Prompt.prototype._on = function(event, element, handler) {
		if(element) {
			handler = handler.bind(this);
			this._handlers.push({
				event: event,
				element: element,
				handler: handler
			});
			element.addEventListener(event, handler, false);
		}
	};

	Prompt.prototype._createOverlay = function() {
		var overlay;
		if (!promptInstances) {
			overlay = document.createElement('div');
			overlay.id = 'prompt_overlay';
			overlay.classList.add('prompt-overlay');
			document.body.appendChild(overlay);
		} else {
			overlay = document.getElementById('prompt_overlay');
		}
		this.overlay = overlay;
	};

	Prompt.prototype._destroyOverlay = function() {
		if (promptInstances === 1) {
			document.body.removeChild(this.overlay);
		}
	};

	var KEY_CODE_ESCAPE = 27;
	var promptInstances = 0;

	function closeHandler() {
		this.close();
	}

	function escCloseHandler(event) {
		if (event.keyCode === KEY_CODE_ESCAPE) {
			event.preventDefault();
			this.close();
			return;
		}
	}

	function removeEventHandlers(instance) {
		if (instance._handlers) {
			for (var i = 0, len = instance._handlers.length; i < len; i++) {
				var event = instance._handlers[i].event;
				var element = instance._handlers[i].element;
				var handler = instance._handlers[i].handler;
				element.removeEventListener(event, handler);
			}

			instance._handlers = null;
		}
	}

	/*
	 * Sets focus in the following order:
	 * 1. first content element with autofocus attribute
	 * 2. first tabbable element within the content of the dialog
	 * 3. first tabbable action button
	 * 4. dialog element itself
	 */
	function setFocus(container) {
		var autofocused, tabbable;

		// TODO use content container as a context element
		var elements = container.querySelectorAll('input,select,button,textarea,object,a');
		for (var i = 0, len = elements.length; i < len; i++) {
			var element = elements[i];
			// will include elements without tabindex attribute, NaN (translated to tabindex '0') and positive values
			var isTabbable = !(element.tabindex < 0);
			if(isVisible(element)) {
				var nodeName = element.nodeName.toLowerCase();

				// Anchors are tabbable if they have an href or positive tabindex attribute.
				if(!tabbable && nodeName === 'a' && isTabbable) {
					tabbable = element;
					// might find an element with a higher rating
					continue;
				}

				// input, select, textarea, button, and object elements are tabbable if they do not have a negative tab index and are not disabled
				if(nodeName !== 'a' && !element.disabled) {
					if(element.getAttribute('autofocus') !== null) {
						autofocused = element;
						// nothing more serious is left here
						break;
					} else if(!tabbable && isTabbable) {
						tabbable = element;
						// might find an element with a higher rating
						continue;
					}
				}
			}
		}

		(autofocused || tabbable || container).focus();
	}

	// TODO need to check parents as well
	function isVisible(element) {
		if(window.getComputedStyle(element).visibility !== 'hidden') {
			return element.offsetWidth > 0 && element.offsetHeight > 0;
		}
	}

	window.Prompt = Prompt;
})(window);