(function(window, undefined) {
	'use strict';
	function Prompt(element) {
		this.element = element;
	}

	Prompt.prototype.open = function() {
		console.log('open');
	};

	Prompt.prototype.close = function() {
		console.log('close');
	};

	window.Prompt = Prompt;
})(window);