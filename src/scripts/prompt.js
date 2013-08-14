(function(window, undefined) {
	'use strict';

	// TODO
	// -  focus the first focusable element inside of the dialog on open

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
		this.element.focus();
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
		handler = handler.bind(this);
		this._handlers.push({
			event: event,
			element: element,
			handler: handler
		});
		element.addEventListener(event, handler, false);
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
		for (var i = 0, len = instance._handlers.length; i < len; i++) {
			var event = instance._handlers[i].event;
			var element = instance._handlers[i].element;
			var handler = instance._handlers[i].handler;
			element.removeEventListener(event, handler);
		}
	}

	window.Prompt = Prompt;
})(window);