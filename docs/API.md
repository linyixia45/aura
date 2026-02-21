# Aura API 参考

## 响应式 API

### ref(initial)

创建响应式引用。

```js
const count = ref(0);
count.value++;  // 更新会触发依赖
```

### computed(getter)

创建计算属性。

```js
const doubled = computed(() => count.value * 2);
```

### reactive(obj)

创建响应式对象（Proxy）。

```js
const state = reactive({ a: 1, b: 2 });
state.a = 3;  // 触发依赖
```

### effect(fn)

运行副作用函数，并在依赖变化时重新执行。

```js
effect(() => console.log(count.value));
```

### watch(getter, cb, opts?)

监听响应式数据变化。

```js
watch(
  () => count.value,
  (newVal, oldVal) => console.log(newVal, oldVal),
  { immediate: true }
);
```

### watchEffect(fn)

立即执行并追踪依赖，依赖变化时重新执行。

```js
watchEffect(() => console.log(count.value));
```

### toRefs(obj)

将对象属性转为 ref 风格引用（便于解构）。

```js
const { count, name } = toRefs(state);
```

### unref(v)

若 v 为 ref 则返回 v.value，否则返回 v 自身。用于兼容 ref 与普通值。

```js
const n = unref(maybeRef);
```

### nextTick(fn?)

在 DOM 更新后执行回调。

```js
count.value++;
nextTick(() => console.log(dom.textContent));
```

---

## 应用 API

### createApp(options)

创建应用实例。

| 选项 | 类型 | 说明 |
|------|------|------|
| template | string | 模板字符串 |
| setup | (api) => object | 初始化函数，返回暴露给模板的对象 |
| components | object | 组件注册（预留） |

### mount(selector)

挂载到 DOM 元素。

---

## 模板指令补充

- **v-for** 支持 `(item, index) in list` 语法
- **v-html** 渲染原始 HTML（慎用，需防 XSS）

---

## 模板事件修饰符

**键盘**：`@keydown.enter`、`@keydown.esc`、`@keydown.tab`、`@keydown.space`  
**通用**：`@click.prevent`（阻止默认）、`@click.stop`（阻止冒泡）、`@click.self`（仅自身触发）

```html
<form @submit.prevent="onSubmit">
  <input @keydown.enter="submit" />
</form>
```

---

## defineComponent(options)

封装组件选项，便于复用与类型推导（可选）：

```js
const MyCounter = defineComponent({
  template: `...`,
  setup() { return {}; },
});
createApp(MyCounter).mount('#app');
```

---

## 生命周期

`setup({ onMounted, onUnmounted })`：

```js
setup({ onMounted, onUnmounted }) {
  const tid = setInterval(() => {}, 1000);
  onUnmounted(() => clearInterval(tid));
  return {};
}
```

`app.unmount()` 会触发所有 `onUnmounted` 回调。

---

## setup API 参数

`setup({ onMounted })` 接收：

| 参数 | 说明 |
|------|------|
| onMounted | (fn) => void，DOM 挂载后执行 |
