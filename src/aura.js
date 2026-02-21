/**
 * Aura - Vue-like reactive framework with anti-AI-slop design
 * @see https://github.com/linyixia45/aura
 * @see ./AI.md - AI 使用说明
 */

// ============ Reactivity ============
let currentEffect = null;

class Dep {
  constructor() {
    this.subscribers = new Set();
  }
  depend() {
    if (currentEffect) this.subscribers.add(currentEffect);
  }
  notify() {
    this.subscribers.forEach((fn) => fn());
  }
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      if (!target.__deps__) target.__deps__ = {};
      if (!target.__deps__[key]) target.__deps__[key] = new Dep();
      target.__deps__[key].depend();
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      const ret = Reflect.set(target, key, value);
      target.__deps__?.[key]?.notify();
      return ret;
    },
  });
}

/** @param {*} initial - 初始值 @returns {{ value: * }} */
function ref(initial) {
  return reactive({ value: initial });
}

/** @param {() => *} getter @returns {{ value: * }} */
function computed(getter) {
  const r = ref(undefined);
  effect(() => { r.value = getter(); });
  return r;
}

function effect(fn) {
  const prev = currentEffect;
  currentEffect = fn;
  fn();
  currentEffect = prev;
}

function watch(getter, cb, opts = {}) {
  let prev = opts.immediate ? undefined : getter();
  const run = () => {
    const next = getter();
    if (opts.immediate || prev !== next) {
      cb(next, prev);
      prev = next;
    }
  };
  effect(run);
}

function watchEffect(fn) {
  effect(fn);
}

function toRefs(obj) {
  const refs = {};
  const unwrap = (v) => (v && typeof v === 'object' && 'value' in v ? v.value : v);
  for (const k of Object.keys(obj)) {
    refs[k] = { get value() { return unwrap(obj[k]); }, set value(v) { obj[k] = v; } };
  }
  return refs;
}

function nextTick(fn) {
  return Promise.resolve().then(fn || (() => {}));
}

/** @param {*} v - ref 或普通值 @returns {*} */
function unref(v) {
  return v && typeof v === 'object' && 'value' in v ? v.value : v;
}

/** @param {*} v @returns {boolean} */
function isRef(v) {
  return v != null && typeof v === 'object' && 'value' in v;
}

/** 浅层 ref，内部 value 变化不触发更新，仅 .value 替换时触发 */
function shallowRef(initial) {
  const r = { get value() { return r._v; }, set value(v) { r._v = v; r._dep?.notify(); } };
  r._v = initial;
  r._dep = { subscribers: new Set(), depend() { if (currentEffect) this.subscribers.add(currentEffect); }, notify() { this.subscribers.forEach((f) => f()); } };
  return new Proxy(r, {
    get(t, k) { if (k === 'value') t._dep.depend(); return Reflect.get(t, k); },
    set(t, k, v) { const ret = Reflect.set(t, k, v); if (k === 'value') t._dep?.notify(); return ret; },
  });
}

function defineComponent(options) {
  return options;
}

function createLifecycle(queues) {
  return {
    onMounted: (fn) => { if (typeof fn === 'function') queues.mount.push(fn); },
    onUnmounted: (fn) => { if (typeof fn === 'function') queues.unmount.push(fn); },
  };
}

// ============ Template Compiler ============
function getData(ctx) {
  const data = {};
  const unwrap = (v) => (v && typeof v === 'object' && 'value' in v ? v.value : v);
  for (const k of Object.keys(ctx)) {
    const v = ctx[k];
    data[k] = typeof v === 'function' ? v : unwrap(v);
  }
  return data;
}

function evalExpr(expr, data) {
  const keys = Object.keys(data);
  try {
    return new Function(...keys, `return (${expr})`)(...Object.values(data));
  } catch {
    return undefined;
  }
}

function escapeHtml(s) {
  if (s == null || typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function processVFor(html, data) {
  const re = /<(\w+)([^>]*)\s+v-for="\(?(\w+)(?:\s*,\s*(\w+))?\)?\s+in\s+([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g;
  return html.replace(re, (_, tag, before, itemVar, indexVar, listExpr, after, inner) => {
    const list = evalExpr(listExpr, data);
    if (!Array.isArray(list)) return '';
    return list
      .map((item, i) => {
        const scope = { ...data, [itemVar]: item, index: i };
        if (indexVar) scope[indexVar] = i;
        const innerHtml = processTemplate(inner, scope, null, { skipVModel: true });
        return `<${tag}${before}${after}>${innerHtml}</${tag}>`;
      })
      .join('');
  });
}

function processVBind(html, data) {
  return html.replace(/\s:(\w+)="([^"]+)"/g, (_, attr, expr) => {
    const v = evalExpr(expr, data);
    if (attr === 'checked' || attr === 'disabled') {
      return v ? ` ${attr}` : '';
    }
    return v != null ? ` ${attr}="${String(v).replace(/"/g, '&quot;')}"` : '';
  });
}

function injectVModelHandlers(template, ctx) {
  const re = /\s+v-model="([^"]+)"/g;
  let m;
  while ((m = re.exec(template))) {
    const expr = m[1].trim();
    const key = '__vmodel_' + expr.replace(/[.\s]/g, '_');
    if (ctx[key]) continue;
    ctx[key] = (e) => {
      const val = e.target.value;
      const parts = expr.split('.');
      let cur = ctx;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const next = cur[p];
        if (i === parts.length - 1) {
          if (next && typeof next === 'object' && 'value' in next) next.value = val;
          else if (cur && typeof cur === 'object') cur[p] = val;
          break;
        }
        cur = next && typeof next === 'object' && 'value' in next ? next.value : next;
      }
    };
  }
}

function processVModel(html, data, ctx) {
  return html.replace(/\s+v-model="([^"]+)"([^>]*)>/g, (_, expr, rest) => {
    const bind = expr.trim();
    const key = '__vmodel_' + bind.replace(/[.\s]/g, '_');
    return ` :value="${bind}" @input="${key}"${rest}>`;
  });
}

function processVShow(html, data) {
  return html.replace(/(<[^>]+)\s+v-show="([^"]+)"([^>]*)>/g, (_, pre, expr, post) => {
    const ok = !!evalExpr(expr, data);
    return pre + post + (ok ? '' : ' style="display:none"') + '>';
  });
}

function processClass(html, data) {
  return html.replace(/(<[^>]*?)\sclass="([^"]*)"([^>]*?)\s:class="([^"]+)"([^>]*)>/g, (_, pre, staticCls, mid, expr, post) => {
    const v = evalExpr(expr, data);
    const computed = !v ? [] : typeof v === 'string' ? v.split(/\s+/) : Array.isArray(v) ? v.flat() : typeof v === 'object' ? Object.entries(v).filter(([, ok]) => ok).map(([c]) => c) : [];
    const all = [...(staticCls ? staticCls.trim().split(/\s+/) : []), ...computed].filter(Boolean);
    const cls = [...new Set(all)].join(' ');
    return cls ? `${pre} class="${cls}"${mid}${post}>` : `${pre}${mid}${post}>`;
  }).replace(/(<[^>]*?)\s:class="([^"]+)"([^>]*)>/g, (_, pre, expr, post) => {
    const v = evalExpr(expr, data);
    const classes = !v ? [] : typeof v === 'string' ? v.split(/\s+/) : Array.isArray(v) ? v.flat() : typeof v === 'object' ? Object.entries(v).filter(([, ok]) => ok).map(([c]) => c) : [];
    return classes.length ? `${pre} class="${classes.join(' ')}"${post}>` : `${pre}${post}>`;
  });
}

function processStyle(html, data) {
  return html.replace(/\s:style="([^"]+)"/g, (_, expr) => {
    const v = evalExpr(expr, data);
    if (!v || typeof v !== 'object') return '';
    const s = Object.entries(v).map(([k, val]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${val}`).join(';');
    return s ? ` style="${s}"` : '';
  });
}

function processTemplate(template, data, ctx = {}, opts = {}) {
  let out = template.replace(/<[\s\S]*?v-pre[\s\S]*?>[\s\S]*?<\/\w+>/gi, (m) => m.replace(/\s+v-pre/g, ''));
  out = processVFor(out, data);
  if (!opts.skipVModel && ctx) out = processVModel(out, data, ctx);
  out = processVBind(out, data);
  out = processClass(out, data);
  out = processStyle(out, data);
  out = processVShow(out, data);
  out = out.replace(/\{\{\s*(.+?)\s*\}\}/g, (_, expr) => {
    const v = evalExpr(expr, data);
    return v == null ? '' : escapeHtml(String(v));
  });
  out = out.replace(/<(\w+)([^>]*)\s+v-html="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g, (_, tag, before, expr, after, _inner) => {
    const v = evalExpr(expr, data);
    return `<${tag}${before}${after}>${v != null ? String(v) : ''}</${tag}>`;
  });
  out = out.replace(/(<[^>]+)\s+v-if="([^"]+)"([^>]*)>/g, (_, pre, expr, post) => {
    const ok = !!evalExpr(expr, data);
    return ok ? pre + post + '>' : pre + post + ' style="display:none">';
  });
  out = out.replace(/\s+v-if="[^"]+"/g, '');
  return out;
}

function renderTemplate(template, ctx, container, mountQueue = []) {
  injectVModelHandlers(template, ctx);
  const update = () => {
    const data = getData(ctx);
    const html = processTemplate(template, data, ctx);
    container.innerHTML = html;
    container.setAttribute('data-aura-mounted', '1');
    bindEvents(container, ctx);
    container.querySelectorAll('[v-cloak]').forEach((el) => el.removeAttribute('v-cloak'));
  };
  update();
  effect(update);
  mountQueue.forEach((f) => f());
  return update;
}

const KEY_ALIAS = { enter: 'Enter', tab: 'Tab', esc: 'Escape', space: ' ' };
const EVENT_MODIFIERS = { prevent: (e) => e.preventDefault(), stop: (e) => e.stopPropagation() };
function bindEvents(container, ctx) {
  ['click', 'input', 'keydown', 'keyup', 'change', 'submit'].forEach((name) => {
    container.querySelectorAll('*').forEach((el) => {
      const attr = Array.from(el.attributes).find((a) => a.name.startsWith('@' + name) && (a.name === '@' + name || a.name.startsWith('@' + name + '.')));
      if (!attr) return;
      const handler = attr.value;
      const fn = ctx[handler];
      if (typeof fn !== 'function') {
        const s = String(handler).trim();
        if (!/^\w+\+\+$|^\w+--$/.test(s)) return;
      }
      const mods = attr.name.includes('.') ? attr.name.split('.').slice(1) : [];
      const run = typeof fn === 'function' ? fn : function () {
          const s = String(handler).trim();
          const inc = s.match(/^(\w+)\+\+$/);
          const dec = s.match(/^(\w+)--$/);
          if (inc && ctx[inc[1]]?.value !== undefined) ctx[inc[1]].value++;
          else if (dec && ctx[dec[1]]?.value !== undefined) ctx[dec[1]].value--;
        };
      el.addEventListener(name, (e) => {
        if (mods.includes('self') && e.target !== el) return;
        const keyMod = mods.find((m) => KEY_ALIAS[m] !== undefined);
        if (keyMod && e.key !== KEY_ALIAS[keyMod]) return;
        mods.forEach((m) => { if (EVENT_MODIFIERS[m]) EVENT_MODIFIERS[m](e); });
        (typeof fn === 'function' ? fn : run)(e);
      });
    });
  });
}

/**
 * 创建 Aura 应用
 * @param {{ template?: string, setup?: (api: { onMounted, onUnmounted }) => object }} options
 * @returns {{ mount: (selector: string|Element) => { el, ctx, unmount } }}
 */
function createApp(options) {
  const { template, setup, components = {} } = options;
  return {
    mount(selector) {
      const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!el) throw new Error('[Aura] mount 失败：未找到 "' + selector + '"，请检查该元素是否存在。参考：https://github.com/linyixia45/aura#readme');
      const mountQueue = [];
      const queues = { mount: [], unmount: [] };
      const api = createLifecycle(queues);
      const setupResult = typeof setup === 'function' ? setup(api) : {};
      const ctx = { ...setupResult };
      if (template) renderTemplate(template, ctx, el, queues.mount);
      return {
        el,
        ctx,
        unmount: () => queues.unmount.forEach((f) => f()),
      };
    },
    component(name, def) {
      components[name] = def;
      return this;
    },
  };
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createApp, defineComponent, ref, computed, reactive, unref, effect, watch, watchEffect, toRefs, nextTick };
} else {
  window.Aura = {
    createApp,
    defineComponent,
    ref,
    computed,
    reactive,
    unref,
    effect,
    watch,
    watchEffect,
    toRefs,
    nextTick,
  };
}
