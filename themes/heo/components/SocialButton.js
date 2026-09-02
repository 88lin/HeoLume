import { siteConfig } from '@/lib/config'
import { useEffect, useRef, useState } from 'react'
import { handleEmailClick } from '@/lib/plugins/mailEncrypt'

/**
 * 社交联系方式按钮组
 * @returns {JSX.Element}
 * @constructor
 */
const SocialButton = () => {
  const CONTACT_GITHUB = siteConfig('CONTACT_GITHUB')
  const CONTACT_ORCID = siteConfig('CONTACT_ORCID')
  const CONTACT_TWITTER = siteConfig('CONTACT_TWITTER')
  const CONTACT_TELEGRAM = siteConfig('CONTACT_TELEGRAM')
  const CONTACT_LINKEDIN = siteConfig('CONTACT_LINKEDIN')
  const CONTACT_WEIBO = siteConfig('CONTACT_WEIBO')
  const CONTACT_INSTAGRAM = siteConfig('CONTACT_INSTAGRAM')
  const CONTACT_EMAIL = siteConfig('CONTACT_EMAIL')
  const ENABLE_RSS = siteConfig('ENABLE_RSS')
  const CONTACT_BILIBILI = siteConfig('CONTACT_BILIBILI')
  const CONTACT_YOUTUBE = siteConfig('CONTACT_YOUTUBE')
  const CONTACT_DOUYIN =
    process.env.NEXT_PUBLIC_CONTACT_DOUYIN || 'https://v.douyin.com/nDD4_ACPRiY'
  const CONTACT_XIAOHONGSHU =
    process.env.NEXT_PUBLIC_CONTACT_XIAOHONGSHU ||
    'https://xhslink.cn/m/2XpLCC92KkJ'
  const CONTACT_WECHAT_QRCODE =
    process.env.NEXT_PUBLIC_CONTACT_WECHAT_QRCODE ||
    'https://cdn.jsdmirror.com/gh/88lin/picx-images-hosting@master/qrcode.1ovwa0ke25.png'
  const [showWechatQR, setShowWechatQR] = useState(false)
  const wechatWrapperRef = useRef(null)

  const emailIcon = useRef(null)

  useEffect(() => {
  if (!showWechatQR) return

  const handleClickOutside = (e) => {
    if (
      wechatWrapperRef.current &&
      !wechatWrapperRef.current.contains(e.target)
    ) {
      setShowWechatQR(false)
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Escape') setShowWechatQR(false)
  }

  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
  return () => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeyDown)
  }
}, [showWechatQR])

  return (
    <div className='w-full h-full px-4 justify-center items-center flex-wrap flex'>
      <div className='flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-3xl text-[#4b5563] dark:text-gray-300'>
        {CONTACT_DOUYIN && (
          <a
            target='_blank'
            rel='noreferrer'
            title='douyin'
            href={CONTACT_DOUYIN}>
            <img
              src='https://p-pc-weboff.byteimg.com/tos-cn-i-9r5gewecjs/logo-horizontal-small.svg'
              alt='douyin'
              loading='lazy'
              decoding='async'
              className='inline-block transform hover:scale-125 duration-150 dark:hover:opacity-90 hover:opacity-90'
              style={{ width: '1em', height: '1em', verticalAlign: '-0.125em' }}
            />
          </a>
        )}
        {CONTACT_XIAOHONGSHU && (
          <a
            target='_blank'
            rel='noreferrer'
            title='小红书'
            href={CONTACT_XIAOHONGSHU}>
            <img
              src='https://cdn.jsdmirror.com/gh/88lin/picx-images-hosting@master/xiaohongshu.b9cpfgij9.svg'
              alt='小红书'
              loading='lazy'
              decoding='async'
              className='inline-block transform hover:scale-125 duration-150 dark:hover:opacity-90 hover:opacity-90'
              style={{ width: '1em', height: '1em', verticalAlign: '-0.125em' }}
            />
          </a>
        )}
        {CONTACT_WECHAT_QRCODE && (
          <div
            ref={wechatWrapperRef}
            className='relative inline-flex'
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') setShowWechatQR(true)
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === 'mouse') setShowWechatQR(false)
            }}
          >
            <span
              role='button'
              tabIndex={0}
              aria-expanded={showWechatQR}
              aria-label='微信公众号'
              className='cursor-pointer transform transition-transform duration-150 hover:scale-125'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowWechatQR(v => !v)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setShowWechatQR(v => !v)
                }
              }}
            >
              <i className='fab fa-weixin dark:hover:text-indigo-400 hover:text-indigo-600' />
            </span>
            {showWechatQR && (
              <div className='absolute bottom-12 left-1/2 -translate-x-1/2 z-40'>
                <div
                  className='w-36 rounded-xl bg-white dark:bg-neutral-800 shadow-2xl ring-1 ring-black/5 flex flex-col items-center px-3 py-2'
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={CONTACT_WECHAT_QRCODE}
                    alt='微信公众号二维码'
                    className='block w-28 h-28 object-contain'
                    draggable={false}
                  />
                  <div className='mt-1 text-[11px] leading-none text-gray-600 dark:text-gray-300 whitespace-nowrap'>
                    扫码关注公众号
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {CONTACT_BILIBILI && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'bilibili'}
            href={CONTACT_BILIBILI}>
            <i className='transform hover:scale-125 duration-150 fab fa-bilibili dark:hover:text-indigo-400 hover:text-indigo-600' />
          </a>
        )}
        {CONTACT_GITHUB && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'github'}
            href={CONTACT_GITHUB}>
            <i className='transform hover:scale-125 duration-150 fab fa-github dark:hover:text-indigo-400 hover:text-indigo-600' />
          </a>
        )}
        {CONTACT_ORCID && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'ORCID'}
            href={CONTACT_ORCID}>
            <i className='transform hover:scale-125 duration-150 fab fa-orcid dark:hover:text-indigo-400 hover:text-indigo-600' />
          </a>
        )}
        {CONTACT_TWITTER && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'twitter'}
            href={CONTACT_TWITTER}>
            <i className='transform hover:scale-125 duration-150 fab fa-twitter dark:hover:text-indigo-400 hover:text-indigo-600' />
          </a>
        )}
        {CONTACT_TELEGRAM && (
          <a
            target='_blank'
            rel='noreferrer'
            href={CONTACT_TELEGRAM}
            title={'telegram'}>
            <i className='transform hover:scale-125 duration-150 fab fa-telegram dark:hover:text-indigo-400 hover:text-indigo-600' />
          </a>
        )}
        {CONTACT_LINKEDIN && (
          <a
            target='_blank'
            rel='noreferrer'
            href={CONTACT_LINKEDIN}
            title={'linkIn'}>
            <i className='transform hover:scale-125 duration-150 fab fa-linkedin dark:hover:text-indigo-400 hover:text-indigo-600' />
          </a>
        )}
        {CONTACT_WEIBO && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'weibo'}
            href={CONTACT_WEIBO}>
            <i className='transform hover:scale-125 duration-150 fab fa-weibo dark:hover:text-indigo-400 hover:text-indigo-600' />
          </a>
        )}
        {CONTACT_INSTAGRAM && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'instagram'}
            href={CONTACT_INSTAGRAM}>
            <i className='transform hover:scale-125 duration-150 fab fa-instagram dark:hover:text-indigo-400 hover:text-indigo-600' />
          </a>
        )}
        {CONTACT_EMAIL && (
          <a
            onClick={e => handleEmailClick(e, emailIcon, CONTACT_EMAIL)}
            title='email'
            className='cursor-pointer'
            ref={emailIcon}>
            <i className='transform hover:scale-125 duration-150 fas fa-envelope dark:hover:text-indigo-400 hover:text-indigo-600' />
          </a>
        )}
        {ENABLE_RSS && (
          // 手机上订阅 RSS 没什么意义，窄屏直接收起来给别的图标腾位置
          <a
            target='_blank'
            rel='noreferrer'
            title={'RSS'}
            href={'/rss/feed.xml'}
            className='hidden sm:block'>
            <i className='transform hover:scale-125 duration-150 fas fa-rss dark:hover:text-indigo-400 hover:text-indigo-600' />
          </a>
        )}
        {CONTACT_YOUTUBE && (
          <a
            target='_blank'
            rel='noreferrer'
            title={'youtube'}
            href={CONTACT_YOUTUBE}>
            <i className='transform hover:scale-125 duration-150 fab fa-youtube dark:hover:text-indigo-400 hover:text-indigo-600' />
          </a>
        )}
      </div>
    </div>
  )
}
export default SocialButton
