import escapeAttr from '../utils/escapeAttr';
import isInArray from '../utils/isInArray';
import dasherize from '../utils/dasherize';
import merge from '../utils/merge';
import { IS_DEBUG } from '../utils/debug';

function setAttr(node, name, val) {
    if(name === 'type' && node.tagName === 'INPUT') {
        const { value } = node; // value will be lost in IE if type is changed

        node.setAttribute(name, '' + val);
        node.value = value;
    }
    else {
        node.setAttribute(getAttrName(name), '' + val);
    }
}

function setBooleanAttr(node, name, val) {
    if(val) {
        setAttr(node, name, val);
    }
    else {
        removeAttr(node, name);
    }
}

function setProp(node, name, val) {
    node[name] = val;
}

function setObjProp(node, name, val) {
    if(IS_DEBUG) {
        const typeOfVal = typeof val;

        if(typeOfVal !== 'object') {
            throw TypeError(`vidom: "${name}" attribute value must be an object, not a ${typeOfVal}`);
        }
    }

    const prop = node[name];

    for(const i in val) {
        prop[i] = val[i] == null? '' : val[i];
    }
}

function setPropWithCheck(node, name, val) {
    if(name === 'value' && node.tagName === 'SELECT') {
        setSelectValue(node, val);
    }
    else if(node[name] !== val) {
        node[name] = val;
    }
}

function removeAttr(node, name) {
    node.removeAttribute(getAttrName(name));
}

function removeProp(node, name) {
    if(name === 'style') {
        node[name].cssText = '';
    }
    else if(name === 'value' && node.tagName === 'SELECT') {
        removeSelectValue(node);
    }
    else {
        node[name] = getDefaultPropVal(node.tagName, name);
    }
}

function setSelectValue(node, value) {
    const isMultiple = Array.isArray(value);

    if(isMultiple) {
        const { options } = node,
            len = options.length;
        let i = 0,
            optionNode;

        while(i < len) {
            optionNode = options[i++];
            optionNode.selected = value != null && isInArray(value, optionNode.value);
        }
    }
    else {
        node.value = value;
    }
}

function removeSelectValue(node) {
    const { options } = node,
        len = options.length;
    let i = 0;

    while(i < len) {
        options[i++].selected = false;
    }
}

function attrToString(name, value) {
    const attrName = getAttrName(name);

    return attrName &&
        attrName + '="' + escapeAttr(value) + '"';
}

function booleanAttrToString(name, value) {
    return value? getAttrName(name) : '';
}

function overloadedBooleanAttrToString(name, value) {
    return typeof value === 'boolean'?
        booleanAttrToString(name, value) :
        attrToString(name, value);
}

function stylePropToString(name, value) {
    let styles = '',
        i;

    for(i in value) {
        if(value[i] != null) {
            styles += dasherize(i) + ':' + value[i] + ';';
        }
    }

    return styles? name + '="' + styles + '"' : styles;
}

const defaultNodes = Object.create(null),
    defaultPropVals = Object.create(null);

function getDefaultPropVal(tag, attrName) {
    const key = `${tag}:${attrName}`;

    if(key in defaultPropVals) {
        return defaultPropVals[key];
    }

    const node = tag in defaultNodes?
        defaultNodes[tag] :
        defaultNodes[tag] = document.createElement(tag);

    return defaultPropVals[key] = node[attrName];
}

const VALID_ATTRIBUTE_NAME_START_CHAR =
        ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD',
    VALID_ATTRIBUTE_NAME_CHAR = `${VALID_ATTRIBUTE_NAME_START_CHAR}\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040`,
    VALID_ATTRIBUTE_NAME_RE = new RegExp(`^[${VALID_ATTRIBUTE_NAME_START_CHAR}][${VALID_ATTRIBUTE_NAME_CHAR}]*$`),
    attrNames = Object.create(null);

function getAttrName(attrName) {
    return attrName in attrNames?
        attrNames[attrName] :
        attrNames[attrName] = VALID_ATTRIBUTE_NAME_RE.test(attrName)?
            attrName.toLowerCase() :
            '';
}

const DEFAULT_ATTR_CFG = {
        set : setAttr,
        remove : removeAttr,
        toString : attrToString
    },
    BOOLEAN_ATTR_CFG = merge(
        DEFAULT_ATTR_CFG,
        {
            set : setBooleanAttr,
            toString : booleanAttrToString
        }),
    OVERLOADED_BOOLEAN_ATTR_CFG = merge(
        BOOLEAN_ATTR_CFG,
        {
            toString : overloadedBooleanAttrToString
        }),
    DEFAULT_PROP_CFG = {
        set : setProp,
        remove : removeProp,
        toString : attrToString
    },
    BOOLEAN_PROP_CFG = merge(
        DEFAULT_PROP_CFG,
        {
            toString : booleanAttrToString
        }),
    attrsCfg = Object.create(null);

attrNames.acceptCharset = 'accept-charset';
attrNames.className = 'class';
attrNames.htmlFor = 'for';
attrNames.httpEquiv = 'http-equiv';

attrsCfg.autoPlay = BOOLEAN_ATTR_CFG;
attrsCfg.checked = BOOLEAN_PROP_CFG;
attrsCfg.controls = DEFAULT_PROP_CFG;
attrsCfg.disabled = BOOLEAN_ATTR_CFG;
attrsCfg.download = OVERLOADED_BOOLEAN_ATTR_CFG;
attrsCfg.id = DEFAULT_PROP_CFG;
attrsCfg.ismap = BOOLEAN_ATTR_CFG;
attrsCfg.loop = DEFAULT_PROP_CFG;
attrsCfg.multiple = BOOLEAN_PROP_CFG;
attrsCfg.muted = DEFAULT_PROP_CFG;
attrsCfg.open = BOOLEAN_ATTR_CFG;
attrsCfg.readOnly = BOOLEAN_PROP_CFG;
attrsCfg.selected = BOOLEAN_PROP_CFG;
attrsCfg.srcDoc = DEFAULT_PROP_CFG;
attrsCfg.style = {
    set : setObjProp,
    remove : removeProp,
    toString : stylePropToString
};
attrsCfg.value = {
    set : setPropWithCheck,
    remove : removeProp,
    toString : attrToString
};

export default function(attrName) {
    return attrName in attrsCfg?
        attrsCfg[attrName] :
        DEFAULT_ATTR_CFG;
}
