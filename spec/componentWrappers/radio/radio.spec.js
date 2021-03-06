import simulate from 'simulate';
import { h, mountSync, unmountSync } from '../../../src/vidom';

describe('radio', () => {
    let domNode;

    beforeEach(() => {
        document.body.appendChild(domNode = document.createElement('div'));
    });

    afterEach(() => {
        unmountSync(domNode);
        document.body.removeChild(domNode);
    });

    it('should maintain checked property', () => {
        mountSync(domNode, h('div', null, [
            h('input', { type : 'radio', name : 'test', id : 'id1', checked : true }),
            h('input', { type : 'radio', name : 'test', id : 'id2', checked : false })
        ]));

        const secondRadio = document.getElementById('id2');

        secondRadio.checked = true;
        simulate.change(secondRadio);

        expect(document.getElementById('id1').checked).to.be.ok();
    });

    it('should update checked property', () => {
        let checkedState = false;

        function onChange() {
            checkedState = !checkedState;
            render();
        }

        function render() {
            mountSync(domNode, h('div', null, [
                h('input', { type : 'radio', name : 'test', id : 'id1', checked : !checkedState }),
                h('input', { type : 'radio', name : 'test', id : 'id2', checked : checkedState, onChange })
            ]));
        }

        render();

        const secondRadio = document.getElementById('id2');

        secondRadio.checked = true;
        simulate.change(secondRadio);

        expect(document.getElementById('id1').checked).not.to.be.ok();
        expect(secondRadio.checked).to.be.ok();
    });

    it('should return dom node as ref', () => {
        let ref;

        mountSync(
            domNode,
            h('input', { type : 'radio', id : 'id1', ref(_ref) { ref = _ref; } }));

        expect(ref === document.getElementById('id1'));
    });
});
