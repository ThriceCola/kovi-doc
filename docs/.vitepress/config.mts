import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Kovi",
  description:
    "Kovi 是一个 Rust 的 OneBot 插件框架。拥有简单明了的文档、便捷的 CLI 工具和易用的插件商店，让开发 Bot 更加高效便捷。轻松开启你的 Rust OneBot 开发之旅！",
  base: "/",
  sitemap: {
    hostname: "https://kovi.thricecola.com",
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "关于", link: "/about" },
      {
        text: "GitHub",
        items: [
          {
            text: "Kovi",
            link: "https://github.com/ThriceCola/Kovi/",
          },
          {
            text: "Kovi-cli",
            link: "https://github.com/ThriceCola/kovi-cli/",
          },
          {
            text: "Kovi-plugin",
            link: "https://github.com/ThriceCola/kovi-plugin/",
          },
          {
            text: "Kovi-doc",
            link: "https://github.com/ThriceCola/kovi-doc/",
          },
        ],
      },
      {
        text: "Rust",
        items: [
          {
            text: "crates.io",
            link: "https://crates.io/crates/kovi",
          },
          {
            text: "rustdoc",
            link: "https://docs.rs/kovi/latest/kovi/",
          },
        ],
      },
    ],

    sidebar: [
      {
        text: "开始 Kovi 之旅",
        collapsed: false,
        items: [
          { text: "准备", link: "/start/start" },
          { text: "快速上手", link: "/start/fast" },
          { text: "kovi-cli", link: "/start/cli" },
          { text: "插件市场", link: "/start/plugins" },
        ],
      },
      {
        text: "开发插件",
        collapsed: false,

        items: [
          { text: "基础", link: "/plugin/basics" },
          { text: "注意事项", link: "/plugin/take_care" },
          {
            text: "Event 事件", items: [
              { text: "监听 Event", link: "/plugin/on_event" },
              { text: "基础 Event", link: "/plugin/event_list" },
            ]
          },

          {
            text: "Message 消息", items: [{ text: "构建 Message", link: "/plugin/message" },
            { text: "Message 方法", link: "/plugin/message_impl" }]
          },
          { text: "RuntimeBot 与 Api", link: "/plugin/runtimebot" },

          {
            text: "数据存储",
            link: "/plugin/data",
          },
          {
            text: "更好的开发体验",
            link: "/plugin/better",
          },

          { text: "生命周期", link: "/plugin/life" },
        ],
      },
      {
        text: "进阶开发",
        collapsed: false,

        items: [
          { text: "运行时管理插件", link: "/plugin/plugin_control" },
          { text: "框架级访问控制(黑白名单)", link: "/plugin/access_control" },
          { text: "Bot 启动时插件控制", link: "/plugin/bot_startup" },
          { text: "自定义 Event 事件", link: "/plugin/diy_event" },
        ],
      },
      // {
      //     text: "学习与提升",
      //     collapsed: false,

      //     items: [
      //         { text: "无畏并发-闭包间共享状态", link: "/plugin/arc" },
      //         { text: "异步", link: "/plugin/async" },
      //     ],
      // },
      {
        text: "附录",
        collapsed: false,

        items: [
          { text: "OneBot Api", link: "/api/onebot_api" },
          { text: "Kovi Api", link: "/api/kovi_api" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/ThriceCola/Kovi" },
    ],
    editLink: {
      pattern: "https://github.com/ThriceCola/kovi-doc/blob/main/docs/:path",
      text: "在 GitHub 上帮助我们完善这个页面",
    },
    search: {
      provider: "local",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    lastUpdated: {
      text: "最后更新",
    },
    outlineTitle: "目录",
    sidebarMenuLabel: "菜单",
    returnToTopLabel: "返回顶部",
    externalLinkIcon: true,
    darkModeSwitchLabel: "外观",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
  },
});
