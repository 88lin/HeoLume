import { siteConfig } from '@/lib/config'
import { buildQQShareUrl } from '@/lib/utils/share'
import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { createPortal } from 'react-dom'
import { Fragment, useEffect, useId, useRef, useState } from 'react'

import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookMessengerIcon,
  FacebookMessengerShareButton,
  FacebookShareButton,
  HatenaIcon,
  HatenaShareButton,
  InstapaperIcon,
  InstapaperShareButton,
  LineIcon,
  LineShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  LivejournalIcon,
  LivejournalShareButton,
  MailruIcon,
  MailruShareButton,
  OKIcon,
  OKShareButton,
  PinterestIcon,
  PinterestShareButton,
  PocketIcon,
  PocketShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TumblrIcon,
  TumblrShareButton,
  TwitterIcon,
  TwitterShareButton,
  ThreadsIcon,
  ThreadsShareButton,
  ViberIcon,
  ViberShareButton,
  VKIcon,
  VKShareButton,
  WeiboIcon,
  WeiboShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  WorkplaceIcon,
  WorkplaceShareButton
} from 'react-share'

const QrCode = dynamic(() => import('@/components/QrCode'), { ssr: false })
const BASE_BUTTON_CLASS =
  'cursor-pointer rounded-full mx-1 w-8 h-8 flex items-center justify-center text-white'
const ICON_CLASS = 'text-sm leading-none'

/**
 * @author https://github.com/txs
 * @param {*} param0
 * @returns
 */
const ShareButtons = ({ post }) => {
  const router = useRouter()
  const [shareUrl, setShareUrl] = useState(siteConfig('LINK') + router.asPath)
  const title = post?.title || siteConfig('TITLE')
  const image = post?.pageCover
  const tags = post?.tags || []
  const hashTags = tags.map(tag => `#${tag}`).join(',')
  const body =
    post?.title + ' | ' + title + ' ' + shareUrl + ' ' + post?.summary

  const services = siteConfig('POSTS_SHARE_SERVICES').split(',')
  const titleWithSiteInfo = title + ' | ' + siteConfig('TITLE')
  const { locale } = useGlobal()
  const [qrCodeShow, setQrCodeShow] = useState(false)
  const [qrCodePosition, setQrCodePosition] = useState(null)
  const qrCloseTimer = useRef(null)
  const qrButtonRef = useRef(null)
  const qrPopoverRef = useRef(null)
  const qrPopoverId = useId()

  const copyUrl = () => {
    let decodedUrl = shareUrl
    try {
      decodedUrl = decodeURIComponent(shareUrl)
    } catch {
      // Keep the original URL when a custom site URL contains malformed escapes.
    }
    if (typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(decodedUrl)
    }
    alert(locale.COMMON.URL_COPIED + ' \n' + decodedUrl)
  }

  const clearQrCloseTimer = () => {
    if (qrCloseTimer.current) {
      window.clearTimeout(qrCloseTimer.current)
      qrCloseTimer.current = null
    }
  }

  const openPopover = event => {
    clearQrCloseTimer()
    const trigger = event?.currentTarget || qrButtonRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const popupWidth = 128
    const popupHeight = 152
    const gap = 8
    const left = Math.min(
      Math.max(8, rect.left + rect.width / 2 - popupWidth / 2),
      Math.max(8, window.innerWidth - popupWidth - 8)
    )
    const top =
      rect.top >= popupHeight + gap
        ? rect.top - popupHeight - gap
        : rect.bottom + gap

    setQrCodePosition({ left, top })
    setQrCodeShow(true)
  }
  const scheduleQrClose = () => {
    clearQrCloseTimer()
    qrCloseTimer.current = window.setTimeout(() => {
      setQrCodeShow(false)
      qrCloseTimer.current = null
    }, 400)
  }
  const openRedirectShare = base => {
    if (!shareUrl || typeof window === 'undefined') return
    window.open(
      `${base}${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }
  useEffect(() => {
    setShareUrl(window.location.href)
  }, [])

  useEffect(() => {
    return () => clearQrCloseTimer()
  }, [])

  useEffect(() => {
    if (!qrCodeShow) return

    const closePopover = () => {
      if (qrCloseTimer.current) {
        window.clearTimeout(qrCloseTimer.current)
        qrCloseTimer.current = null
      }
      setQrCodeShow(false)
    }
    const handlePointerDown = event => {
      if (
        qrButtonRef.current?.contains(event.target) ||
        qrPopoverRef.current?.contains(event.target)
      ) {
        return
      }
      closePopover()
    }
    const handleKeyDown = event => {
      if (event.key === 'Escape') closePopover()
    }
    const handleViewportChange = () => closePopover()

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [qrCodeShow])

  return (
    <>
      {services.map(singleService => {
        switch (singleService) {
          case 'facebook':
            return (
              <FacebookShareButton
                key={singleService}
                url={shareUrl}
                hashtag={hashTags}
                className='mx-1'
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
            )
          case 'messenger':
            return (
              <FacebookMessengerShareButton
                key={singleService}
                url={shareUrl}
                appId={siteConfig('FACEBOOK_APP_ID')}
                className='mx-1'
              >
                <FacebookMessengerIcon size={32} round />
              </FacebookMessengerShareButton>
            )
          case 'line':
            return (
              <LineShareButton
                key={singleService}
                url={shareUrl}
                className='mx-1'
              >
                <LineIcon size={32} round />
              </LineShareButton>
            )
          case 'reddit':
            return (
              <RedditShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                windowWidth={660}
                windowHeight={460}
                className='mx-1'
              >
                <RedditIcon size={32} round />
              </RedditShareButton>
            )
          case 'email':
            return (
              <EmailShareButton
                key={singleService}
                url={shareUrl}
                subject={titleWithSiteInfo}
                body={body}
                className='mx-1'
              >
                <EmailIcon size={32} round />
              </EmailShareButton>
            )
          case 'twitter':
            return (
              <TwitterShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                hashtags={tags}
                className='mx-1'
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
            )
          case 'telegram':
            return (
              <TelegramShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                className='mx-1'
              >
                <TelegramIcon size={32} round />
              </TelegramShareButton>
            )
          case 'whatsapp':
            return (
              <WhatsappShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                separator=':: '
                className='mx-1'
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
            )
          case 'linkedin':
            return (
              <LinkedinShareButton
                key={singleService}
                url={shareUrl}
                className='mx-1'
              >
                <LinkedinIcon size={32} round />
              </LinkedinShareButton>
            )
          case 'pinterest':
            return (
              <PinterestShareButton
                key={singleService}
                url={shareUrl}
                media={image}
                className='mx-1'
              >
                <PinterestIcon size={32} round />
              </PinterestShareButton>
            )
          case 'vkshare':
            return (
              <VKShareButton
                key={singleService}
                url={shareUrl}
                image={image}
                className='mx-1'
              >
                <VKIcon size={32} round />
              </VKShareButton>
            )
          case 'okshare':
            return (
              <OKShareButton
                key={singleService}
                url={shareUrl}
                image={image}
                className='mx-1'
              >
                <OKIcon size={32} round />
              </OKShareButton>
            )
          case 'tumblr':
            return (
              <TumblrShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                tags={tags}
                className='mx-1'
              >
                <TumblrIcon size={32} round />
              </TumblrShareButton>
            )
          case 'livejournal':
            return (
              <LivejournalShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                description={shareUrl}
                className='mx-1'
              >
                <LivejournalIcon size={32} round />
              </LivejournalShareButton>
            )
          case 'mailru':
            return (
              <MailruShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                className='mx-1'
              >
                <MailruIcon size={32} round />
              </MailruShareButton>
            )
          case 'viber':
            return (
              <ViberShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                className='mx-1'
              >
                <ViberIcon size={32} round />
              </ViberShareButton>
            )
          case 'workplace':
            return (
              <WorkplaceShareButton
                key={singleService}
                url={shareUrl}
                quote={titleWithSiteInfo}
                hashtag={hashTags}
                className='mx-1'
              >
                <WorkplaceIcon size={32} round />
              </WorkplaceShareButton>
            )
          case 'weibo':
            return (
              <WeiboShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                image={image}
                className='mx-1'
              >
                <WeiboIcon size={32} round />
              </WeiboShareButton>
            )
          case 'pocket':
            return (
              <PocketShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                className='mx-1'
              >
                <PocketIcon size={32} round />
              </PocketShareButton>
            )
          case 'instapaper':
            return (
              <InstapaperShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                className='mx-1'
              >
                <InstapaperIcon size={32} round />
              </InstapaperShareButton>
            )
          case 'hatena':
            return (
              <HatenaShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                windowWidth={660}
                windowHeight={460}
                className='mx-1'
              >
                <HatenaIcon size={32} round />
              </HatenaShareButton>
            )
          case 'threads':
            return (
              <ThreadsShareButton
                key={singleService}
                url={shareUrl}
                title={titleWithSiteInfo}
                className='mx-1'
              >
                <ThreadsIcon size={32} round />
              </ThreadsShareButton>
            )
          case 'qq':
            return (
              <a
                aria-label={singleService}
                key={singleService}
                target='_blank'
                rel='noreferrer'
                className={`${BASE_BUTTON_CLASS} bg-blue-600`}
                title={singleService}
                href={buildQQShareUrl({ shareUrl, title, body })}
              >
                <i className={`fab fa-qq ${ICON_CLASS}`} />
              </a>
            )
          case 'wechat':
            return (
              <Fragment key={singleService}>
                <button
                  ref={qrButtonRef}
                  onPointerEnter={event => {
                    if (event.pointerType === 'mouse') openPopover(event)
                  }}
                  onPointerLeave={event => {
                    if (event.pointerType === 'mouse') scheduleQrClose()
                  }}
                  onFocus={openPopover}
                  onBlur={scheduleQrClose}
                  onClick={openPopover}
                  aria-label={singleService}
                  aria-controls={qrPopoverId}
                  aria-expanded={qrCodeShow}
                  aria-haspopup='dialog'
                  className={`${BASE_BUTTON_CLASS} bg-green-600`}
                  title={singleService}
                >
                  <i className={`fab fa-weixin ${ICON_CLASS}`} />
                </button>
                {qrCodeShow && qrCodePosition && typeof document !== 'undefined'
                  ? createPortal(
                      <div
                        ref={qrPopoverRef}
                        id={qrPopoverId}
                        role='dialog'
                        aria-label={locale.COMMON.SCAN_QR_CODE}
                        className='share-qr-popover fixed z-50 bg-white shadow-xl text-center'
                        onPointerEnter={clearQrCloseTimer}
                        onPointerLeave={scheduleQrClose}
                        style={{
                          left: `${qrCodePosition.left}px`,
                          top: `${qrCodePosition.top}px`,
                          zIndex: 1000
                        }}
                      >
                        <div className='p-2 mt-1 w-28 h-28 overflow-hidden'>
                          <QrCode value={shareUrl} size={96} />
                        </div>
                        <span className='text-black font-semibold p-1 rounded-t-lg text-sm mx-auto mb-1'>
                          {locale.COMMON.SCAN_QR_CODE}
                        </span>
                      </div>,
                      document.body
                    )
                  : null}
              </Fragment>
            )
          case 'link':
            return (
              <button
                aria-label={singleService}
                key={singleService}
                onClick={copyUrl}
                className={`${BASE_BUTTON_CLASS} bg-yellow-500`}
                title={singleService}
              >
                <i className={`fas fa-link ${ICON_CLASS}`} />
              </button>
            )
          case 'csdn':
            return (
              <button
                aria-label={singleService}
                key={singleService}
                onClick={() =>
                  openRedirectShare('https://link.csdn.net/?target=')
                }
                className='cursor-pointer rounded-full mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
                title={singleService}
              >
                <div
                  className='w-8 h-8 rounded-full flex items-center justify-center'
                  style={{ backgroundColor: '#ff6a00' }}
                >
                  <Image
                    src='/svg/csdn.svg'
                    alt='CSDN'
                    width={28}
                    height={28}
                    className='w-5 h-5'
                    loading='lazy'
                    unoptimized
                  />
                </div>
              </button>
            )
          case 'juejin':
            return (
              <button
                aria-label={singleService}
                key={singleService}
                onClick={() =>
                  openRedirectShare('https://link.juejin.cn/?target=')
                }
                className='cursor-pointer rounded-full mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                title={singleService}
              >
                <div
                  className='w-8 h-8 rounded-full flex items-center justify-center'
                  style={{ backgroundColor: '#5dade2' }}
                >
                  <Image
                    src='/svg/juejin.svg'
                    alt='掘金'
                    width={24}
                    height={24}
                    className='w-5 h-5'
                    loading='lazy'
                    unoptimized
                  />
                </div>
              </button>
            )
          default:
            return <></>
        }
      })}
    </>
  )
}

export default ShareButtons
