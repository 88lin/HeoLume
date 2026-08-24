/**
 * 昼夜切换动画
 * 功能开发者 [88lin](https://github.com/88lin)
 */
import { saveDarkModeToLocalStorage } from '@/themes/themeConfig'

const FADE_IN = 420
const ARC = 2000
const CROSS_DELAY = 300
const CROSSFADE = 1400
/** 日月互换的时长，以及互换的时机：
    卡在弧线正中间、两者都转到视口外的那一小段时间里换，
    这样看到的是「太阳落下去、月亮升起来」，而不是原地变形 */
const SWAP = 360
const SWAP_AT = ARC / 2 - SWAP / 2
/** 流星：只在入夜时划一道，正好填上日月都在视口外的那段空档 */
const METEOR = 950
const METEOR_AT = 1050
/** 新的日/月回到天顶后停留多久再揭开页面 */
const HOLD_OUT = 280
/** 开始淡出天空的时刻 */
const LEAVE_AT = ARC + HOLD_OUT
/** 天空淡出时长 */
const FADE_OUT = 780
/** 在天空底下切换主题的时刻，必须落在完全盖住页面的那段时间里 */
const SWITCH_AT = FADE_IN + 140
const CSS_VARS = {
  '--heo-dn-fade-in': FADE_IN,
  '--heo-dn-cross-delay': CROSS_DELAY,
  '--heo-dn-cross': CROSSFADE,
  '--heo-dn-arc': ARC,
  '--heo-dn-swap-delay': SWAP_AT,
  '--heo-dn-swap': SWAP,
  '--heo-dn-meteor-delay': METEOR_AT,
  '--heo-dn-meteor': METEOR,
  '--heo-dn-fade-out': FADE_OUT
}

const SKY_HTML = `
  <div class="heo-daynight__layer heo-daynight__layer--day"></div>
  <div class="heo-daynight__layer heo-daynight__layer--night">
    <span class="heo-daynight__stars heo-daynight__stars--far"></span>
    <span class="heo-daynight__stars heo-daynight__stars--mid"></span>
    <span class="heo-daynight__stars heo-daynight__stars--near"></span>
    <span class="heo-daynight__spark heo-daynight__spark--a"></span>
    <span class="heo-daynight__spark heo-daynight__spark--b"></span>
    <span class="heo-daynight__spark heo-daynight__spark--c"></span>
    <span class="heo-daynight__meteor"></span>
  </div>
  <div class="heo-daynight__orbit">
    <div class="heo-daynight__orb heo-daynight__orb--sun"></div>
    <div class="heo-daynight__orb heo-daynight__orb--moon"></div>
  </div>`

let active = null
function endActive() {
  if (!active) {
    return
  }
  active.timers.forEach(id => clearTimeout(id))
  active.sky.remove()
  active = null
}

function shouldSkipAnimation() {
  if (typeof document === 'undefined') {
    return true
  }
  return (
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
  )
}

/**
 * 播放昼夜切换动画，并在天空遮住页面时执行主题切换
 * @param {boolean} toDark 目标是否为深色模式（true 日落，false 日出）
 * @param {() => void} onSwitch 真正翻转主题的回调，由调用方提供
 */
export function playDayNightTransition({ toDark, onSwitch }) {
  if (shouldSkipAnimation()) {
    onSwitch?.()
    return
  }
  if (active) {
    if (!active.switched) {
      return
    }
    endActive()
  }

  const sky = document.createElement('div')
  sky.className = `heo-daynight heo-daynight--${toDark ? 'to-dark' : 'to-light'}`
  sky.setAttribute('aria-hidden', 'true')
  Object.entries(CSS_VARS).forEach(([name, value]) => {
    sky.style.setProperty(name, `${value}ms`)
  })
  sky.innerHTML = SKY_HTML
  document.body.appendChild(sky)

  const timers = []
  const current = { sky, timers, switched: false }
  active = current

  // 插入后先让浏览器完成一次布局，否则 opacity 从 0 到 1 不会产生过渡
  requestAnimationFrame(() => {
    sky.classList.add('is-visible')
    // 天空盖上来的同时开始昼夜渐变与日月交替
    requestAnimationFrame(() => sky.classList.add('is-shifting'))
  })

  timers.push(
    setTimeout(() => {
      current.switched = true
      onSwitch?.()
    }, SWITCH_AT)
  )

  timers.push(
    setTimeout(() => {
      sky.classList.remove('is-visible')
      sky.classList.add('is-leaving')
    }, LEAVE_AT)
  )

  timers.push(
    setTimeout(() => {
      if (active === current) {
        endActive()
      }
    }, LEAVE_AT + FADE_OUT)
  )
}

/**
 * 带日出/日落动画的深色模式切换。
 * 主题里所有切换入口都走这里，保证动画和落地状态一致。
 * @param {boolean} isDarkMode 当前是否深色模式
 * @param {(next: boolean) => void} updateDarkMode useGlobal 提供的状态更新函数
 */
export function toggleDarkModeWithTransition({ isDarkMode, updateDarkMode }) {
  const newStatus = !isDarkMode
  playDayNightTransition({
    toDark: newStatus,
    onSwitch: () => {
      saveDarkModeToLocalStorage(newStatus)
      updateDarkMode(newStatus)
      const htmlElement = document.getElementsByTagName('html')[0]
      htmlElement.classList?.remove(newStatus ? 'light' : 'dark')
      htmlElement.classList?.add(newStatus ? 'dark' : 'light')
    }
  })
}
