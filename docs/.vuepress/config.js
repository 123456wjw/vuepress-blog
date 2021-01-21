/*
 * @Author: wjw
 * @Date: 2021-01-19 09:58:19
 * @LastEditTime: 2021-01-21 16:13:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\testproject\docs\.vuepress\config.js
 */

module.exports = {
  title: "没想好", // 网页标题
  discription: "没想好的知识记录", // 用于seo
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
        items: [
          { text: "react", link: "/pages/frontend/react/classAndFunction" },
          { text: "vue", link: "/pages/frontend/vue/vue2" },
          //点击标签会跳转至link的markdown文件生成的页面
          { text: "js", link: "/pages/frontend/js/replace" },
          { text: "css", link: "/pages/frontend/css/white-spaceAndword-break" },
          { text: "vuepress", link: "/pages/frontend/vueperss/vuepress" },
        ],
      },
      {
        text: "后端",
        ariaLabel: "后端",
        items: [{ text: "nodejs", link: "/pages/backend/nodejs/test" }],
      },
      { text: "生活记录", link: "/pages/life/test.md" },

      //格式三：跳转至外部网页，需http/https前缀
      { text: "Github", link: "https://github.com/123456wjw" },
    ],
    //侧边导航栏：会根据当前的文件路径是否匹配侧边栏数据，自动显示/隐藏
    sidebar: {
      "/pages/frontend/": [
        {
          title: "react", // 一级菜单名称
          collapsable: true, // false为默认展开菜单, 默认值true是折叠,
          sidebarDepth: 2,
          children: [
            {
              title: "函数式组件与类组件",
              path: "/pages/frontend/react/classAndFunction",
            },
            {
              title: "函数式组件通信",
              path: "/pages/frontend/react/zujiantongxin",
            },
          ],
        },
        {
          title: "vue", // 一级菜单名称
          collapsable: true, // false为默认展开菜单, 默认值true是折叠,
          sidebarDepth: 2,
          children: [
            {
              title: "vue2",
              path: "/pages/frontend/vue/vue2",
            },
          ],
        },
        {
          title: "js", // 一级菜单名称
          collapsable: true, // false为默认展开菜单, 默认值true是折叠,
          sidebarDepth: 2,
          children: [
            {
              title: "replace方法",
              path: "/pages/frontend/js/replace",
            },
            {
              title: "js继承方法",
              path: "/pages/frontend/js/jicheng",
            },
          ],
        },
        {
          title: "css", // 一级菜单名称
          collapsable: true, // false为默认展开菜单, 默认值true是折叠,
          sidebarDepth: 2,
          children: [
            {
              title: "white-space与word-break",
              path: "/pages/frontend/css/white-spaceAndword-break",
            },
          ],
        },
        ["/pages/frontend/vuepress/vuepress", "vueperss博客搭建"],
      ],
      "/pages/backend/": [
        {
          title: "后端",
          collapsable: false,
          sidebarDepth: 2, //  设置侧边导航自动提取markdown文件标题的层级，默认1为h2层级
          children: [["/pages/backend/nodejs/test.md", "nodejs"]],
        },
      ],
    },
  },
};
