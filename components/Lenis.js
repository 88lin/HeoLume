import { useEffect, useRef } from 'react'
import Router from 'next/router'

/**
 * 滚动阻尼特效
 *
 * 使用 npm 包版 Lenis v1.3.x，保留原有桌面滚动体感。
 * macOS 原生滚动跑在合成器线程且自带系统级惯性，Lenis 的 rAF 滚动
 * 在页面较重时会因主线程丢帧而抖动，因此 Mac 直接使用原生滚动。
 */
const Lenis = () => {
  const lenisRef = useRef(null)

  useEffect(() => {
    // 仅桌面且未开启“减少动态效果”时启用，移动/触屏设备保留原生滚动。
    const isDesktopLike = window.matchMedia(
      '(min-width: 1024px) and (pointer: fine) and (hover: hover)'
    ).matches
    if (!isDesktopLike) return

    const allowMotion = window.matchMedia(
      '(prefers-reduced-motion: no-preference)'
    ).matches
    if (!allowMotion) return

    const platform = navigator.userAgentData?.platform || navigator.platform || ''

    // macOS（含桌面模式的 iPad + 触控板）：使用系统原生滚动，Lenis 免启。
    // 站内锚点原本由 Lenis anchors 平滑接管，这里用原生平滑滚动补齐，保持目录点击手感。
    if (/mac/i.test(platform)) {
      const smoothAnchor = e => {
        const anchor = e.target?.closest?.('a[href^="#"]')
        if (!anchor) return
        const hash = anchor.getAttribute('href')
        if (!hash || hash.length < 2) return
        const target = document.getElementById(hash.slice(1))
        if (!target) return
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth' })
        history.replaceState(null, '', hash)
      }
      document.addEventListener('click', smoothAnchor)
      return () => document.removeEventListener('click', smoothAnchor)
    }

    let isDisposed = false

    async function initLenis() {
      try {
        const { default: LenisLib } = await import('lenis')
        if (isDisposed) return

        const lenis = new LenisLib({
          duration: 1.1,
          easing: t => 1 - Math.pow(1 - t, 3),

          // v1 API 映射
          autoRaf: true,
          anchors: true,
          stopInertiaOnNavigate: true,
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          // 嵌套滚动容器通过 data-lenis-prevent 显式退出，避免每个滚轮事件遍历 DOM。
          allowNestedScroll: false,
          // 统一桌面端体感；旧版 Lenis 的 Mac 0.4 倍率会让触控板滚动明显变慢。
          wheelMultiplier: 0.86,
          syncTouch: false,
          touchMultiplier: 2
        })

        if (isDisposed) {
          lenis.destroy()
          return
        }

        lenisRef.current = lenis
      } catch (error) {
        console.error('Failed to initialize Lenis:', error)
      }
    }

    // Next.js 跨页导航前清掉上一页残留的滚动惯性。
    const stopInertia = () => {
      if (lenisRef.current) {
        lenisRef.current.stop()
        lenisRef.current.start()
      }
    }

    Router.events.on('routeChangeStart', stopInertia)
    initLenis()

    return () => {
      isDisposed = true
      Router.events.off('routeChangeStart', stopInertia)
      lenisRef.current?.destroy()
      lenisRef.current = null
    }
  }, [])

  return <></>
}

export default Lenis
