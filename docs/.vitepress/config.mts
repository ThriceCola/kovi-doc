import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Kovi 使用手册",
  description: "Kovi 使用手册",
  base: '/kovi-doc/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about' },
      {
			text: "GitHub",
			items: [
				{
					text: "Kovi",
					link: "https://github.com/Threkork/Kovi/",
				},
				{
					text: "Kovi-doc",
					link: "https://github.com/Threkork/kovi-doc/",
				},
			],
		},
    ],

    sidebar: [
      {
        text: '开始 Kovi 之旅',
        collapsed: false,
        items: [
          { text: '准备', link: '/start/start' },
          { text: '快速上手', link: '/start/fast' },
        ]
      },
      {
        text: '开发插件',
        collapsed: false,
        items: [
          { text: '基础', link: '/plugin/basics' },
          { text: '监听事件', link: '/plugin/onevent' },
          { text: '事件 Event', link: '/plugin/event' },
          { text: 'Message', link: '/plugin/message' },
          { text: 'RuntimeBot 与 Api', link: '/plugin/runtimebot' },
          { text: 'Api 列表', link: '/plugin/api' },
          { text: '生命周期', link: '/plugin/life' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Threkork/Kovi' }
    ],
    editLink: {
      pattern: 'https://github.com/Threkork/kovi-doc/blob/main/docs/:path',
      text: "在 GitHub 上帮助我们完善这个页面"
    },
    search: {
      provider: 'local'
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
  }
})
