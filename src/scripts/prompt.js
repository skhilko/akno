(function(window, undefined) {
	'use strict';

	function Prompt(element) {
		this._handlers = [];

		this.element = element;
		this.closeButton = element.querySelector('.prompt-action-close');

		this._on('click', this.closeButton, _closeHandler);
	}

	Prompt.prototype.open = function() {
		this.element.classList.add('prompt-show');
	};

	Prompt.prototype.close = function() {
		this.element.classList.remove('prompt-show');
	};

	Prompt.prototype.destroy = function() {
		this.element.classList.remove('prompt-show');
		_removeEventHandlers(this);
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

	function _closeHandler() {
		this.close();
	}

	function _removeEventHandlers(instance) {
		for (var i = 0, len = instance._handlers.length; i < len; i++) {
			var event = instance._handlers[i].event;
			var element = instance._handlers[i].element;
			var handler = instance._handlers[i].handler;
			element.removeEventListener(event, handler);
		}
		delete instance._handlers;
	}

	window.Prompt = Prompt;
})(window);