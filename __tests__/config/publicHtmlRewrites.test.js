/**
 * @jest-environment node
 */

// /public 根目录下的静态页面（如 coffee.html）不属于 Notion 路由，很容易在合并上游后
// 被“伪静态重写” /:path*.html -> /:path* 重新吞掉，在 Vercel 上表现为 404。
// 这里锁住重写规则，避免同一个问题再次回归。
const nextConfig = require('../../next.config')

const PSEUDO_STATIC_SOURCE = '/:path*.html'
const COFFEE_FILE = '/coffee.html'

describe('public 静态页面重写规则', () => {
  let beforeFiles
  let afterFiles

  beforeAll(async () => {
    const rewrites = await nextConfig.rewrites()
    beforeFiles = rewrites.beforeFiles
    afterFiles = rewrites.afterFiles
  })

  it('在文件系统检查之前把 /coffee.html 钉到真实文件上', () => {
    expect(beforeFiles).toEqual(
      expect.arrayContaining([
        { source: COFFEE_FILE, destination: COFFEE_FILE, locale: false }
      ])
    )
  })

  it('支持无扩展名访问 /coffee（sitemap 与 SmartLink 用的都是这个地址）', () => {
    expect(afterFiles).toEqual(
      expect.arrayContaining([
        { source: '/coffee', destination: COFFEE_FILE, locale: false }
      ])
    )
  })

  it('无扩展名规则排在伪静态重写之前，否则会被 /[prefix] 动态路由抢走', () => {
    const cleanUrlIndex = afterFiles.findIndex(
      rewrite => rewrite.destination === COFFEE_FILE
    )
    const pseudoStaticIndex = afterFiles.findIndex(
      rewrite => rewrite.source === PSEUDO_STATIC_SOURCE
    )

    expect(cleanUrlIndex).toBeGreaterThanOrEqual(0)
    expect(pseudoStaticIndex).toBeGreaterThanOrEqual(0)
    expect(cleanUrlIndex).toBeLessThan(pseudoStaticIndex)
  })

  it('destination 始终不带语言前缀，Vercel 文件系统才能命中真实文件', () => {
    const staticRewrites = [...beforeFiles, ...afterFiles].filter(
      rewrite => rewrite.destination === COFFEE_FILE
    )

    expect(staticRewrites.length).toBeGreaterThan(0)
    staticRewrites.forEach(rewrite => {
      // locale: false 才能阻止 Next 把 /:nextInternalLocale 拼进 destination
      expect(rewrite.locale).toBe(false)
    })
  })

  it('自行枚举带语言前缀的 source，覆盖 Next 补全后的内部路径', () => {
    const sources = beforeFiles.map(rewrite => rewrite.source)
    expect(sources).toContain('/zh-CN/coffee.html')
  })
})
