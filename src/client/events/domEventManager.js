import isEventSupported from './isEventSupported';
import createSyntheticEvent from './createSyntheticEvent';
import getDomNodeId from '../getDomNodeId';
import SimpleMap from '../../utils/SimpleMap';
import { isIos } from '../utils/ua';

const MOUSE_NATIVE_EVENTS = ['click', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup'];
let BUBBLEABLE_NATIVE_EVENTS = [
        'blur', 'change', 'contextmenu', 'copy', 'cut',
        'dblclick', 'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop',
        'focus', 'input', 'keydown', 'keypress', 'keyup',
        'paste', 'submit', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'wheel'
    ],
    NON_BUBBLEABLE_NATIVE_EVENTS = [
        'canplay', 'canplaythrough', 'complete', 'durationchange', 'emptied', 'ended', 'error',
        'load', 'loadeddata', 'loadedmetadata', 'loadstart', 'mouseenter', 'mouseleave',
        'pause', 'play', 'playing', 'progress', 'ratechange',
        'scroll', 'seeked', 'seeking', 'select', 'stalled', 'suspend',
        'timeupdate', 'volumechange', 'waiting'
    ];

if(isIos) {
    NON_BUBBLEABLE_NATIVE_EVENTS = [...NON_BUBBLEABLE_NATIVE_EVENTS, ...MOUSE_NATIVE_EVENTS];
}
else {
    BUBBLEABLE_NATIVE_EVENTS = [...BUBBLEABLE_NATIVE_EVENTS, ...MOUSE_NATIVE_EVENTS];
}

const listenersStorage = new SimpleMap(),
    eventsCfg = new SimpleMap();
let areListenersEnabled = true;

function globalEventListener(e, type = e.type) {
    if(!areListenersEnabled) {
        return;
    }

    let { target } = e,
        { listenersCount } = eventsCfg.get(type),
        listeners,
        listener,
        domNodeId,
        syntheticEvent;

    while(listenersCount && target && target !== document) { // need to check target for detached dom
        if(domNodeId = getDomNodeId(target, true)) {
            listeners = listenersStorage.get(domNodeId);
            if(listeners && (listener = listeners[type])) {
                listener(syntheticEvent || (syntheticEvent = createSyntheticEvent(type, e)));
                if(--listenersCount === 0 || syntheticEvent.isPropagationStopped()) {
                    return;
                }
            }
        }

        target = target.parentNode;
    }
}

function eventListener(e) {
    if(areListenersEnabled) {
        listenersStorage.get(getDomNodeId(e.currentTarget))[e.type](createSyntheticEvent(e.type, e));
    }
}

if(typeof document !== 'undefined') {
    const focusEvents = {
        focus : 'focusin',
        blur : 'focusout'
    };

    let i = 0,
        type;

    while(i < BUBBLEABLE_NATIVE_EVENTS.length) {
        type = BUBBLEABLE_NATIVE_EVENTS[i++];
        eventsCfg.set(type, {
            type : type,
            bubbles : true,
            listenersCount : 0,
            set : false,
            setup : focusEvents[type]?
                isEventSupported(focusEvents[type])?
                    function() {
                        const type = this.type;
                        document.addEventListener(
                            focusEvents[type],
                            e => { globalEventListener(e, type); });
                    } :
                    function() {
                        document.addEventListener(
                            this.type,
                            globalEventListener,
                            true);
                    } :
                null
        });
    }

    i = 0;
    while(i < NON_BUBBLEABLE_NATIVE_EVENTS.length) {
        eventsCfg.set(NON_BUBBLEABLE_NATIVE_EVENTS[i++], {
            type : type,
            bubbles : false,
            set : false,
            setup : null
        });
    }
}

function addListener(domNode, type, listener) {
    if(!eventsCfg.has(type)) {
        return;
    }

    const cfg = eventsCfg.get(type);

    if(!cfg.set) {
        if(cfg.setup !== null) {
            cfg.setup();
        }
        else if(cfg.bubbles) {
            document.addEventListener(type, globalEventListener, false);
        }

        cfg.set = true;
    }

    const domNodeId = getDomNodeId(domNode);
    let listeners = listenersStorage.get(domNodeId);

    if(typeof listeners === 'undefined') {
        listenersStorage.set(domNodeId, listeners = {});
    }

    if(!(type in listeners)) {
        if(cfg.bubbles) {
            ++cfg.listenersCount;
        }
        else {
            domNode.addEventListener(type, eventListener, false);
        }
    }

    listeners[type] = listener;
}

function doRemoveListener(domNode, type) {
    if(eventsCfg.has(type)) {
        const cfg = eventsCfg.get(type);

        if(cfg.bubbles) {
            --cfg.listenersCount;
        }
        else {
            domNode.removeEventListener(type, eventListener);
        }
    }
}

function removeListener(domNode, type) {
    const domNodeId = getDomNodeId(domNode, true);

    if(domNodeId !== null) {
        const listeners = listenersStorage.get(domNodeId);

        if(typeof listeners !== 'undefined' && type in listeners) {
            listeners[type] = null;
            doRemoveListener(domNode, type);
        }
    }
}

function removeListeners(domNode) {
    const domNodeId = getDomNodeId(domNode, true);

    if(domNodeId !== null) {
        const listeners = listenersStorage.get(domNodeId);

        if(typeof listeners !== 'undefined') {
            for(const type in listeners) {
                if(listeners[type]) {
                    doRemoveListener(domNode, type);
                }
            }

            listenersStorage.delete(domNodeId);
        }
    }
}

function disableListeners() {
    areListenersEnabled = false;
}

function enableListeners() {
    areListenersEnabled = true;
}

export {
    addListener,
    removeListener,
    removeListeners,
    disableListeners,
    enableListeners
};
