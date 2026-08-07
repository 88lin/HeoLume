// import Image from 'next/image'
import { ArrowSmallRight } from '@/components/HeroIcons'
import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import CONFIG from '../config'
import HelloCover from './HelloCover'

/**
 * 顶部英雄区
 * 左右布局，
 * 左侧：banner组
 * 右侧：今日卡牌遮罩
 * @returns
 */
const Hero = props => {
  const HEO_HERO_REVERSE = siteConfig('HEO_HERO_REVERSE', false, CONFIG)
  return (
    <div
      id='hero-wrapper'
      className='recent-top-post-group w-full overflow-hidden select-none mb-4'>
      <div
        id='hero'
        style={{ zIndex: 1 }}
        className={`${HEO_HERO_REVERSE ? 'xl:flex-row-reverse' : ''}
           recent-post-top rounded-[12px] recent-top-post-group max-w-[86rem] overflow-x-scroll w-full mx-auto px-5 flex-row flex-nowrap flex relative`}>
        {/* 左侧banner组 */}
        <BannerGroup {...props} />

        {/* 中间留白 */}
        <div className='px-1.5 h-full'></div>

        {/* 右侧置顶文章组 */}
        <TopGroup {...props} />
      </div>
    </div>
  )
}

/**
 * 英雄区左侧banner组
 * @returns
 */
function BannerGroup(props) {
  return (
    // 左侧英雄区
    <div
      id='bannerGroup'
      className='flex flex-col justify-between flex-1 mr-2 max-w-[42rem]'>
      {/* 动图 */}
      <Banner {...props} />
      {/* 导航分类 */}
      <GroupMenu />
    </div>
  )
}

/**
 * 英雄区左上角banner动图
 * @returns
 */
function Banner(props) {
  const router = useRouter()
  const { allNavPages } = props
  /**
   * 随机跳转文章
   */
  function handleClickBanner() {
    const posts = Array.isArray(allNavPages)
      ? allNavPages.filter(post => post?.href)
      : []
    if (posts.length === 0) return

    const randomPost = posts[Math.floor(Math.random() * posts.length)]
    router.push(randomPost.href)
  }

  // 遮罩文字
  const coverTitle = siteConfig('HEO_HERO_COVER_TITLE', null, CONFIG)

  return (
    <div
      id='banners'
      onClick={handleClickBanner}
      className='hidden xl:flex xl:flex-col group h-full bg-white dark:bg-[#1e1e1e] rounded-xl border dark:border-gray-700 mb-3 relative overflow-hidden'>
      <div
        id='banner-title'
        className='z-10 flex flex-col absolute top-10 left-10'>
        <div className='text-4xl font-bold mb-3  dark:text-white'>
          {siteConfig('HEO_HERO_TITLE_1', null, CONFIG)}
          <br />
          {siteConfig('HEO_HERO_TITLE_2', null, CONFIG)}
        </div>
        <div className='text-xs font-normal text-gray-600 dark:text-gray-200'>
          {siteConfig('HEO_HERO_TITLE_3', null, CONFIG)}
        </div>
      </div>

      {/* 斜向滚动的图标 */}
      <TagsGroupBar />

      {/* 遮罩 */}
      <div
        id='banner-cover'
        className={
          'z-20 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 duration-300 transition-all cursor-pointer absolute w-full h-full top-0 flex justify-start items-center'
        }>
        <div
          id='banner-cover-content'
          className='ml-12 -translate-x-24 group-hover:translate-x-0 duration-500 transition-all ease-out'>
          <i className='fa-solid fa-paper-plane banner-cover-leading-icon' aria-hidden='true' />
          <div id='banner-cover-title'>
            <span>{coverTitle}</span>
            <ArrowSmallRight className='banner-cover-inline-icon stroke-2' />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 图标滚动标签组
 * 英雄区左上角banner条中斜向滚动的图标
 */
function TagsGroupBar() {
  let groupIcons = siteConfig('HEO_GROUP_ICONS', null, CONFIG)
  if (groupIcons) {
    groupIcons = groupIcons.concat(groupIcons)
  }
  return (
    <div className='tags-group-all flex -rotate-[30deg] h-full'>
      <div className='tags-group-wrapper flex flex-nowrap absolute top-20 left-6'>
        {groupIcons?.map((g, index) => {
          return (
            <div key={index} className='tags-group-icon-pair ml-6 select-none'>
              <div
                style={{ background: g.color_1 }}
                className={
                  'tags-group-icon w-28 h-28 rounded-3xl flex items-center justify-center text-white text-lg font-bold shadow-md'
                }>
                <LazyImage
                  src={g.img_1}
                  title={g.title_1}
                  className='w-2/3 hidden xl:block'
                />
              </div>
              <div
                style={{ background: g.color_2 }}
                className={
                  'tags-group-icon  mt-5 w-28 h-28 rounded-3xl flex items-center justify-center text-white text-lg font-bold shadow-md'
                }>
                <LazyImage
                  src={g.img_2}
                  title={g.title_2}
                  className='w-2/3 hidden xl:block'
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * 英雄区左下角3个指定分类按钮
 * @returns
 */
function GroupMenu() {
  const url_1 = siteConfig('HEO_HERO_CATEGORY_1', {}, CONFIG)?.url || ''
  const title_1 = siteConfig('HEO_HERO_CATEGORY_1', {}, CONFIG)?.title || ''
  const url_2 = siteConfig('HEO_HERO_CATEGORY_2', {}, CONFIG)?.url || ''
  const title_2 = siteConfig('HEO_HERO_CATEGORY_2', {}, CONFIG)?.title || ''
  const url_3 = siteConfig('HEO_HERO_CATEGORY_3', {}, CONFIG)?.url || ''
  const title_3 = siteConfig('HEO_HERO_CATEGORY_3', {}, CONFIG)?.title || ''

  return (
    <div className='h-[165px] select-none xl:h-20 flex flex-col justify-between xl:space-y-0 xl:flex-row w-28 lg:w-48 xl:w-full xl:flex-nowrap xl:space-x-3'>
      <SmartLink
        href={url_1}
        className='group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-400 flex h-20 justify-start items-center text-white rounded-2xl xl:hover:w-1/2 xl:w-1/3 transition-all duration-500 ease-in'>
        <div className='font-bold lg:text-lg  pl-5 relative -mt-2'>
          {title_1}
          <span className='absolute -bottom-0.5 left-5 w-5 h-0.5 bg-white rounded-full'></span>
        </div>
        <div className='hidden lg:block absolute right-6  duration-700 ease-in-out transition-all scale-[2] translate-y-6 rotate-12 opacity-20 group-hover:opacity-80 group-hover:scale-100 group-hover:translate-y-0 group-hover:rotate-0'>
          <i className='fa-solid fa-star text-4xl'></i>
        </div>
      </SmartLink>
      <SmartLink
        href={url_2}
        className='group relative overflow-hidden bg-gradient-to-r from-red-500 to-yellow-500 flex h-20 justify-start items-center text-white rounded-2xl xl:hover:w-1/2 xl:w-1/3 transition-all duration-500 ease-in'>
        <div className='font-bold lg:text-lg pl-5 relative -mt-2'>
          {title_2}
          <span className='absolute -bottom-0.5 left-5 w-5 h-0.5 bg-white rounded-full'></span>
        </div>
        <div className='hidden lg:block absolute right-6  duration-700 ease-in-out transition-all scale-[2] translate-y-6 rotate-12 opacity-20 group-hover:opacity-80 group-hover:scale-100 group-hover:translate-y-0 group-hover:rotate-0'>
          <i className='fa-solid fa-fire-flame-curved text-4xl'></i>
        </div>
      </SmartLink>
      {/* 第三个标签在小屏上不显示 */}
      <SmartLink
        href={url_3}
        className='group relative overflow-hidden bg-gradient-to-r from-teal-300 to-cyan-300 hidden h-20 xl:flex justify-start items-center text-white rounded-2xl xl:hover:w-1/2 xl:w-1/3 transition-all duration-500 ease-in'>
        <div className='font-bold text-lg pl-5 relative -mt-2'>
          {title_3}
          <span className='absolute -bottom-0.5 left-5 w-5 h-0.5 bg-white rounded-full'></span>
        </div>
        <div className='absolute right-6 duration-700 ease-in-out transition-all scale-[2] translate-y-6 rotate-12 opacity-20 group-hover:opacity-80 group-hover:scale-100 group-hover:translate-y-0 group-hover:rotate-0'>
          <i className='fa-solid fa-book-bookmark text-4xl '></i>
        </div>
      </SmartLink>
    </div>
  )
}

/**
 * 置顶文章区域
 */
function TopGroup(props) {
  const { latestPosts, allNavPages, siteInfo } = props
  const { locale } = useGlobal()
  const todayCardRef = useRef()
  function handleMouseLeave() {
    todayCardRef.current?.coverUp?.()
  }

  // 获取置顶推荐文章
  const topPosts = getTopPosts({ latestPosts, allNavPages })

  return (
    <div
      id='hero-right-wrapper'
      onMouseLeave={handleMouseLeave}
      className='flex-1 relative w-full'>
      {/* 置顶推荐文章 */}
      <div
        id='top-group'
        className='w-full flex space-x-3 xl:space-x-0 xl:grid xl:grid-cols-3 xl:gap-3 xl:h-[342px]'>
        {topPosts?.map((p, index) => {
          return (
            <SmartLink href={p?.href} key={index}>
              <div className='cursor-pointer h-[164px] group relative flex flex-col w-52 xl:w-full overflow-hidden shadow bg-white dark:bg-[#1e1e1e] dark:text-white rounded-2xl'>
                <LazyImage
                  priority={index === 0}
                  className='h-24 object-cover'
                  alt={p?.title}
                  src={p?.pageCoverThumbnail || siteInfo?.pageCover}
                />
                <div className='group-hover:text-indigo-600 dark:group-hover:text-[#ffc848] line-clamp-2 overflow-hidden m-2 font-semibold'>
                  {p?.title}
                </div>
                {/* hover 悬浮的 ‘荐’ 字 */}
                <div className='opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 duration-200 transition-all absolute -top-2 -left-2 bg-[#3a86ff] dark:bg-[#ec4899]  text-white rounded-xl overflow-hidden pr-2 pb-2 pl-4 pt-4 text-xs'>
                  {locale.COMMON.RECOMMEND_BADGES}
                </div>
              </div>
            </SmartLink>
          )
        })}
      </div>
      {/* 一个大的跳转文章卡片 */}
      <TodayCard cRef={todayCardRef} />
    </div>
  )
}

/**
 * 获取推荐置顶文章
 */
function getTopPosts({ latestPosts, allNavPages }) {
  const fallbackPosts = Array.isArray(latestPosts)
    ? latestPosts.filter(post => post?.href)
    : []

  // 默认展示最近更新
  if (
    !siteConfig('HEO_HERO_RECOMMEND_POST_TAG', null, CONFIG) ||
    siteConfig('HEO_HERO_RECOMMEND_POST_TAG', null, CONFIG) === ''
  ) {
    return fallbackPosts
  }

  // 显示包含‘推荐’标签的文章
  let sortPosts = Array.isArray(allNavPages)
    ? allNavPages.filter(post => post?.href)
    : []

  // 排序方式
  const sortByUpdate = siteConfig(
    'HEO_HERO_RECOMMEND_POST_SORT_BY_UPDATE_TIME',
    null,
    CONFIG
  )
  if (sortByUpdate === true || sortByUpdate === 'true') {
    sortPosts.sort((a, b) => {
      const dateA = new Date(a?.lastEditedDate || 0)
      const dateB = new Date(b?.lastEditedDate || 0)
      return dateB - dateA
    })
  }

  const topPosts = []
  for (const post of sortPosts) {
    if (topPosts.length === 6) {
      break
    }
    // 查找标签
    if (
      post?.tags?.indexOf(
        siteConfig('HEO_HERO_RECOMMEND_POST_TAG', null, CONFIG)
      ) >= 0
    ) {
      topPosts.push(post)
    }
  }
  return topPosts
}

/**
 * 英雄区右侧，今日卡牌
 * @returns
 */
function TodayCard({ cRef }) {
  const router = useRouter()
  const link = siteConfig('HEO_HERO_TITLE_LINK', null, CONFIG)
  const tips = siteConfig('HEO_HERO_TITLE_4', null, CONFIG)
  const title = siteConfig('HEO_HERO_TITLE_5', null, CONFIG)
  const cover =
    siteConfig('HERO_RECOMMEND_COVER', null, CONFIG) || '/images/heo/hello.svg'
  const isAnimatedHelloCover =
    typeof cover === 'string' &&
    cover.split(/[?#]/)[0] === '/images/heo/hello.svg'
  const [isHelloPlaying, setIsHelloPlaying] = useState(false)
  const coverContainerRef = useRef(null)
  // 获取遮罩控制配置
  const coverEnable = siteConfig('HEO_HERO_RECOMMEND_COVER_ENABLE', true, CONFIG)
  // 卡牌是否盖住下层，如果配置为false则默认不盖住
  const [isCoverUp, setIsCoverUp] = useState(coverEnable)

  // 在加载遮罩刚好滑过卡片时启动，避免动画提前播放或露出后再等待。
  useEffect(() => {
    if (!isAnimatedHelloCover) return

    let animationFrameId
    let hasStarted = false
    let pageLoadHandler

    const startAnimation = () => {
      if (hasStarted) return
      hasStarted = true
      setIsHelloPlaying(true)
    }

    const startWhenCardIsRevealed = () => {
      const loadingBox = document.getElementById('loading-box')
      if (!loadingBox) {
        startAnimation()
        return
      }

      const loadingBoxStyle = window.getComputedStyle(loadingBox)
      if (
        loadingBoxStyle.display === 'none' ||
        loadingBoxStyle.visibility === 'hidden' ||
        Number(loadingBoxStyle.opacity) === 0
      ) {
        startAnimation()
        return
      }

      const coverContainer = coverContainerRef.current
      const loadingBackground = loadingBox.querySelector('.loading-bg')
      if (coverContainer && loadingBackground) {
        const coverRect = coverContainer.getBoundingClientRect()
        const loadingRect = loadingBackground.getBoundingClientRect()
        if (coverRect.width > 0 && loadingRect.left >= coverRect.left) {
          startAnimation()
          return
        }
      }

      animationFrameId = requestAnimationFrame(startWhenCardIsRevealed)
    }

    const startAfterPageReady = () => {
      // 等首屏资源完成后再检查遮罩，避免服务端动画和水合后的动画重复播放。
      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = requestAnimationFrame(startWhenCardIsRevealed)
      })
    }

    if (document.readyState === 'complete') {
      startAfterPageReady()
    } else {
      pageLoadHandler = startAfterPageReady
      window.addEventListener('load', pageLoadHandler, { once: true })
    }

    return () => {
      if (pageLoadHandler) {
        window.removeEventListener('load', pageLoadHandler)
      }
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [cover, isAnimatedHelloCover])

  /**
   * 外部可以调用此方法
   */
  useImperativeHandle(cRef, () => {
    return {
      coverUp: () => {
        if (coverEnable) {
          setIsCoverUp(true)
        }
      }
    }
  })

  /**
   * 查看更多
   * @param {*} e
   */
  function handleClickShowMore(e) {
    e.stopPropagation()
    setIsCoverUp(false)
  }

  /**
   * 点击卡片跳转的链接
   * @param {*} e
   */
  function handleCardClick(e) {
    if (!link) return
    router.push(link)
  }

  // 如果配置为不显示遮罩，则不渲染TodayCard
  if (!coverEnable) {
    return null
  }

  return (
    <div
      id='today-card'
      className={`${
        isCoverUp ? ' ' : 'pointer-events-none'
      } overflow-hidden absolute hidden xl:flex flex-1 flex-col h-full top-0 w-full`}>
      <div
        id='card-body'
        onClick={handleCardClick}
        className={`${
          isCoverUp
            ? 'opacity-100 cursor-pointer'
            : 'opacity-0 transform scale-110 pointer-events-none'
        } shadow transition-all duration-200 today-card h-full bg-black rounded-2xl relative overflow-hidden flex items-end`}>
        <div
          ref={coverContainerRef}
          id='today-card-cover'
          className='today-card-cover absolute inset-0'>
          {isAnimatedHelloCover ? (
            <HelloCover
              play={isHelloPlaying}
              title={title || 'hero recommend cover'}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              id='today-card-cover-image'
              src={cover}
              alt={title || 'hero recommend cover'}
            />
          )}
        </div>

        <div
          id='today-card-info'
          className='absolute left-8 bottom-8 z-[2] max-w-[60%]'>
          <div id='today-card-tips'>{tips}</div>
          <div id='today-card-title'>{title}</div>
        </div>

        {/* 查看更多的按钮 */}
        <div
          onClick={handleClickShowMore}
          id='today-card-more-button'
          className={`${isCoverUp ? '' : 'hidden pointer-events-none'} absolute right-8 bottom-8 z-[5] flex items-center justify-center`}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
            role='img'
            width='22'
            height='22'
            viewBox='0 0 24 24'>
            <path
              fill='currentColor'
              d='M17 3.34a10 10 0 1 1-14.995 8.984L2 12l.005-.324A10 10 0 0 1 17 3.34M15 8H9l-.117.007A1 1 0 0 0 8 9l.007.117A1 1 0 0 0 9 10h3.584l-4.291 4.293l-.083.094a1 1 0 0 0 1.497 1.32L14 11.414V15l.007.117A1 1 0 0 0 16 15V9l-.007-.117l-.029-.149l-.035-.105l-.054-.113l-.071-.111a1 1 0 0 0-.097-.112l-.09-.08l-.096-.067l-.098-.052l-.11-.044l-.112-.03l-.126-.017z'
            />
          </svg>
          <div id='more' className='select-none'>
            更多推荐
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
