/**
 * https://codepen.io/juliangarnier/pen/gmOwJX
 * custom by hexo-theme-yun @YunYouJun
 */
import { useEffect } from 'react'
// import anime from 'animejs'
import { siteConfig } from '@/lib/config'
import { loadExternalResource } from '@/lib/utils'

const getFireworksColorKey = colors =>
  Array.isArray(colors)
    ? colors.map(color => String(color)).join('|')
    : String(colors ?? '')

/**
 * 鼠标点击烟花特效
 * @returns
 */
const Fireworks = () => {
  const fireworksColor = siteConfig('FIREWORKS_COLOR')
  const fireworksColorKey = getFireworksColorKey(fireworksColor)

  useEffect(() => {
    let disposed = false
    const colors = siteConfig('FIREWORKS_COLOR')

    // 异步加载
    async function loadFireworks() {
      try {
        await loadExternalResource(
          'https://cdnjs.snrat.com/ajax/libs/animejs/3.2.1/anime.min.js',
          'js'
        )
        await loadExternalResource('/js/fireworks.js', 'js')
        if (!disposed && window.anime && window.createFireworks) {
          window.createFireworks({
            config: { colors },
            anime: window.anime
          })
        }
      } catch {
        // 特效加载失败不影响页面主体功能。
      }
    }

    loadFireworks()

    return () => {
      disposed = true
      // 在组件卸载时清理资源
      const fireworksElements = document.getElementsByClassName('fireworks')
      while (fireworksElements.length > 0) {
        fireworksElements[0].parentNode?.removeChild(fireworksElements[0])
      }
    }
  }, [fireworksColorKey])

  return <></>
}

export default Fireworks
