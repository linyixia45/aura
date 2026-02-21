/**
 * Aura - Vue-like reactive framework with anti-AI-slop design
 * 类似 Vue 的响应式框架，内置反「AI 味」设计系统
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

function ref(initial) {
  return reactive({ value: initial });
}

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
  Promise.resolve().then(fn || (() => {}));
}

function createOnMounted(queue) {
  return (fn) => {
    if (typeof fn === 'function') queue.push(fn);
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
  const re = /<(\w+)([^>]*)\s+v-for="(\w+)\s+in\s+([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g;
  return html.replace(re, (_, tag, before, itemVar, listExpr, after, inner) => {
    const list = evalExpr(listExpr, data);
    if (!Array.isArray(list)) return '';
    return list
      .map((item, i) => {
        const scope = { ...data, [itemVar]: item, index: i };
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
  let out = processVFor(template, data);
  if (!opts.skipVModel && ctx) out = processVModel(out, data, ctx);
  out = processVBind(out, data);
  out = processClass(out, data);
  out = processStyle(out, data);
  out = processVShow(out, data);
  out = out.replace(/\{\{\s*(.+?)\s*\}\}/g, (_, expr) => {
    const v = evalExpr(expr, data);
    return v == null ? '' : escapeHtml(String(v));
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
    bindEvents(container, ctx);
  };
  update();
  effect(update);
  mountQueue.forEach((f) => f());
  return update;
}

const KEY_ALIAS = { enter: 'Enter', tab: 'Tab', esc: 'Escape', space: ' ' };
function bindEvents(container, ctx) {
  ['click', 'input', 'keydown', 'keyup', 'change', 'submit'].forEach((name) => {
    container.querySelectorAll('*').forEach((el) => {
      const attr = Array.from(el.attributes).find((a) => a.name.startsWith('@' + name) && (a.name === '@' + name || a.name.startsWith('@' + name + '.')));
      if (!attr) return;
      const handler = attr.value;
      const fn = ctx[handler];
      if (typeof fn !== 'function') return;
      const mod = attr.name.includes('.') ? attr.name.split('.')[1] : null;
      el.addEventListener(name, (e) => {
        if (mod && KEY_ALIAS[mod] !== undefined && e.key !== KEY_ALIAS[mod]) return;
        fn(e);
      });
    });
  });
}

// ============ createApp ============
function createApp(options) {
  const { template, setup, components = {} } = options;
  return {
    mount(selector) {
      const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!el) throw new Error('Mount target not found');
      const mountQueue = [];
      const api = { onMounted: createOnMounted(mountQueue) };
      const setupResult = typeof setup === 'function' ? setup(api) : {};
      const ctx = { ...setupResult };
      if (template) renderTemplate(template, ctx, el, mountQueue);
      return { el, ctx };
    },
    component(name, def) {
      components[name] = def;
      return this;
    },
  };
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createApp, ref, computed, reactive, effect, watch, watchEffect, toRefs, nextTick };
} else {
  window.Aura = {
    createApp,
    ref,
    computed,
    reactive,
    effect,
    watch,
    watchEffect,
    toRefs,
    nextTick,
  };
}
