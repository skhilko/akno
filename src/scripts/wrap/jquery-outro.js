window.Akno = Akno;

//
// jQuery plugin starts here
// -------------------------

var pluginName = 'akno';

function Plugin(element, options) {
    this.element = element;
    this.options = options;
    this.init();
}

Plugin.prototype.init = function() {
    this.akno = new Akno(this.element, this.options);
};

Plugin.prototype.destroy = function() {
    this.akno.destroy();
    $.removeData(this.element, 'plugin_' + pluginName);
    this.element = null;
};

$.fn[pluginName] = function(options) {
    var args = arguments;
    var dataKey = 'plugin_' + pluginName;
    if (options === undefined || typeof options === 'object') {
        return this.each(function() {
            if (!$.data(this, dataKey)) {
                $.data(this, dataKey, new Plugin(this, options));
            }
        });
    } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
        return this.each(function() {
            var instance = $.data(this, dataKey);
            if (instance instanceof Plugin) {
                // call with akno instance if not on the plugin
                if(typeof instance[options] !== 'function' && typeof instance.akno[options] === 'function') {
                    instance = instance.akno;
                }
                instance[options].apply(instance, Array.prototype.slice.call(args, 1));
            }
        });
    }
};

}(jQuery, window, window.document));