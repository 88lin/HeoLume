import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CONFIG from '../config'
import NotByAI from '@/components/NotByAI'
import LazyImage from '@/components/LazyImage'
import PostReward from './PostReward'
import { resolveArticleCopyrightText } from '@/lib/utils/articleCopyright'

const CC_ICON_PATHS = {
  cc: 'M245.83 214.87l-33.22 17.28c-9.43-19.58-25.24-19.93-27.46-19.93-22.13 0-33.22 14.61-33.22 43.84 0 23.57 9.21 43.84 33.22 43.84 14.47 0 24.65-7.09 30.57-21.26l30.55 15.5c-6.17 11.51-25.69 38.98-65.1 38.98-22.6 0-73.96-10.32-73.96-77.05 0-58.69 43-77.06 72.63-77.06 30.72-.01 52.7 11.95 65.99 35.86zm143.05 0l-32.78 17.28c-9.5-19.77-25.72-19.93-27.9-19.93-22.14 0-33.22 14.61-33.22 43.84 0 23.55 9.23 43.84 33.22 43.84 14.45 0 24.65-7.09 30.54-21.26l31 15.5c-2.1 3.75-21.39 38.98-65.09 38.98-22.69 0-73.96-9.87-73.96-77.05 0-58.67 42.97-77.06 72.63-77.06 30.71-.01 52.58 11.95 65.56 35.86zM247.56 8.05C104.74 8.05 0 123.11 0 256.05c0 138.49 113.6 248 247.56 248 129.93 0 248.44-100.87 248.44-248 0-137.87-106.62-248-248.44-248zm.87 450.81c-112.54 0-203.7-93.04-203.7-202.81 0-105.42 85.43-203.27 203.72-203.27 112.53 0 202.82 89.46 202.82 203.26-.01 121.69-99.68 202.82-202.84 202.82z',
  by: 'M314.9 194.4v101.4h-28.3v120.5h-77.1V295.9h-28.3V194.4c0-4.4 1.6-8.2 4.6-11.3 3.1-3.1 6.9-4.7 11.3-4.7H299c4.1 0 7.8 1.6 11.1 4.7 3.1 3.2 4.8 6.9 4.8 11.3zm-101.5-63.7c0-23.3 11.5-35 34.5-35s34.5 11.7 34.5 35c0 23-11.5 34.5-34.5 34.5s-34.5-11.5-34.5-34.5zM247.6 8C389.4 8 496 118.1 496 256c0 147.1-118.5 248-248.4 248C113.6 504 0 394.5 0 256 0 123.1 104.7 8 247.6 8zm.8 44.7C130.2 52.7 44.7 150.6 44.7 256c0 109.8 91.2 202.8 203.7 202.8 103.2 0 202.8-81.1 202.8-202.8.1-113.8-90.2-203.3-202.8-203.3z',
  nc: 'M247.6 8C387.4 8 496 115.9 496 256c0 147.2-118.5 248-248.4 248C113.1 504 0 393.2 0 256 0 123.1 104.7 8 247.6 8zM55.8 189.1c-7.4 20.4-11.1 42.7-11.1 66.9 0 110.9 92.1 202.4 203.7 202.4 122.4 0 177.2-101.8 178.5-104.1l-93.4-41.6c-7.7 37.1-41.2 53-68.2 55.4v38.1h-28.8V368c-27.5-.3-52.6-10.2-75.3-29.7l34.1-34.5c31.7 29.4 86.4 31.8 86.4-2.2 0-6.2-2.2-11.2-6.6-15.1-14.2-6-1.8-.1-219.3-97.4zM248.4 52.3c-38.4 0-112.4 8.7-170.5 93l94.8 42.5c10-31.3 40.4-42.9 63.8-44.3v-38.1h28.8v38.1c22.7 1.2 43.4 8.9 62 23L295 199.7c-42.7-29.9-83.5-8-70 11.1 53.4 24.1 43.8 19.8 93 41.6l127.1 56.7c4.1-17.4 6.2-35.1 6.2-53.1 0-57-19.8-105-59.3-143.9-39.3-39.9-87.2-59.8-143.6-59.8z',
  nd: 'M247.6 8C389.4 8 496 118.1 496 256c0 147.1-118.5 248-248.4 248C113.6 504 0 394.5 0 256 0 123.1 104.7 8 247.6 8zm.8 44.7C130.2 52.7 44.7 150.6 44.7 256c0 109.8 91.2 202.8 203.7 202.8 103.2 0 202.8-81.1 202.8-202.8.1-113.8-90.2-203.3-202.8-203.3zm94 144.3v42.5H162.1V197h180.3zm0 79.8v42.5H162.1v-42.5h180.3z'
}

const CCIcon = ({ name, className }) => (
  <svg
    viewBox='0 0 496 512'
    className={className}
    role='img'
    aria-hidden='true'
    focusable='false'>
    <path fill='currentColor' d={CC_ICON_PATHS[name]} />
  </svg>
)

/**
 * 版权声明
 * @returns
 */
export default function PostCopyright({ siteInfo, post }) {
  const router = useRouter()
  const [path, setPath] = useState(siteConfig('LINK') + router.asPath)
  useEffect(() => {
    setPath(window.location.href)
  }, [router.asPath])

  const { locale } = useGlobal()
  const author = siteConfig('AUTHOR')
  const HEO_HERO_TITLE_3 = siteConfig('HEO_HERO_TITLE_3')
  const homeHref = siteConfig('SUB_PATH', '') || '/about'
  const enableRSS = siteConfig('ENABLE_RSS')
  const authorAvatar = siteInfo?.icon || siteInfo?.pageCover || '/favicon.svg'
  const copyrightText = resolveArticleCopyrightText({
    post,
    locale,
    mode: siteConfig('HEO_ARTICLE_COPYRIGHT', null, CONFIG)
  })

  if (!copyrightText) {
    return <></>
  }

  return (
    <section className='heo-post-footer__copyright'>
      <div className='heo-copyright-card rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.94))] p-5 shadow-[0_18px_44px_rgba(15,23,42,0.06)] dark:border-slate-700/50 dark:bg-[linear-gradient(180deg,rgba(28,29,35,0.94),rgba(22,23,28,0.96))] dark:shadow-[0_18px_42px_rgba(0,0,0,0.18)] sm:p-6'>
        <div className='heo-copyright-card__watermark' aria-hidden='true'>
          <CCIcon name='cc' className='heo-copyright-card__mark' />
        </div>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
          <div className='max-w-2xl'>
            <div className='text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500'>
              Article Rights
            </div>
            <div className='mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100'>
              版权与转载说明
            </div>
            <div className='mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400'>
              本文为原创内容，转载、摘录或引用时请保留作者署名、文章链接与协议说明，保持阅读链路完整。
            </div>
          </div>

          <div className='flex flex-wrap items-center justify-center gap-3 lg:flex-nowrap lg:justify-end lg:shrink-0'>
            <PostReward />

            <SmartLink
              href={homeHref}
              className='inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/70 px-4 py-2 text-sm font-medium text-indigo-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300/80 hover:bg-blue-50 dark:border-blue-400/20 dark:bg-blue-400/[0.08] dark:hover:border-blue-300/35 dark:hover:bg-blue-400/[0.12]'>
              <i className='fas fa-feather-pointed text-sm text-blue-400 dark:text-blue-500' />
              <span>访问作者</span>
            </SmartLink>

            {enableRSS && (
              <SmartLink
                href='/rss/feed.xml'
                className='hidden items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/85 px-4 py-2 text-sm font-medium text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300/80 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08] dark:text-emerald-300 dark:hover:border-emerald-300/35 dark:hover:bg-emerald-400/[0.12] sm:inline-flex'>
                <i className='fas fa-rss text-sm' />
                <span>{locale?.COMMON?.RSS || '订阅'}</span>
              </SmartLink>
            )}
          </div>
        </div>

        <div className='mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)]'>
          <div className='rounded-[1.45rem] border border-slate-200/75 bg-slate-50/72 p-4 dark:border-slate-700/45 dark:bg-slate-900/14'>
            <div className='flex items-center gap-4'>
              <div className='relative h-14 w-14 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-white/8 dark:bg-[#262830] dark:shadow-[0_10px_24px_rgba(0,0,0,0.18)]'>
                <LazyImage
                  src={authorAvatar}
                  className='h-full w-full object-cover'
                  alt={author}
                />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500'>
                  Author
                </div>
                <div className='mt-1 truncate text-lg font-semibold text-slate-800 dark:text-slate-100'>
                  {author}
                </div>
                <div className='mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400'>
                  {HEO_HERO_TITLE_3}
                </div>
              </div>
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2 sm:gap-4'>
            <a
              href='https://creativecommons.org/licenses/by-nc-nd/4.0/'
              target='_blank'
              rel='noopener noreferrer license'
              title='Creative Commons BY-NC-ND 4.0'
              className='heo-copyright-card__license block rounded-[1.3rem] border border-slate-200/75 bg-slate-50/72 p-3.5 dark:border-slate-700/45 dark:bg-slate-900/14 sm:rounded-[1.45rem] sm:p-4'>
              <div className='text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500'>
                License
              </div>
              <div className='heo-copyright-card__cc mt-2' aria-hidden='true'>
                <CCIcon name='cc' />
                <CCIcon name='by' />
                <CCIcon name='nc' />
                <CCIcon name='nd' />
              </div>
              <div className='mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-base'>
                CC BY-NC-ND 4.0
              </div>
            </a>

            <div className='rounded-[1.3rem] border border-slate-200/75 bg-slate-50/72 p-3.5 dark:border-slate-700/45 dark:bg-slate-900/14 sm:rounded-[1.45rem] sm:p-4'>
              <div className='text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500'>
                Notice
              </div>
              <div className='mt-2 break-words text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100 sm:text-base'>
                {copyrightText}
              </div>
            </div>
          </div>
        </div>

        <div className='heo-copyright-card__source mt-4 rounded-[1.45rem] border border-slate-200/75 bg-slate-50/72 p-4 dark:border-slate-700/45 dark:bg-slate-900/14'>
          <div className='text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500'>
            Source URL
          </div>
          <a
            className='mt-2 block break-all text-sm leading-7 text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-orange-300'
            href={path}>
            {path}
          </a>
        </div>

        {siteConfig('HEO_ARTICLE_NOT_BY_AI', false, CONFIG) && (
          <div className='mt-5 flex justify-start'>
            <div className='scale-95 sm:scale-100'>
              <NotByAI />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
