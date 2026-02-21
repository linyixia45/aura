# Aura 快速参考

## 模板

```html
{{ expr }}           <!-- 插值 -->
v-if="cond"          <!-- 条件渲染 -->
v-show="cond"        <!-- 切换显示 -->
v-for="x in list"    <!-- 列表 -->
v-for="(x, i) in list"
v-model="ref"        <!-- 双向绑定 -->
:attr="expr"         <!-- 属性绑定 -->
@event="handler"     <!-- 事件，handler 须为函数名 -->
@click.prevent       <!-- 修饰符 -->
@keydown.enter
```

## 响应式

```js
ref(0)               // { value: 0 }
computed(() => x)    // 计算
watch(getter, cb)    // 监听
nextTick(fn)         // DOM 后
```

## setup

```js
setup({ onMounted, onUnmounted }) {
  return { /* 暴露给模板 */ };
}
```

##  design 类

`aura-app` `aura-btn` `aura-btn-primary` `aura-card` `aura-input` `aura-title` `aura-title-lg`
