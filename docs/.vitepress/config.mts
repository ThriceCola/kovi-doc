import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Kovi 文档",
  description: "Kovi 文档",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Github', link: 'https://github.com/Threkork/Kovi' }
    ],

    sidebar: [
      {
        text: '开始 Kovi 之旅',
        items: [
          { text: '快速上手', link: '/fast' },
        ]
      },
      {
        text: '开发插件',
        items: [
          { text: '基础', link: '/plugin/basics' },
          { text: '监听事件', link: '/plugin/event' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    editLink: {
      pattern: ''
    }
  }
})
