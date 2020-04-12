---
sidebar: auto
---

# VuePress 1.x 的设计理念

VuePress 1.x 的设计理念主要体现在以下几个方面：

1. 插件化
2. 约定大于配置
3. 合理的优先级管理

## 插件化

VuePress 1.0 进行了大范围的重写，其中最重要的就是引入
[Plugin API](../plugin/README.md)，那么插件带来的好处究竟是什么呢？

### 解耦

有了插件，我们可以将很多核心功能用插件来实现，你可以
在[这里](https://github.com/vuejs/vuepress/tree/master/packages/%40vuepress/core/lib/node/internal-plugins)看
到很多内置的插件，这些插件涵盖了很多 VuePress 的核心功能，在以前，它们糅合在代码
库的各个地方，但现在，它们一目了然。

### 配置的管理

在过去，当我们遇到一些不太常见的需求时，我们会有一些疑虑：如果我们打算不支持
，VuePress 的使用场景也就受到了限制；但如果想要支持它，我们就必须将其写到核心代
码库中，并为其单独开设配置的 API。对于维护者来说，除了不利于长久的维护，这有时也
会让我们心力交瘁。我们必须想到一些更好的解决办法，没错，这个办法就是插件。

### `.vuepress/config.js` 也是插件

没错，你的配置文件也是一个插件，因此，你可以直接使用插件 API，而不必为此新建一个
插件，然后在配置中导入它。

::: tip `.vuepress/config.js` 所支持的 API，实际上是在插件选项的基础上又新增了一
些特定的选项。 :::

### `theme/index.js` 也是插件

主题的根配置文件也是插件。

::: tip 和 `.vuepress/config.js` 一样，`theme/index.js` 所支持的选项，也是在插件
选项的基础上，又新增了一些特定的选项。用一张图来表达它们的关系就是：

<svg viewBox="0 0 2806 912" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 51 (57462) - http://www.bohemiancoding.com/sketch -->
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <rect id="Rectangle-3" fill-opacity="0" fill="#FFFFFF" x="0" y="0" width="2806" height="912"></rect>
        <circle id="Oval" stroke="#979797" fill="#EC5975" cx="1212.5" cy="455.5" r="355.5"></circle>
        <circle id="Oval" stroke="#979797" fill="#937AC4" cx="1592.5" cy="455.5" r="355.5"></circle>
        <path d="M1402.5,155.000018 C1501.96722,218.018606 1568,329.058303 1568,455.520781 C1568,581.983259 1501.96722,693.022956 1402.5,756.041544 C1303.03279,693.022977 1237,581.983271 1237,455.520781 C1237,329.058291 1303.03279,218.018585 1402.50003,155 Z" id="Combined-Shape" stroke="#FFFFFF" stroke-width="10" fill="#00BD8C"></path>
        <text id=".vuepress/-config.js" font-family="ArialMT, Arial" font-size="60" font-weight="normal" fill="#FFFFFF">
            <tspan x="901.101562" y="436">.vuepress/</tspan>
            <tspan x="929.446289" y="503">config.js</tspan>
        </text>
        <text id="Plugin-API" font-family="ArialMT, Arial" font-size="72" font-weight="normal" fill="#FFFFFF">
            <tspan x="1302.42773" y="436">Plugin</tspan>
            <tspan x="1344.47461" y="516">API</tspan>
        </text>
        <text id="theme/-index.js" font-family="ArialMT, Arial" font-size="60" font-weight="normal" fill="#FFFFFF">
            <tspan x="1662.78613" y="436">theme/</tspan>
            <tspan x="1652.78125" y="503">index.js</tspan>
        </text>
    </g>
</svg>
:::

### 在插件中使用插件

在 VuePress 中，你拥有在插件中使用插件的能力：

```js
// vuepress-plugin-xxx
module.exports = {
  plugins: ["a", "b", "c"]
};
```

## 约定大于配置

VuePress 1.0 开始引入一些约定，以减少用户过多的配置压力。对于这一点，最直观的体
现是
对[文档目录结构](../guide/directory-structure.md)和[主题目录结构](../theme/writing-a-theme.md#目录结构)的
约定。

未来我们可能还会结合社区的反馈来引入更多的约定，让我们拭目以待。

## 合理的优先级管理

资深的 VuePress 用户可能已经发现，主题开发者和普通的文档用户都具有定义全局的
`palette`、`style`、`templates` 和 `plugins` 的能力，那么他们是如何协同工作的呢
？

### 加载优先级

`templates/*` 遵循一定的加载优先级，以 `templates/ssr.html` 为例：

@flowstart cond1=>condition: 用户的 ssr.html 是否存在? cond2=>condition: 主题的
ssr.html 是否存在? stage1=>operation: 使用用户的 ssr.html stage2=>operation: 使
用主题的 ssr.html stage3=>operation: 使用默认的 ssr.html

cond1(no, right)->cond2(no)->stage3 cond1(yes, bottom)->stage1 cond2(yes,
bottom)->stage2 @flowend

::: warning 注意当你想要去自定义 `templates/ssr.html` 或 `templates/dev.html` 时
，最好基于
[默认的模板文件](https://github.com/vuejs/vuepress/blob/master/packages/%40vuepress/core/lib/app/index.dev.html)
来修改，否则可能会导致构建出错。 :::

### Overriding

对于 `palette.styl`、`index.styl` 和 `plugins`, 遵循 `overriding` 的原则：

#### `palette.styl`

用户的 `styles/palette.styl` 具有比主题的 `styles/palette.styl` 更高的优先级，�
此主题可以先预定义一套调色板，而用户又可以根据自身需要修改它。例如：

```stylus
// theme/styles/palette.styl
$accentColor = #0f0
```

```stylus
// .vuepress/styles/palette.styl
$accentColor = #f00
```

`$accentColor` 最终的值是 `#f00`。

#### `index.styl`

用户和主题的 `styles/index.styl` 都会被生成到最终的 CSS 文件中，但是默认情况下，
用户的样式会生成在主题的样式后面，因此对于同样的选择器，用户的样式将具有更高的优
先级，如：

```stylus
// theme/styles/index.styl
.content
  font-size 14px
```

```stylus
// .vuepress/styles/index.styl
.content
  font-size 15px
```

最终生成的 CSS 文件如下：

```css
/* theme/styles/index.styl */
.content {
  font-size: 14px;
}

/* theme/styles/index.styl */
.content {
  font-size: 15px;
}
```

#### `plugins`

由于同名插件默认情况下只能应用一次，因此用户可以修改主题中预置的插件选项的默认值
，如：

```js
// theme/index.js
module.exports = {
  plugins: ["vuepress-plugin-xxx", { name: "foo" }]
};
```

```js
// .vuepress/config.js
module.exports = {
  plugins: ["vuepress-plugin-xxx", { name: "bar" }]
};
```

name 的最终值将是 `bar`.

## 其他

本着解耦的目标，引入 monorepo 后，我们也得以将 VuePress 分离成以下两个库：

- [@vuepress/core](https://github.com/vuejs/vuepress/tree/master/packages/@vuepress/core)：
  包含 dev、build 的核心实现和 Plugin API；
- [@vuepress/theme-default](https://github.com/vuejs/vuepress/tree/master/packages/@vuepress/theme-default)：
  你现在所看到的默认主题。

当然，对于大多数用户来说，你并不需要关心上述三个库
，[vuepress](https://www.npmjs.com/search?q=vuepress) 这个包已经将上述三个包组装
在一起，因此你完全可以像 `0.x` 那样使用 VuePress。
