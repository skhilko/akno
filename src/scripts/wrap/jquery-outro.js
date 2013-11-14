

//
// jQuery plugin starts here
// -------------------------

var pluginName = 'akno';

function Plugin(element, options) {
    // this.element is jQuery wrapper
    this.element = element;
    this.options = options;
    this._name = pluginName;
    this.init();
}

Plugin.prototype.init = function() {
    this.akno = new Akno(this.element[0], this.options);
};

Plugin.prototype.destroy = function() {
    this.akno.destroy();
    this.element = null;
};

$.fn[pluginName] = function(options) {
    var args = arguments;
    if (options === undefined || typeof options === 'object') {
        return this.each(function() {
            var el = $(this);
            if (!el.data('plugin_' + pluginName)) {
                el.data('plugin_' + pluginName, new Plugin(el, options));
            }
        });
    } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
        return this.each(function() {
            var instance = $.data(this, 'plugin_' + pluginName);
            if (instance instanceof Plugin && typeof instance[options] === 'function') {
                // allowing to override akno methods in the jq plugin
                (instance[options] || instance.akno[options]).apply(instance.akno, Array.prototype.slice.call(args, 1));
            }
        });
    }
};

}(jQuery, window, window.document));