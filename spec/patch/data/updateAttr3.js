import patchOps from '../../../src/client/patchOps';
import { h } from '../../../src/vidom';

const node = h('button', { value : 'text' });

export default {
    'name' : 'updateAttr3',
    'trees' : [
        h('div', null, h('button', { value : 'text' }), node),
        h('div', null, h('button', { value : 'text' }), h('button', { value : 'new text' }))
    ],
    'patch' : [
        { op : patchOps.updateAttr, args : [node, 'value', 'new text'] }
    ]
};
