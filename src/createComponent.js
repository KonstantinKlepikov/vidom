import noOp from './utils/noOp';
import rafBatch from './client/rafBatch';
import createNode from './createNode';

const emptyAttrs = {};

function mountComponent() {
    this._isMounted = true;
    this._rootNode.mount();
    this.onMount(this.getAttrs());
}

function unmountComponent() {
    this._isMounted = false;
    this._domRefs = null;
    this._rootNode.unmount();
    this.onUnmount();
}

function patchComponent(attrs, children) {
    let prevRootNode = this._rootNode,
        prevAttrs = this._attrs;

    if(prevAttrs !== attrs) {
        this._attrs = attrs;
        if(this.isMounted()) {
            this._isUpdating = true;
            this.onAttrsReceive(this.getAttrs(), prevAttrs || emptyAttrs);
            this._isUpdating = false;
        }
    }

    this._children = children;

    if(this.isMounted()) {
        this._rootNode = this.render();
        prevRootNode.patch(this._rootNode);
        this.onUpdate(attrs);
    }
}

function renderComponentToDom(parentNode) {
    return this._rootNode.renderToDom(parentNode);
}

function renderComponentToString(ctx) {
    return this._rootNode.renderToString(ctx);
}

function adoptComponentDom(domNode, parentNode) {
    this._rootNode.adoptDom(domNode, parentNode);
}

function getComponentDomNode() {
    return this._rootNode.getDomNode();
}

function getComponentAttrs() {
    return this._attrs || emptyAttrs;
}

function renderComponent() {
    this._domRefs = {};
    return this.onRender(this.getAttrs(), this._children) ||
        createNode('noscript');
}

function updateComponent(cb, cbCtx) {
    if(this._isUpdating) {
        cb && rafBatch(() => cb.call(cbCtx || this));
    }
    else {
        this._isUpdating = true;
        rafBatch(() => {
            if(this.isMounted()) {
                this.patch(this._attrs, this._children);
                this._isUpdating = false;
                cb && cb.call(cbCtx || this);
            }
        });
    }
}

function isComponentMounted() {
    return this._isMounted;
}

function setComponentDomRef(ref, node) {
    return this._domRefs[ref] = node;
}

function getComponentDomRef(ref) {
    return this._domRefs[ref]?
        this._domRefs[ref].getDomNode() :
        null;
}

function createComponent(props, staticProps) {
    const res = function(attrs, children) {
            this._attrs = attrs;
            this._children = children;
            this._domRefs = null;
            this._isMounted = false;
            this._isUpdating = false;
            this.onInit();
            this._rootNode = this.render();
        },
        ptp = {
            constructor : res,
            onInit : noOp,
            mount : mountComponent,
            unmount : unmountComponent,
            onMount : noOp,
            onUnmount : noOp,
            onAttrsReceive : noOp,
            onUpdate : noOp,
            isMounted : isComponentMounted,
            renderToDom : renderComponentToDom,
            renderToString : renderComponentToString,
            adoptDom : adoptComponentDom,
            getDomNode : getComponentDomNode,
            render : renderComponent,
            onRender : noOp,
            update : updateComponent,
            patch : patchComponent,
            getDomRef : getComponentDomRef,
            setDomRef : setComponentDomRef,
            getAttrs : getComponentAttrs
        };

    for(let i in props) {
        ptp[i] = props[i];
    }

    res.prototype = ptp;

    for(let i in staticProps) {
        res[i] = staticProps[i];
    }

    return res;
}

export default createComponent;