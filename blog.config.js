const BLOG = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://app.notion.com/api/v3', // API默认请求地址,可以配置成自己的地址例如：https://[xxxxx].notion.site/api/v3
  // Important page_id！！！Duplicate Template from  https://tanghh.notion.site/02ab3b8678004aa69e9e415905ef32a5
  NOTION_PAGE_ID:
    process.env.NOTION_PAGE_ID ||
    '02ab3b8678004aa69e9e415905ef32a5',
  THEME: process.env.NEXT_PUBLIC_THEME || 'heo',
  LANG: process.env.NEXT_PUBLIC_LANG || 'zh-CN', // e.g 'zh-CN','en-US'  see /lib/lang.js for more.
  SINCE: process.env.NEXT_PUBLIC_SINCE || 2021, // e.g if leave this empty, current year will be used.

  PSEUDO_STATIC: process.env.NEXT_PUBLIC_PSEUDO_STATIC || false, // 伪静态路径，开启后所有文章URL都以 .html 结尾。
  NEXT_REVALIDATE_SECOND: process.env.NEXT_PUBLIC_REVALIDATE_SECOND || 2592000, // 更新缓存间隔 单位(秒)
  REVALIDATION_TOKEN: process.env.REVALIDATION_TOKEN || '', // On-Demand Revalidation Token，设置后可通过 POST /api/revalidate 立即刷新页面缓存（解决 Notion 内容更新延迟问题）
  APPEARANCE: process.env.NEXT_PUBLIC_APPEARANCE || 'light', // ['light', 'dark', 'auto'], // light 日间模式 ， dark夜间模式， auto根据时间和主题自动夜间模式
  APPEARANCE_DARK_TIME: process.env.NEXT_PUBLIC_APPEARANCE_DARK_TIME || [23, 8], // 夜间模式起至时间，false时关闭根据时间自动切换夜间模式

  AUTHOR: process.env.NEXT_PUBLIC_AUTHOR || '茉灵智库', // 您的昵称
  BIO: process.env.NEXT_PUBLIC_BIO || '分享技术与生活的无限可能✨', // 作者简介
  LINK: process.env.NEXT_PUBLIC_LINK || 'https://blog.88lin.eu.org', // 网站地址
  SEO_BRAND: process.env.NEXT_PUBLIC_SEO_BRAND || '茉灵智库', // SEO标题后缀的短品牌名（与Notion TITLE解耦，避免标题过长）
  KEYWORDS: process.env.NEXT_PUBLIC_KEYWORD || '技术教程, 软件资源, 实用工具, 考研资料, 论文下载, 面试题库, 经验分享', // 网站关键词 英文逗号隔开
  BLOG_FAVICON: process.env.NEXT_PUBLIC_FAVICON || '/favicon.svg', // blog favicon 配置, 默认使用 /public/favicon.ico
  PWA_ENABLE: process.env.NEXT_PUBLIC_PWA_ENABLE || true, // 是否启用 PWA 安装入口；也可在 Notion_Config 中配置 PWA_ENABLE=true
  PWA_NAME: process.env.NEXT_PUBLIC_PWA_NAME || '茉灵智库', // PWA 安装名称
  PWA_SHORT_NAME: process.env.NEXT_PUBLIC_PWA_SHORT_NAME || '茉灵智库', // PWA 短名称
  PWA_DESCRIPTION: process.env.NEXT_PUBLIC_PWA_DESCRIPTION || '分享技术与生活的无限可能✨', // PWA 安装描述
  PWA_ICON: process.env.NEXT_PUBLIC_PWA_ICON || '/icon-512.png', // PWA 页面图标（apple-touch-icon / favicon 回退）；不控制 manifest 安装图标，manifest 使用内置尺寸合规的 PNG
  PWA_ICON_192: process.env.NEXT_PUBLIC_PWA_ICON_192 || '', // 可选：覆盖 manifest 192x192 普通图标；须提供真实 192×192 尺寸的资源路径
  PWA_ICON_512: process.env.NEXT_PUBLIC_PWA_ICON_512 || '', // 可选：覆盖 manifest 512x512 普通图标；须提供真实 512×512 尺寸的资源路径
  PWA_ICON_192_MASKABLE: process.env.NEXT_PUBLIC_PWA_ICON_192_MASKABLE || '', // 可选：覆盖 manifest 192x192 maskable 图标；资源应留有足够安全边距
  PWA_ICON_512_MASKABLE: process.env.NEXT_PUBLIC_PWA_ICON_512_MASKABLE || '', // 可选：覆盖 manifest 512x512 maskable 图标；资源应留有足够安全边距
  PWA_THEME_COLOR: process.env.NEXT_PUBLIC_PWA_THEME_COLOR || '#f7f9fe', // PWA 主题色
  PWA_BACKGROUND_COLOR: process.env.NEXT_PUBLIC_PWA_BACKGROUND_COLOR || '#fefcf6', // PWA 启动画面背景色
  BEI_AN: process.env.NEXT_PUBLIC_BEI_AN || '萌ICP备20249980号', // 备案号 闽ICP备XXXXXX
  BEI_AN_LINK: process.env.NEXT_PUBLIC_BEI_AN_LINK || 'https://icp.gov.moe/?keyword=20249980', // 备案查询链接，如果用了萌备等备案请在这里填写
  BEI_AN_GONGAN: process.env.NEXT_PUBLIC_BEI_AN_GONGAN || '', // 公安备案号，例如 '浙公网安备3xxxxxxxx8号'

  // RSS订阅
  ENABLE_RSS: process.env.NEXT_PUBLIC_ENABLE_RSS || true, // 是否开启RSS订阅功能
  RSS_FULL_CONTENT: process.env.RSS_FULL_CONTENT || true, // RSS是否返回文章全文；false时仅返回摘要

  // 其它复杂配置
  ...require('./conf/comment.config'), // 评论插件
  ...require('./conf/contact.config'), // 作者联系方式配置
  ...require('./conf/post.config'), // 文章与列表配置
  ...require('./conf/analytics.config'), // 站点访问统计
  ...require('./conf/image.config'), // 网站图片相关配置
  ...require('./conf/font.config'), // 网站字体
  ...require('./conf/right-click-menu'), // 自定义右键菜单相关配置
  ...require('./conf/code.config'), // 网站代码块样式
  ...require('./conf/animation.config'), // 动效美化效果
  ...require('./conf/widget.config'), // 悬浮在网页上的挂件，聊天客服、宠物挂件、音乐播放器等
  ...require('./conf/ad.config'), // 广告营收插件
  ...require('./conf/plugin.config'), // 其他第三方插件 algolia全文索引
  ...require('./conf/ai.config'), // AI 相关配置（AI摘要、AI聊天机器人等）
  ...require('./conf/performance.config'), // 性能优化配置
  ...require('./conf/top-tag.config'), // 置顶文章全局配置
  ...require('./conf/techgrow.config'), // 公众号导流插件（TechGrow）

  // 高级用法
  ...require('./conf/layout-map.config'), // 路由与布局映射自定义，例如自定义特定路由的页面布局
  ...require('./conf/notion.config'), // 读取notion数据库相关的扩展配置，例如自定义表头
  ...require('./conf/dev.config'), // 开发、调试时需要关注的配置

  // 自定义外部脚本，外部样式
  CUSTOM_EXTERNAL_JS: ['https://cdn.jsdmirror.com/npm/pace-js@1.2.4/pace.min.js','https://019d13d4-e720-7b82-b896-ed149dfd85cb.spst2.com/ustat.js'], 
  CUSTOM_EXTERNAL_CSS: [],

  // 自定义菜单
  CUSTOM_MENU: process.env.NEXT_PUBLIC_CUSTOM_MENU || true, // 支持Menu类型的菜单，替代了3.12版本前的Page类型

  // 文章列表相关设置
  CAN_COPY: process.env.NEXT_PUBLIC_CAN_COPY || true, // 是否允许复制页面内容，默认允许；可被文章属性 CAN_COPY / ext.CAN_COPY 覆盖。

  // 侧栏布局 是否反转(左变右,右变左) 已支持主题: hexo next medium fukasawa example
  LAYOUT_SIDEBAR_REVERSE:
    process.env.NEXT_PUBLIC_LAYOUT_SIDEBAR_REVERSE || false,

  // 欢迎语打字效果,Hexo,Matery主题支持, 英文逗号隔开多个欢迎语。
  GREETING_WORDS:
    process.env.NEXT_PUBLIC_GREETING_WORDS ||
    '👋Hi，欢迎来到我的博客✨',

  // 欢迎语打字效果类型速度
  GREETING_WORDS_TYPE_SPEED:
    process.env.NEXT_PUBLIC_GREETING_WORDS_TYPE_SPEED || 200,

  // 欢迎语打字效果回退速度
  GREETING_WORDS_BACK_SPEED:
    process.env.NEXT_PUBLIC_GREETING_WORDS_BACK_SPEED || 100,

  // uuid重定向至 slug
  UUID_REDIRECT: process.env.UUID_REDIRECT || false,

  // 内嵌 Notion 子页面 URL 跟随父级文章路径，例如 /article/post/{pageId}
  INNER_PAGE_URL_PARENT_PATH:
    process.env.NEXT_PUBLIC_INNER_PAGE_URL_PARENT_PATH || false
}

module.exports = BLOG
