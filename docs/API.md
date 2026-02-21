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

## setup API 参数

`setup({ onMounted })` 接收：

| 参数 | 说明 |
|------|------|
| onMounted | (fn) => void，DOM 挂载后执行 |
