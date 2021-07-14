
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.38.3 */

    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let br0;
    	let t0;
    	let nav;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let button0;
    	let span;
    	let t2;
    	let div0;
    	let ul;
    	let li;
    	let a1;
    	let t4;
    	let form;
    	let button1;
    	let t6;
    	let br1;
    	let t7;
    	let br2;
    	let t8;
    	let h10;
    	let t10;
    	let h4;
    	let t12;
    	let img1;
    	let img1_src_value;
    	let t13;
    	let br3;
    	let t14;
    	let br4;
    	let t15;
    	let img2;
    	let img2_src_value;
    	let t16;
    	let div3;
    	let div2;
    	let br5;
    	let t17;
    	let br6;
    	let t18;
    	let h11;
    	let t20;
    	let div1;
    	let p;
    	let t22;
    	let br7;
    	let t23;
    	let br8;
    	let t24;
    	let br9;
    	let t25;
    	let script0;
    	let script0_src_value;
    	let t26;
    	let script1;
    	let script1_src_value;
    	let t27;
    	let script2;
    	let script2_src_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			br0 = element("br");
    			t0 = space();
    			nav = element("nav");
    			a0 = element("a");
    			img0 = element("img");
    			t1 = space();
    			button0 = element("button");
    			span = element("span");
    			t2 = space();
    			div0 = element("div");
    			ul = element("ul");
    			li = element("li");
    			a1 = element("a");
    			a1.textContent = "Tutoria";
    			t4 = space();
    			form = element("form");
    			button1 = element("button");
    			button1.textContent = "Contactame";
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			h10 = element("h1");
    			h10.textContent = "Desarrollador Front-end y Desarrollador Brack-end.";
    			t10 = space();
    			h4 = element("h4");
    			h4.textContent = "I design and code beautifully simple things, and I love what I do.";
    			t12 = space();
    			img1 = element("img");
    			t13 = space();
    			br3 = element("br");
    			t14 = space();
    			br4 = element("br");
    			t15 = space();
    			img2 = element("img");
    			t16 = space();
    			div3 = element("div");
    			div2 = element("div");
    			br5 = element("br");
    			t17 = space();
    			br6 = element("br");
    			t18 = space();
    			h11 = element("h1");
    			h11.textContent = "Hola, Soy Ariel, Un gusto.";
    			t20 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem voluptatibus voluptates voluptate quos corporis odit temporibus sapiente fugiat cum ut. Laudantium cupiditate dignissimos optio esse animi incidunt corporis tenetur ullam.";
    			t22 = space();
    			br7 = element("br");
    			t23 = space();
    			br8 = element("br");
    			t24 = space();
    			br9 = element("br");
    			t25 = space();
    			script0 = element("script");
    			t26 = space();
    			script1 = element("script");
    			t27 = space();
    			script2 = element("script");
    			add_location(br0, file, 5, 1, 30);
    			if (img0.src !== (img0_src_value = "./images/logoMacario.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "height", "40");
    			add_location(img0, file, 8, 3, 126);
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "#");
    			add_location(a0, file, 7, 2, 89);
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file, 11, 3, 393);
    			attr_dev(button0, "class", "navbar-toggler");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "data-toggle", "collapse");
    			attr_dev(button0, "data-target", "#navbarSupportedContent");
    			attr_dev(button0, "aria-controls", "navbarSupportedContent");
    			attr_dev(button0, "aria-expanded", "false");
    			attr_dev(button0, "aria-label", "Toggle navigation");
    			add_location(button0, file, 10, 2, 191);
    			attr_dev(a1, "class", "nav-link text-warning lead mr-auto");
    			attr_dev(a1, "href", "#");
    			add_location(a1, file, 17, 6, 586);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file, 16, 5, 558);
    			attr_dev(ul, "class", "navbar-nav mr-auto");
    			add_location(ul, file, 15, 4, 521);
    			attr_dev(button1, "class", "btn btn-outline-warning my-2 my-sm-0");
    			attr_dev(button1, "type", "submit");
    			add_location(button1, file, 22, 4, 722);
    			attr_dev(form, "class", "form-inline my-2 my-lg-0");
    			add_location(form, file, 21, 3, 678);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarSupportedContent");
    			add_location(div0, file, 14, 2, 450);
    			attr_dev(nav, "class", "navbar navbar-expand-lg navbar-light svelte-1ruxz64");
    			add_location(nav, file, 6, 1, 36);
    			add_location(br1, file, 27, 1, 846);
    			add_location(br2, file, 28, 1, 852);
    			attr_dev(h10, "class", "display-5 text-center p-5");
    			add_location(h10, file, 29, 1, 858);
    			attr_dev(h4, "class", "text-center lead");
    			add_location(h4, file, 31, 1, 955);
    			if (img1.src !== (img1_src_value = "./images/avtarMacario.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "AvatarMac");
    			attr_dev(img1, "class", "rounded mx-auto d-block");
    			attr_dev(img1, "width", "250px");
    			attr_dev(img1, "height", "210px");
    			add_location(img1, file, 32, 1, 1057);
    			add_location(br3, file, 33, 1, 1173);
    			add_location(br4, file, 34, 1, 1179);
    			if (img2.src !== (img2_src_value = "./images/imageAbstract.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Dia a Dia");
    			attr_dev(img2, "class", "rounded mx-auto d-block");
    			add_location(img2, file, 35, 1, 1185);
    			add_location(br5, file, 38, 3, 1347);
    			add_location(br6, file, 39, 3, 1355);
    			attr_dev(h11, "class", "display-4 text-center p-5 text-white");
    			add_location(h11, file, 40, 3, 1363);
    			attr_dev(p, "class", "lead text-white text-center");
    			add_location(p, file, 42, 4, 1484);
    			attr_dev(div1, "class", "text-wrap mx-auto");
    			add_location(div1, file, 41, 3, 1447);
    			add_location(br7, file, 44, 3, 1773);
    			add_location(br8, file, 45, 3, 1781);
    			add_location(br9, file, 46, 3, 1789);
    			attr_dev(div2, "class", "p-3 mb-2 bg-warning");
    			add_location(div2, file, 37, 2, 1309);
    			set_style(div3, "position", "relative");
    			add_location(div3, file, 36, 1, 1273);
    			if (script0.src !== (script0_src_value = "https://code.jquery.com/jquery-3.2.1.slim.min.js")) attr_dev(script0, "src", script0_src_value);
    			attr_dev(script0, "integrity", "sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN");
    			attr_dev(script0, "crossorigin", "anonymous");
    			add_location(script0, file, 62, 1, 2099);
    			if (script1.src !== (script1_src_value = "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js")) attr_dev(script1, "src", script1_src_value);
    			attr_dev(script1, "integrity", "sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q");
    			attr_dev(script1, "crossorigin", "anonymous");
    			add_location(script1, file, 63, 1, 2281);
    			if (script2.src !== (script2_src_value = "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js")) attr_dev(script2, "src", script2_src_value);
    			attr_dev(script2, "integrity", "sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl");
    			attr_dev(script2, "crossorigin", "anonymous");
    			add_location(script2, file, 64, 1, 2488);
    			add_location(main, file, 4, 0, 22);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, br0);
    			append_dev(main, t0);
    			append_dev(main, nav);
    			append_dev(nav, a0);
    			append_dev(a0, img0);
    			append_dev(nav, t1);
    			append_dev(nav, button0);
    			append_dev(button0, span);
    			append_dev(nav, t2);
    			append_dev(nav, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li);
    			append_dev(li, a1);
    			append_dev(div0, t4);
    			append_dev(div0, form);
    			append_dev(form, button1);
    			append_dev(main, t6);
    			append_dev(main, br1);
    			append_dev(main, t7);
    			append_dev(main, br2);
    			append_dev(main, t8);
    			append_dev(main, h10);
    			append_dev(main, t10);
    			append_dev(main, h4);
    			append_dev(main, t12);
    			append_dev(main, img1);
    			append_dev(main, t13);
    			append_dev(main, br3);
    			append_dev(main, t14);
    			append_dev(main, br4);
    			append_dev(main, t15);
    			append_dev(main, img2);
    			append_dev(main, t16);
    			append_dev(main, div3);
    			append_dev(div3, div2);
    			append_dev(div2, br5);
    			append_dev(div2, t17);
    			append_dev(div2, br6);
    			append_dev(div2, t18);
    			append_dev(div2, h11);
    			append_dev(div2, t20);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div2, t22);
    			append_dev(div2, br7);
    			append_dev(div2, t23);
    			append_dev(div2, br8);
    			append_dev(div2, t24);
    			append_dev(div2, br9);
    			append_dev(main, t25);
    			append_dev(main, script0);
    			append_dev(main, t26);
    			append_dev(main, script1);
    			append_dev(main, t27);
    			append_dev(main, script2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
