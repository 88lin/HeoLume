const { loadExternalResource } = require('../utils')

/**
 * WOWjs动画，结合animate.css使用很方便
 * 是data-aos的平替 aos ≈ wowjs + animate
 */
export const loadWowJS = async () => {
  try {
    await Promise.all([
      loadExternalResource('/css/wow/animate.css', 'css'),
      loadExternalResource(
        'https://cdn.jsdmirror.com/npm/wowjs@1.1.3/dist/wow.min.js',
        'js'
      )
    ])

    // 配合animatecss 实现延时滚动动画，和AOS动画相似
    const WOW = window.WOW
    if (WOW) {
      new WOW().init()
    }
  } catch {
    // 动画是增强功能，CDN失败时不应阻断首页渲染或产生未处理的Promise异常。
  }
}
