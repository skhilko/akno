;(function(window, document, undefined) {
/*global tmpl*/
'use strict';

function getTransitionEndEventName() {
    var transitions = {
        'transition':        'transitionend',
        'WebkitTransition':  'webkitTransitionEnd',
        'MozTransition':     'transitionend',
        'msTransition':      'MSTransitionEnd',
        'OTransition':       'oTransitionEnd'
    };
    var transition;
    for(transition in transitions){
        if( document.body.style[transition] !== undefined ){
            return transitions[transition];
        }
    }
}

var _uid = 1;

var TRANSITION_END_EVENT = getTransitionEndEventName();
var KEY_CODE_ESCAPE = 27;
var TAB_CODE_ESCAPE = 9;
var UID = 'aknouid';

// TODO need additional configuration in some cases:
// - add additional container class on page conten but not the dialog itself
var EFFECTS = {
        'scale-up': 'akno-fx-scale-up',
        'slide-in-right': 'akno-fx-slide-in-right',
        'slide-in-bottom': 'akno-fx-slide-in-bottom',
        'newspaper': 'akno-fx-newspaper',
        'fall': 'akno-fx-fall',
        'side-fall': 'akno-fx-side-fall',
        'sticky-top': 'akno-fx-sticky-top',
        'flip-hor': 'akno-fx-flip-hor',
        'flip-vert': 'akno-fx-flip-vert',
        'sign': 'akno-fx-sign',
        'scale-down': 'akno-fx-scale-down',
        'just-me': 'akno-fx-just-me',
        'split': 'akno-fx-split',
        'rotate-bottom': 'akno-fx-rotate-bottom',
        'rotate-left': 'akno-fx-rotate-left'
    };

var aknoInstances = 0;

function isFunction(value) {
    return typeof value === 'function';
}

// TODO need to check parents as well
function isVisible(element) {
    if(window.getComputedStyle(element).visibility !== 'hidden') {
        return element.offsetWidth > 0 && element.offsetHeight > 0;
    }
}

/**
 * Return tabbable elements within a container.
 * @param  {Element} container
 * @param  {Boolean} first a boolean flag indicating the first tabbable element should be returned. Performance optimization.
 * @return {Array} an array of tabbable elements
 */
function getTabbables(container, first) {
    var tabbables = [];
    var elements = container.querySelectorAll('input,select,button,textarea,object,a');
    for (var i = 0, len = elements.length; i < len; i++) {
        var element = elements[i];
        // will include elements without tabindex attribute, NaN (translated to tabindex '0') and positive values
        var hasTabIndex = element.tabIndex >= 0;
        if(isVisible(element)) {
            var nodeName = element.nodeName.toLowerCase();

            // Anchors are tabbable if they have an href or positive tabindex attribute.
            if(nodeName === 'a') {
                if(hasTabIndex || element.href.length) {
                    tabbables.push(element);
                }
            } else if(hasTabIndex && !element.disabled) {
                // input, select, textarea, button, and object elements are tabbable if they do not have a negative tab index and are not disabled
                tabbables.push(element);
            }
        }

        if (first && tabbables.length === 1) {
            return tabbables;
        }
    }
    return tabbables;
}

/*
 * Sets focus in the following order:
 * 1. first content element with autofocus attribute
 * 2. first tabbable element within the content of the dialog
 * 3. first tabbable action button
 * 4. TODO close button
 * 5. dialog element itself
 */
function setFocus(container) {
    // TODO use content container as a context element
    var autofocus = container.querySelector('[autofocus]');
    if(autofocus) {
        autofocus.focus();
        return;
    }

    var tabbable = getTabbables(container, true);
    if(tabbable.length) {
        tabbable[0].focus();
        return;
    }

    container.focus();
}

function applyDefaults(options, defaults) {
    var result = {};
    var key;
    for(key in options) {
        if (options.hasOwnProperty(key)) {
            result[key] = options[key];
        }
    }
    // add missing defaults
    for(key in defaults) {
        if (defaults.hasOwnProperty(key)) {
            if(result[key] === undefined) {
                result[key] = defaults[key];
            }
        }
    }
    return result;
}

function generateUid() {
    return '' + _uid++;
}

function getUid(object) {
    var uid = object[UID];
    if(!uid) {
        uid = generateUid();
        object[UID] = uid;
    }
    return uid;
}



//
// Akno Component
// --------------


//TODO reuse akno instance when initialized twice on the same element
/**
 * [Akno description]
 *
 * Options:
 * - effect {String}, default 'scale-up' - effect to be used to show the dialog.
 * - header {String}, optional - header text. Header is not rendered in case the parameter is not provided.
 * - open {Boolean}, default `true` - if set to `true`, the akno will open upon initialization.
 *
 * @param {Element} element
 * @param {Object} options
 *
 * Events:
 * - akno-before-open
 * - akno-open
 * - akno-before-close
 * - akno-close
 */
function Akno(element, options) {
    this._handlers = {};

    this.options = applyDefaults(options, Akno.defaults);
    this.element = element;

    this._createOverlay();
    this._render();
    this.closeButton = element.querySelector('.akno-action-close');

    this._on('click', this.closeButton, this.close);
    this._on('keydown', this.dialog, this._escKeyHandler);
    this._on('keydown', this.dialog, this._tabKeyHandler);
    aknoInstances++;

    if(this.options.open) {
        this.open();
    }
}

Akno.prototype.open = function() {
    if(this._isOpen()) {
        return;
    }

    this._trigger('akno-before-open');
    this._on(TRANSITION_END_EVENT, this.dialog, this._openAnimationHandler);
    this.dialog.classList.add('akno-state-visible');
};

Akno.prototype.close = function(closeCallback) {
    if(!this._isOpen()) {
        return;
    }
    //TODO check for false and prevent akno close
    this._trigger('akno-before-close');
    if (this._lastActive) {
        this._lastActive.focus();
        // last active element can be unfocusable
        if(this._lastActive !== document.activeElement) {
            document.activeElement.blur();
        }
        this._lastActive = null;
    }

    var closeAnimationHandler = function() {
        this._off(TRANSITION_END_EVENT, this.dialog, closeAnimationHandler);
        if(isFunction(closeCallback)) {
            closeCallback.call(this);
        }
        this._trigger('akno-close');

    }.bind(this);

    this._on(TRANSITION_END_EVENT, this.dialog, closeAnimationHandler);
    this.dialog.classList.remove('akno-state-visible');
};

Akno.prototype.destroy = function() {
    if(this._isOpen()) {
        this.close(this._destroy);
    } else {
        this._destroy();
    }
};

Akno.prototype._destroy = function() {
    // revert our changes
    var overrides = this._overrides;
    var element = this.element;
    if (overrides.hasOwnProperty('display')) {
        element.style.display = overrides.display;
    }
    overrides.parent.insertBefore(element, overrides.next);

    this._handlers = null;
    this._destroyOverlay();
    document.body.removeChild(this.dialog);
    Akno.zIndex--;
    aknoInstances--;
};

Akno.prototype._isOpen = function() {
    return this.dialog.classList.contains('akno-state-visible');
};

Akno.prototype._render = function() {
    var element = this.element;

    this._overrides = {
        parent: element.parentNode,
        next: element.nextElementSibling
    };

    var originalDisplayStyle = getComputedStyle(element).getPropertyValue('display');
    if(originalDisplayStyle === 'none') {
        this._overrides.display = element.style.display;
    }

    var wrapper = document.createElement('div');
    wrapper.innerHTML = tmpl.dialog({
        header: this.options.header,
        effect: EFFECTS[this.options.effect]
    });
    var content = wrapper.querySelector('.akno-body');
    content.appendChild(element);

    // update visibility if needed
    if(originalDisplayStyle === 'none') {
        element.style.display = 'block';
    }

    // TODO content should include action buttons
    this.content = content;

    // ensure the dialog is rendered before all service elements to make selectors work
    this.dialog = document.body.insertBefore(wrapper.firstChild, document.body.firstChild);
    this.dialog.style.zIndex = Akno.zIndex++;

    // force repaint for transformations to kick in immediately
    // jshint -W030
    this.dialog.offsetHeight;
};

Akno.prototype._on = function(eventName, element, handler) {
    if(eventName && element) {
        var handlerUid = getUid(handler);
        var elementUid = getUid(element);
        handler = handler.bind(this);
        handler[UID] = handlerUid;
        var elementHandlers = this._handlers[elementUid];
        if(!elementHandlers || !elementHandlers.length) {
            elementHandlers = [];
            this._handlers[elementUid] = elementHandlers;
        }
        elementHandlers.push({
            eventName: eventName,
            handler: handler
        });
        element.addEventListener(eventName, handler);
    }
};

Akno.prototype._off = function(eventName, element, handler) {
    var elementEventHandlers = this._handlers[getUid(element)];
    var handlerData;
    if (elementEventHandlers) {
        for (var i = 0, len = elementEventHandlers.length; i < len; i++) {
            handlerData = elementEventHandlers[i];
            if(handlerData.eventName === eventName && getUid(handlerData.handler) === getUid(handler)) {
                element.removeEventListener(eventName, handlerData.handler);
                elementEventHandlers.splice(i, 1);
                len--;
            }
        }
    }
};

Akno.prototype._trigger = function(eventName) {
    var event = document.createEvent('CustomEvent');
    event.initEvent(eventName, true, true);
    this.element.dispatchEvent(event);
};

Akno.prototype._createOverlay = function() {
    var overlay;
    if (!aknoInstances) {
        overlay = document.createElement('div');
        overlay.id = 'akno_overlay';
        overlay.style.zIndex = Akno.zIndex++;
        overlay.className = 'akno-overlay';
        document.body.appendChild(overlay);
    } else {
        overlay = document.getElementById('akno_overlay');
    }
    this.overlay = overlay;
};

Akno.prototype._initFocus = function() {
    this._lastActive = document.activeElement;
    setFocus(this.dialog);
};

Akno.prototype._destroyOverlay = function() {
    if (aknoInstances === 1) {
        document.body.removeChild(this.overlay);
        Akno.zIndex--;
    }
};

Akno.prototype._openAnimationHandler = function() {
    this._off(TRANSITION_END_EVENT, this.dialog, this._openAnimationHandler);
    this._initFocus();
    this._trigger('akno-open');
};

Akno.prototype._escKeyHandler = function(ev) {
    if (ev.keyCode === KEY_CODE_ESCAPE) {
        ev.preventDefault();
        this.close();
        return;
    }
};

Akno.prototype._tabKeyHandler = function(ev) {
    if (ev.keyCode === TAB_CODE_ESCAPE) {
        // content + buttons
        var tabbables = getTabbables(this.content);
        if(tabbables.length) {
            var first = tabbables[0];
            var last  = tabbables[tabbables.length - 1];
            if ( ( ev.target === last || ev.target === this.dialog ) && !ev.shiftKey ) {
                first.focus();
                ev.preventDefault();
            } else if ( ( ev.target === first || ev.target === this.dialog ) && ev.shiftKey ) {
                last.focus();
                ev.preventDefault();
            }
        } else {
            this.dialog.focus();
        }
    }
};



// Global defaults
//

Akno.defaults = {
    effect: 'scale-up',
    open: true
};

// Base z-index for all Aknos
Akno.zIndex = 10;

var tmpl = (function(){
function encodeHTMLSource() {  var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },  matchHTML = /&(?!#?w+;)|<|>|"|'|\//g;  return function() {    return this ? this.replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : this;  };};
String.prototype.encodeHTML=encodeHTMLSource();
var tmpl = {};
  tmpl['dialog']=function anonymous(it) {
var out='<div class="akno-modal '+(it.effect)+'" tabindex="-1"><div class="akno-content">';if(it.header){out+='<h1>'+(it.header||'').toString().encodeHTML()+'</h1>';}out+='<div class="akno-body"></div></div></div>';return out;
};
return tmpl;})();
window.Akno = Akno;

})(window, window.document);