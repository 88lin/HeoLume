import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import { useEffect, useRef, useState } from 'react'
import CONFIG from '../config'

/**
 * 投喂作者
 * 功能开发者 [88lin](https://github.com/88lin)
 * @returns
 */
export default function PostReward() {
  const [pinned, setPinned] = useState(false)
  // 键盘 Tab 过来时 CSS 也会展开，aria-expanded 得跟着一起报
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  // 第一次交互后才挂载二维码，免得每篇文章都白拉两张图
  const [everShown, setEverShown] = useState(false)
  // 按钮离视口顶部太近就翻到下面展开，不然弹层会被吸顶导航压住
  const [below, setBelow] = useState(false)
  const anchorRef = useRef(null)

  const reveal = () => {
    setEverShown(true)
    const top = anchorRef.current?.getBoundingClientRect().top ?? 999
    setBelow(top < 340)
  }

  useEffect(() => {
    if (!pinned) {
      return
    }
    const onPointerDown = e => {
      if (!anchorRef.current?.contains(e.target)) {
        setPinned(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [pinned])

  useEffect(() => {
    if (!pinned) {
      return
    }
    const btn = anchorRef.current?.querySelector('button')
    const pop = anchorRef.current?.querySelector('.heo-reward__pop')
    if (!btn || !pop || typeof IntersectionObserver === 'undefined') {
      return
    }
    const offScreen = el => {
      const rect = el.getBoundingClientRect()
      return rect.bottom <= 0 || rect.top >= window.innerHeight
    }
    const observer = new IntersectionObserver(
      () => {
        if (offScreen(btn) && offScreen(pop)) {
          setPinned(false)
        }
      },
      { threshold: 0 }
    )
    observer.observe(btn)
    observer.observe(pop)
    return () => observer.disconnect()
  }, [pinned])

  const onPointerLeave = e => {
    if (e.pointerType === 'mouse') {
      setPinned(false)
    }
  }

  const onKeyDown = e => {
    if (e.key === 'Escape') {
      setPinned(false)
      setKeyboardOpen(false)
      anchorRef.current?.querySelector('button')?.blur()
    }
  }

  const enable = siteConfig('HEO_ARTICLE_REWARD', true, CONFIG)
  const buttonText = siteConfig('HEO_ARTICLE_REWARD_TITLE', '投喂作者', CONFIG)
  const title = siteConfig('HEO_ARTICLE_REWARD_HEADING', '谢谢你的投喂', CONFIG)

  const channels = [
    {
      key: 'wechat',
      name: '微信支付',
      icon: 'fab fa-weixin',
      brand: '#07c160',
      qrcode: siteConfig('HEO_ARTICLE_REWARD_WECHAT', '', CONFIG)
    },
    {
      key: 'alipay',
      name: '支付宝',
      icon: 'fab fa-alipay',
      brand: '#1677ff',
      qrcode: siteConfig('HEO_ARTICLE_REWARD_ALIPAY', '', CONFIG)
    }
  ].filter(channel => channel.qrcode)

  if (!enable || channels.length === 0) {
    return null
  }

  return (
    <div className='heo-reward'>
      <div
        className='heo-reward__anchor'
        ref={anchorRef}
        onKeyDown={onKeyDown}
        onPointerLeave={onPointerLeave}>
        <button
          type='button'
          className='heo-reward__btn'
          onPointerEnter={reveal}
          onFocus={e => {
            reveal()
            setKeyboardOpen(e.target.matches(':focus-visible'))
          }}
          onBlur={() => setKeyboardOpen(false)}
          onClick={() => {
            reveal()
            setPinned(prev => !prev)
          }}
          aria-expanded={pinned || keyboardOpen}
          aria-controls='heo-reward-panel'>
          <i className='fas fa-hand-holding-heart' aria-hidden='true' />
          <span>{buttonText}</span>
        </button>
        <div
          id='heo-reward-panel'
          className={`heo-reward__pop${pinned ? ' is-open' : ''}${
            below ? ' is-below' : ''
          }`}>
          <div className='heo-reward__panel'>
            <div className='heo-reward__label'>Support</div>
            <div className='heo-reward__heading'>{title}</div>
            <div className='heo-reward__rule' />
            <div className='heo-reward__grid'>
              {channels.map(channel => (
                <div
                  key={channel.key}
                  className='heo-reward__item'
                  style={{ '--heo-brand': channel.brand }}>
                  <div className='heo-reward__code'>
                    {everShown && (
                      <LazyImage
                        src={channel.qrcode}
                        alt={`${channel.name}收款码`}
                        priority
                      />
                    )}
                  </div>
                  <div className='heo-reward__name'>
                    <i className={channel.icon} />
                    <span>{channel.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
