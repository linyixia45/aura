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

/** provide/inject 跨组件通信（Vue 风格） */
function createProvideInject() {
  const provides = {};
  return {
    provide: (key, value) => { provides[key] = value; },
    inject: (key) => provides[key],
    _provides: provides,
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

/** kebab-case → PascalCase */
function toPascal(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase());
}

/** 从属性字符串解析 props：key="val" 与 :key="expr"，跳过指令 */
function parseProps(attrStr, data) {
  const props = {};
  const skip = (k) => k.startsWith('v-') || k.startsWith('@');
  let m;
  const staticRe = /\s+(\w+)=["']([^"']*)["']/g;
  while ((m = staticRe.exec(attrStr))) { if (!skip(m[1])) props[m[1]] = m[2]; }
  const bindRe = /\s:(\w+)=["']([^"']+)["']/g;
  while ((m = bindRe.exec(attrStr))) {
    if (skip(m[1])) continue;
    const v = evalExpr(m[2], data);
    if (v !== undefined) props[m[1]] = v;
  }
  return props;
}

function processComponents(html, data, ctx, components, opts = {}) {
  if (!components || !Object.keys(components).length) return html;
  const compNames = Object.keys(components);
  const tagToComp = {};
  compNames.forEach((n) => { const p = n.includes('-') ? toPascal(n) : n; tagToComp[p] = components[n]; tagToComp[n] = components[n]; });
  let id = opts.__componentId || 0;
  const componentCtxs = opts.componentCtxs || {};
  let out = '';
  let lastEnd = 0;
  const re = /<(\w+(?:-\w+)*)(\s[^>]*?)?(\s*\/?>)/g;
  let match;
  while ((match = re.exec(html))) {
    const tag = match[1];
    const attrStr = match[2] || '';
    const closing = match[3];
    const comp = tagToComp[tag] || tagToComp[toPascal(tag)];
    out += html.slice(lastEnd, match.index);
    if (!comp || !comp.template) {
      lastEnd = re.lastIndex;
      continue;
    }
    const start = match.index;
    const isSelfClose = /\/\s*>$/.test(closing);
    let slotContent = '';
    let end = start + match[0].length;
    if (!isSelfClose) {
      const closeEnd = findElementEnd(html, start);
      if (closeEnd !== -1) {
        const innerStart = start + match[0].length;
        slotContent = html.slice(innerStart, closeEnd - `</${tag}>`.length);
        end = closeEnd;
      }
    }
    const props = parseProps(attrStr, data);
    const api = createLifecycle({ mount: [], unmount: [] });
    const inject = opts.inject || (() => undefined);
    const setupResult = typeof comp.setup === 'function' ? comp.setup({ ...api, props, inject }) : {};
    const childCtx = { ...ctx, ...props, ...setupResult };
    componentCtxs[id] = childCtx;
    let compTpl = comp.template.replace(/<slot\s*\/?>[\s\S]*?<\/slot>|<slot\s*\/\s*>/gi, slotContent);
    const prefix = `__c${id}_`;
    Object.keys(setupResult).forEach((k) => {
      if (typeof setupResult[k] === 'function') {
        ctx[prefix + k] = setupResult[k];
        compTpl = compTpl.replace(new RegExp(`@(\\w+)=["']${k}["']`, 'g'), `@$1="${prefix}${k}"`);
      }
    });
    id++;
    const compData = getData(childCtx);
    const compHtml = processTemplate(compTpl, compData, childCtx, { ...opts, components, __componentId: id, componentCtxs, inject: opts.inject, skipVModel: false });
    out += `<aura-c data-aura-cid="${id - 1}">` + compHtml + `</aura-c>`;
    lastEnd = end;
    re.lastIndex = end;
  }
  out += html.slice(lastEnd);
  if (opts.componentCtxs) Object.assign(opts.componentCtxs, componentCtxs);
  return out;
}

function processVFor(html, data) {
  const re = /<(\w+)([^>]*)\s+v-for="\(?(\w+)(?:\s*,\s*(\w+))?\)?\s+in\s+([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g;
  return html.replace(re, (_, tag, before, itemVar, indexVar, listExpr, after, inner) => {
    const list = evalExpr(listExpr, data);
    if (!Array.isArray(list)) return '';
    const attrs = before + ' ' + after;
    const keyMatch = attrs.match(/\s:key="([^"]+)"/);
    const keyExpr = keyMatch ? keyMatch[1] : null;
    const stripKey = (s) => s.replace(/\s:key="[^"]+"/, '');
    return list
      .map((item, i) => {
        const scope = { ...data, [itemVar]: item, index: i };
        if (indexVar) scope[indexVar] = i;
        const innerHtml = processTemplate(inner, scope, null, { skipVModel: true });
        const keyAttr = keyExpr ? ` data-key="${escapeHtml(String(evalExpr(keyExpr, scope) ?? i))}"` : '';
        return `<${tag}${stripKey(before)}${stripKey(after)}${keyAttr}>${innerHtml}</${tag}>`;
      })
      .join('');
  });
}

/** v-once：一次性渲染，不再响应更新（Vue/Alpine 风格） */
function processVOnce(html, data) {
  return html.replace(/<(\w+)([^>]*)\s+v-once([^>]*)>([\s\S]*?)<\/\1>/g, (_, tag, before, after, inner) => {
    const scope = { ...data };
    const innerProcessed = inner.replace(/\{\{\s*(.+?)\s*\}\}/g, (__, expr) => {
      const v = evalExpr(expr, scope);
      return v == null ? '' : escapeHtml(String(v));
    });
    return `<${tag}${before}${after}>${innerProcessed}</${tag}>`;
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

/** 找到从 start 开始的完整元素（含嵌套）的结束位置 */
function findElementEnd(html, start) {
  const m = html.slice(start).match(/^<(\w+)([^>]*)>/);
  if (!m) return -1;
  const tag = m[1];
  let depth = 1;
  let pos = start + m[0].length;
  const openRe = new RegExp(`<${tag}(?:\\s|>)`, 'g');
  const closeStr = `</${tag}>`;
  while (depth > 0 && pos < html.length) {
    const nextClose = html.indexOf(closeStr, pos);
    if (nextClose === -1) return -1;
    openRe.lastIndex = pos;
    const nextOpen = openRe.exec(html);
    if (nextOpen && nextOpen.index < nextClose) {
      depth++;
      pos = nextOpen.index + 1;
    } else {
      depth--;
      pos = nextClose + closeStr.length;
      if (depth === 0) return pos;
    }
  }
  return -1;
}

function processVIfElse(html, data) {
  const re = /<(?:(\w+)([^>]*?)\s+v-if="([^"]+)"([^>]*)>|(\w+)([^>]*?)\s+v-else-if="([^"]+)"([^>]*)>|(\w+)([^>]*?)\s+v-else(?!-if)([^>]*)>)/g;
  let out = '';
  let lastEnd = 0;
  let chain = null;
  let chainStart = 0;

  const flushChain = () => {
    if (!chain) return;
    let chosen = -1;
    for (let i = 0; i < chain.length; i++) {
      if (chain[i].condition === null || !!evalExpr(chain[i].condition, data)) {
        chosen = i;
        break;
      }
    }
    const strip = (s) => s.replace(/\s+v-if="[^"]+"/g, '').replace(/\s+v-else-if="[^"]+"/g, '').replace(/\s+v-else(?!-if)/g, '');
    if (chosen >= 0) out += strip(chain[chosen].full);
    chain = null;
  };

  let match;
  while ((match = re.exec(html))) {
    const isIf = match[3] !== undefined;
    const isElseIf = match[7] !== undefined;
    const isElse = match[10] !== undefined;
    const start = match.index;
    const end = findElementEnd(html, start);
    if (end === -1) continue;
    const full = html.slice(start, end);

    if (isIf) {
      flushChain();
      out += html.slice(lastEnd, start);
      chain = [{ condition: match[3], full }];
    } else if (isElseIf && chain) {
      chain.push({ condition: match[7], full });
    } else if (isElse && chain) {
      chain.push({ condition: null, full });
    }
    lastEnd = end;
    re.lastIndex = end;
  }
  flushChain();
  out += html.slice(lastEnd);
  return out;
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
  out = processVOnce(out, data);
  out = processVIfElse(out, data);
  if (opts.components && Object.keys(opts.components).length) {
    opts.componentCtxs = opts.componentCtxs || {};
    out = processComponents(out, data, ctx, opts.components, opts);
  }
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
  return out;
}

function renderTemplate(template, ctx, container, mountQueue = [], opts = {}) {
  injectVModelHandlers(template, ctx);
  const { components = {}, inject } = opts;
  const update = () => {
    const data = getData(ctx);
    const html = processTemplate(template, data, ctx, { components, inject });
    container.innerHTML = html;
    container.setAttribute('data-aura-mounted', '1');
    assignTemplateRefs(container, ctx);
    bindEvents(container, ctx);
    container.querySelectorAll('[v-cloak]').forEach((el) => el.removeAttribute('v-cloak'));
  };
  update();
  effect(update);
  mountQueue.forEach((f) => f());
  return update;
}

function assignTemplateRefs(container, ctx) {
  container.querySelectorAll('[ref]').forEach((el) => {
    const name = el.getAttribute('ref');
    if (!name || !ctx) return;
    const r = ctx[name];
    if (r && typeof r === 'object' && 'value' in r) r.value = el;
    else ctx[name] = el;
  });
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
  const { template, setup, components = {}, provide: provideOpt } = options;
  const pi = createProvideInject();
  if (provideOpt) {
    const val = typeof provideOpt === 'function' ? provideOpt() : provideOpt;
    Object.keys(val || {}).forEach((k) => pi.provide(k, val[k]));
  }
  const inject = (key) => pi.inject(key);
  return {
    mount(selector) {
      const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!el) throw new Error('[Aura] 找不到挂载点 "' + selector + '"。可能是选择器写错了，或者页面还没加载好？检查一下 DOM 里是否有这个元素，或者看看 README：https://github.com/linyixia45/aura#readme');
      const mountQueue = [];
      const queues = { mount: [], unmount: [] };
      const api = createLifecycle(queues);
      const setupResult = typeof setup === 'function' ? setup({ ...api, inject }) : {};
      const ctx = { ...setupResult };
      const tpl = template || el.innerHTML.trim();
      if (tpl) renderTemplate(tpl, ctx, el, queues.mount, { components, inject });
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
const version = '0.1.0';
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { version, createApp, defineComponent, ref, computed, reactive, unref, isRef, shallowRef, effect, watch, watchEffect, toRefs, nextTick };
} else {
  window.Aura = {
    version,
    createApp,
    defineComponent,
    ref,
    computed,
    reactive,
    unref,
    isRef,
    shallowRef,
    effect,
    watch,
    watchEffect,
    toRefs,
    nextTick,
  };
}
