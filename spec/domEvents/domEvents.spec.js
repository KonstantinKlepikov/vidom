import sinon from 'sinon';
import createNode from '../../lib/createNode';
import createComponent from '../../lib/createComponent';
import { mountToDomSync, unmountFromDomSync } from '../../lib/client/mounter';
import SyntheticEvent from '../../lib/client/events/SyntheticEvent';
import isEventSupported from '../../lib/client/events/isEventSupported';
import simulate from 'simulate';

describe('domEvents', () => {
    let domNode;
    beforeEach(() => {
        document.body.appendChild(domNode = document.createElement('div'));
    });

    afterEach(() => {
        unmountFromDomSync(domNode);
        document.body.removeChild(domNode);
    });

    describe('bubbleable events', () => {
        it('should properly add handler', () => {
            const spy1 = sinon.spy(),
                spy2 = sinon.spy(),
                spy3 = sinon.spy();

            mountToDomSync(
                domNode,
                createNode('div').attrs({ onClick : spy1 }).children([
                    createNode('div').attrs({ onClick : spy2 }).children(
                        createNode('div').attrs({ id : 'id1' })),
                    createNode('div').attrs({ onClick : spy3 }).children(
                        createNode('div').attrs({ id : 'id2' }))
                ]));

            simulate.click(document.getElementById('id1'));

            expect(spy1.called).to.be.ok();
            expect(spy2.called).to.be.ok();
            expect(spy3.called).not.to.be.ok();

            simulate.click(document.getElementById('id2'));

            expect(spy1.calledTwice).to.be.ok();
            expect(spy2.calledOnce).to.be.ok();
            expect(spy3.called).to.be.ok();
        });

        it('should properly call handler with SyntheticEvent object', () => {
            const spy = sinon.spy();

            mountToDomSync(
                domNode,
                createNode('div').attrs({ id : 'id1', onClick : spy }));

            simulate.click(document.getElementById('id1'));

            const e = spy.args[0][0];

            expect(e).to.be.an(SyntheticEvent);
            expect(e.type).to.be.equal('click');
            expect(e.nativeEvent.type).to.be.equal('click');
        });

        it('should properly stop propagation', () => {
            const spy = sinon.spy();

            mountToDomSync(
                domNode,
                createNode('div').attrs({ onClick : spy }).children(
                    createNode('div').attrs({
                        id : 'id1',
                        onClick : function(e) {
                            e.stopPropagation();
                        }
                    })));

            simulate.click(document.getElementById('id1'));

            expect(spy.called).not.to.be.ok();
        });

        it('should properly prevent default', () => {
            mountToDomSync(
                domNode,
                createNode('input').attrs({
                    type : 'checkbox',
                    id : 'id1',
                    onClick : function(e) {
                        e.preventDefault();
                    }
                }));

            simulate.click(document.getElementById('id1'));

            expect(document.getElementById('id1').checked).not.to.be.ok();
        });

        it('should properly remove handler', () => {
            const spy1 = sinon.spy(),
                spy2 = sinon.spy();

            mountToDomSync(
                domNode,
                createNode('div').attrs({ id : 'id1', onClick : spy1 }));

            mountToDomSync(
                domNode,
                createNode('div').attrs({ id : 'id1', onDblClick : spy2 }));

            simulate.click(document.getElementById('id1'));
            simulate.dblclick(document.getElementById('id1'));

            expect(spy1.called).not.to.be.ok();
            expect(spy2.called).to.be.ok();
        });

        it('should properly replace handler for bubbleable events', () => {
            var spy1 = sinon.spy(),
                spy2 = sinon.spy();

            mountToDomSync(
                domNode,
                createNode('div').attrs({ id : 'id1', onClick : spy1 }));

            mountToDomSync(
                domNode,
                createNode('div').attrs({ id : 'id1', onClick : spy2 }));

            simulate.click(document.getElementById('id1'));

            expect(spy1.called).not.to.be.ok();
            expect(spy2.called).to.be.ok();
        });

        it('should properly simulate bubbling of focus event', () => {
            const spy = sinon.spy();

            mountToDomSync(
                domNode,
                createNode('div').attrs({ id : 'id1', onFocus : spy })
                    .children(createNode('input')));

            simulate[isEventSupported('focusin')? 'focusin' : 'focus'](document.getElementById('id1'));

            expect(spy.called).to.be.ok();
        });

        it('should properly simulate bubbling of blur event', () => {
            const spy = sinon.spy();

            mountToDomSync(
                domNode,
                createNode('div').attrs({ onBlur : spy }).children(
                    createNode('input').attrs({ id : 'id1' })));

            simulate.focus(document.getElementById('id1'));
            simulate[isEventSupported('focusout')? 'focusout' : 'blur'](document.getElementById('id1'));

            expect(spy.called).to.be.ok();
        });

        it('should properly add handler when existing dom is adopted', () => {
            const spy1 = sinon.spy(),
                spy2 = sinon.spy();

            domNode.innerHTML= '<div><div><div id="id1"></div></div></div>';

            mountToDomSync(
                domNode,
                createNode('div').attrs({ onClick : spy1 }).children(
                    createNode('div').attrs({ onClick : spy2 }).children(
                        createNode('div').attrs({ id : 'id1' }))));

            simulate.click(document.getElementById('id1'));

            expect(spy1.called).to.be.ok();
            expect(spy2.called).to.be.ok();
        });
    });

    describe('non-bubbleable events', () => {
        it('should properly add handler', () => {
            const spy1 = sinon.spy(),
                spy2 = sinon.spy(),
                spy3 = sinon.spy();

            mountToDomSync(
                domNode,
                createNode('div').attrs({ onScroll : spy1 }).children([
                    createNode('div').attrs({ id : 'id1', onScroll : spy2 }),
                    createNode('div').attrs({ id : 'id2', onScroll : spy3 })
                ]));

            simulate.scroll(document.getElementById('id1'));

            expect(spy1.called).not.to.be.ok();
            expect(spy2.called).to.be.ok();
            expect(spy3.called).not.to.be.ok();
        });

        it('should properly call handler with SyntheticEvent object', () => {
            const spy = sinon.spy();

            mountToDomSync(
                domNode,
                createNode('div').attrs({ id : 'id1', onScroll : spy }));

            simulate.scroll(document.getElementById('id1'));

            const e = spy.args[0][0];

            expect(e).to.be.an(SyntheticEvent);
            expect(e.type).to.be.equal('scroll');
        });

        it('should properly remove handler', () => {
            const spy = sinon.spy();

            mountToDomSync(
                domNode,
                createNode('div').attrs({ id : 'id1', onScroll : spy }));

            mountToDomSync(
                domNode,
                createNode('div').attrs({ id : 'id1' }));

            simulate.scroll(document.getElementById('id1'));

            expect(spy.called).not.to.be.ok();
        });

        it('should properly replace handler for bubbleable events', () => {
            const spy1 = sinon.spy(),
                spy2 = sinon.spy();

            mountToDomSync(
                domNode,
                createNode('div').attrs({ id : 'id1', onScroll : spy1 }));

            mountToDomSync(
                domNode,
                createNode('div').attrs({ id : 'id1', onScroll : spy2 }));

            simulate.scroll(document.getElementById('id1'));

            expect(spy1.called).not.to.be.ok();
            expect(spy2.called).to.be.ok();
        });
    });
});
