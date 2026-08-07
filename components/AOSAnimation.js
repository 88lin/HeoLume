import { loadExternalResource } from '@/lib/utils'
import { useEffect } from 'react'

/**
 * 加载滚动动画
 * 改从外部CDN读取
 * https://michalsnik.github.io/aos/
 */
export default function AOSAnimation() {
  const initAOS = () => {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    Promise.all([
      loadExternalResource(
        'https://cdn.jsdmirror.com/npm/aos@2.3.4/dist/aos.min.js',
        'js'
      ),
      loadExternalResource(
        'https://cdn.jsdmirror.com/npm/aos@2.3.4/dist/aos.min.css',
        'css'
      )
    ])
      .then(() => {
        if (window.AOS) {
          window.AOS.init({
            debounceDelay: 100,
            throttleDelay: 120,
            once: true
          })
        }
      })
      .catch(() => {})
  }
  useEffect(() => {
    if (window.requestIdleCallback) {
      const id = window.requestIdleCallback(initAOS, { timeout: 3000 })
      return () => window.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(initAOS, 2000)
    return () => window.clearTimeout(id)
  }, [])

  return null
}
