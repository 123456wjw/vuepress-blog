<!--
 * @Author: wjw
 * @Date: 2021-01-21 10:24:51
 * @LastEditTime: 2021-01-21 17:21:53
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\vuepress-blog\docs\pages\frontend\vuepress\vuepress.md
-->

# vuepress博客搭建

## 1.环境搭建

::: warning 注意

 查看node的版本号，确保node版本 >= 8.6

:::

```shell
# 全局安装vuepress
npm install -g vuepress
```

## 2.项目搭建

### 创建项目根目录并初始化

``` shell
# 创建项目根目录并进入该目录
mkdir vuepress-blog && cd vuepress-blog
# 初始化项目
npm init -y
```

### 配置package.json文件

```json
// package.json
{
  "name": "vuepress-blog",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "vuepress dev docs",
    "build": "vuepress build docs"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": ""
}
```

### 新建docs目录

docs文件夹是项目文档的根目录，用来存放项目.vuepress文件夹，Markdown文件。

```shell
mkdir docs && cd docs
```

### 创建.vuepress目录

.vuepress目录主要用于存放在md文件中要使用的vue组件，项目的静态资源，项目主题以及项目的配置。

```shell
mkdir .vuepress && cd .vuepress
# 创建.vuepress下的各个目录
mkdir components # components目录下的vue组件会自动被注册为全局组件
mkdir public # public目录存放项目的静态资源
mkdir styles && cd styles # 用于存放样式文件
    touch palette.styl # 用于重写默认颜色常量，或者设置新的 stylus 颜色常量
    touch index.styl # 将会被自动应用的全局样式文件，会生成在最终的 CSS 文件结尾，具有比默认样式更高的优先级
cd .. && touch config.js # config.js是项目的配置入口文件
```

### 创建pages目录

pages目录用来存放自己的Markdown文件，自己的文章都放在这个文件夹中。

退回docs目录

```shell
mkdir pages && cd pages
mkdir frontend backend # 创建两个文件夹存放不同分类的md文件
cd frontend && touch testFront.md test1.md test2.md # 创建一些md文件
cd .. && cd backend && touch testBack.md test3.md test4.md # 创建一些md文件
```

### 创建README.md

README.md是项目启动后的首页。

退回docs目录

```shell
touch README.md
```

## 3.项目配置

### README.md首页配置

```js
// README.md
---
home: true
heroImage: /egg.png 
heroText: 首页描述 
tagline: 每天进步一点点
actionText: 马上进入 →
actionLink: /pages/frontend/testFront.md 
features:
  - title: 简洁至上
    details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
  - title: Vue 驱动
    details: 享受 Vue + webpack 的开发体验，在 Markdown 中使用 Vue 组件，同时可以使用 Vue 来开发自定义主题。
  - title: 高性能
    details: VuePress 为每个页面预渲染生成静态的 HTML，同时在页面被加载的时候，将作为 SPA 运行。
---
```

::: tip 注意

 heroImage配置项里的 / 代表 /docs/.vuepress/public/ 这个目录
 actionLink配置项里的 / 代表 /docs/ 目录

:::

### config.js配置

```js
module.exports = {
  title: "没想好", // 网页标题
  discription: "没想好的描述", // 用于seo
  head: [["link", { rel: "icon", href: "/egg.png" }]], // 网页icon
  markdown: {
    lineNumbers: true, // 代码块是否显示行号
  },
  themeConfig: {
    logo: "/egg.png", // 网页顶部导航左上角的图标
    // 顶部导航栏配置
    nav: [
      //格式一：直接跳转，'/'为不添加路由，跳转至首页
      { text: "首页", link: "/" },
      //格式二：添加下拉菜单，link指向的文件路径
      {
        text: "前端", //默认显示
        ariaLabel: "前端", //用于识别的label
        items: [{ text: "testFront", link: "/pages/frontend/testFront.md" }],
      },
      {
        text: "后端",
        ariaLabel: "后端",
        items: [{ text: "testBack", link: "/pages/backend/testBack.md" }],
      },
      //格式三：跳转至外部网页，需http/https前缀
      { text: "Github", link: "https://github.com/123456wjw" },
    ],
    //侧边导航栏：会根据当前的文件路径是否匹配侧边栏数据，自动显示/隐藏
    sidebar: {
      "/pages/frontend/": [
        ["/pages/frontend/testFront.md", "testFront"],
        ["/pages/frontend/test1.md", "test1"],
        ["/pages/frontend/test2.md", "test2"],

      ],
      "/pages/backend/": [
        ["/pages/backend/testBack.md", "testBack"],
        ["/pages/backend/test3.md", "test3"],
        ["/pages/backend/test4.md", "test4"],
      ],
    },
  },
};
```

## 4.启动访问

```shell
npm run dev即可启动项目
```

## 5.项目部署

::: tip 注意

 没有git环境的需要先安装git环境，否则无法进行部署。

:::

### 创建deploy.sh自动部署文件

进到vuepress-blog根目录，创建deploy.sh文件

```shell
#!/usr/bin/env sh
# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'
git remote add origin 自己的远程仓库地址

# 如果你想要部署到 https://USERNAME.github.io
git push -f origin master

cd -
```

::: tip 注意

 这里的远程仓库地址创建时，仓库名必须是 自己的github用户名.github.io，否则无法通过 自己的github用户名.github.io 访问项目

:::

### 修改package.json文件

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "vuepress dev docs",
    "build": "vuepress build docs",
    "deploy": "bash deploy.sh"
  },
```

### 执行脚本

::: tip 注意

 不能在windows的CMD中跑脚本

:::

```shell
npm run deploy
```

部署成功后可通过 自己的github用户名.github.io 查看到部署的项目。
