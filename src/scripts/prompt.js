(function(window, undefined) {
	'use strict';

	// TODO
	// -  focus the first focusable element inside of the dialog on open
	// -  return focus to the dialog when clicked outside
	// -? remove tabIndex on destroy

	function Prompt(element) {
		this.handlers = [];

		this.element = element;
		// make the dialog focusable
		this.element.tabIndex = -1;

		this.closeButton = element.querySelector('.prompt-action-close');

		this._on('click', this.closeButton, closeHandler);
		this._on('keydown', this.element, escCloseHandler);
	}

	Prompt.prototype.open = function() {
		this.element.classList.add('prompt-show');
		this.element.focus();
	};

	Prompt.prototype.close = function() {
		this.element.classList.remove('prompt-show');
	};

	Prompt.prototype.destroy = function() {
		this.element.classList.remove('prompt-show');
		_removeEventHandlers(this);
	};

	var KEY_CODE_ESCAPE = 27;

	Prompt.prototype._on = function(event, element, handler) {
		handler = handler.bind(this);
		this.handlers.push({
			event: event,
			element: element,
			handler: handler
		});
		element.addEventListener(event, handler, false);
	};

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

	function _removeEventHandlers(instance) {
		for (var i = 0, len = instance.handlers.length; i < len; i++) {
			var event = instance.handlers[i].event;
			var element = instance.handlers[i].element;
			var handler = instance.handlers[i].handler;
			element.removeEventListener(event, handler);
		}
		delete instance.handlers;
	}

	window.Prompt = Prompt;
})(window);