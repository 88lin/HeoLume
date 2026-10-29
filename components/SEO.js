import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { getPwaConfig } from '@/lib/pwa'
import { createSiteUrl, normalizeSiteUrl } from '@/lib/sitemap-utils'
import { isHttpLink, loadExternalResource } from '@/lib/utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'

/**
 * 页面的Head头，有用于SEO
 * @param {*} param0
 * @returns
 */
const SEO = props => {
  const { children, siteInfo, post, NOTION_CONFIG } = props
  const PATH = siteConfig('PATH')
  const LINK = normalizeSiteUrl(
    siteConfig('LINK', siteInfo?.link, NOTION_CONFIG)
  )
  const SUB_PATH = siteConfig('SUB_PATH', '')
  let url = PATH?.length ? createSiteUrl(LINK, SUB_PATH) || LINK : LINK
  let image
  const router = useRouter()
  const meta = getSEOMeta(props, router, useGlobal()?.locale)
  const webFontUrl = siteConfig('FONT_URL')
  const webFontUrls = useMemo(
    () =>
      (Array.isArray(webFontUrl) ? webFontUrl : [webFontUrl])
        .filter(value => typeof value === 'string' && value.trim())
        .map(value => value.trim()),
    [webFontUrl]
  )
  const hasGoogleFontsUrl = containsGoogleFontsUrl(webFontUrls)

  useEffect(() => {
    if (webFontUrls.length === 0) return

    let cancelled = false
    let idleId
    let timeoutId
    let loadHandler

    const loadFonts = () => {
      if (cancelled) return
      const load = () => {
        if (cancelled) return
        Promise.allSettled(
          webFontUrls.map(url => loadExternalResource(url, 'css'))
        )
      }

      if (window.requestIdleCallback) {
        idleId = window.requestIdleCallback(load, { timeout: 2000 })
      } else {
        timeoutId = window.setTimeout(load, 1000)
      }
    }

    if (document.readyState === 'complete') {
      loadFonts()
    } else {
      loadHandler = loadFonts
      window.addEventListener('load', loadHandler, { once: true })
    }

    return () => {
      cancelled = true
      if (loadHandler) window.removeEventListener('load', loadHandler)
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }, [webFontUrls])

  // SEO关键词
  const KEYWORDS = siteConfig('KEYWORDS')
  let keywords = meta?.tags || KEYWORDS
  if (post?.tags && post?.tags?.length > 0) {
    keywords = post?.tags?.join(',')
  }
  if (meta) {
    url = createSiteUrl(url, meta.slug) || url
    image = getAbsoluteImageUrl(meta.image || '/bg_image.jpg', LINK)
  }
  const TITLE = siteConfig('TITLE')
  const title = meta?.title || TITLE
  const SITE_NAME = getSiteName(siteInfo, NOTION_CONFIG)
  const description = meta?.description || `${siteInfo?.description}`
  const type = meta?.type === 'Post' ? 'article' : meta?.type || 'website'
  // 订阅文件的绝对地址，与 lib/utils/rss.js 的静态输出路径保持一致
  const rssSubPath = String(SUB_PATH || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')
  const rssUrl = createSiteUrl(
    rssSubPath ? `${LINK}/${rssSubPath}` : LINK,
    'rss/feed.xml'
  )
  const language = router?.locale || siteConfig('LANG', 'zh-CN', NOTION_CONFIG)
  const lang = String(language).replace('-', '_')
  const category = Array.isArray(meta?.category)
    ? meta.category[0]
    : meta?.category || KEYWORDS
  const favicon = siteConfig('BLOG_FAVICON', null, NOTION_CONFIG)
  const BACKGROUND_DARK = siteConfig('BACKGROUND_DARK', '', NOTION_CONFIG)

  const SEO_BAIDU_SITE_VERIFICATION = siteConfig(
    'SEO_BAIDU_SITE_VERIFICATION',
    null,
    NOTION_CONFIG
  )

  const SEO_GOOGLE_SITE_VERIFICATION = siteConfig(
    'SEO_GOOGLE_SITE_VERIFICATION',
    null,
    NOTION_CONFIG
  )

  const pwaEnabled = siteConfig('PWA_ENABLE', false, NOTION_CONFIG)
  const pwaConfig = pwaEnabled
    ? getPwaConfig({ siteInfo, notionConfig: NOTION_CONFIG })
    : null
  const COMMENT_WEBMENTION_ENABLE = siteConfig(
    'COMMENT_WEBMENTION_ENABLE',
    null,
    NOTION_CONFIG
  )

  const COMMENT_WEBMENTION_HOSTNAME = siteConfig(
    'COMMENT_WEBMENTION_HOSTNAME',
    null,
    NOTION_CONFIG
  )
  const COMMENT_WEBMENTION_AUTH = siteConfig(
    'COMMENT_WEBMENTION_AUTH',
    null,
    NOTION_CONFIG
  )
  const ANALYTICS_BUSUANZI_ENABLE = siteConfig(
    'ANALYTICS_BUSUANZI_ENABLE',
    null,
    NOTION_CONFIG
  )

  const FACEBOOK_PAGE = siteConfig('FACEBOOK_PAGE', null, NOTION_CONFIG)
  const TWITTER_SITE = siteConfig('TWITTER_SITE', '', NOTION_CONFIG)
  const TWITTER_CREATOR = siteConfig('TWITTER_CREATOR', '', NOTION_CONFIG)
  const AUTHOR = siteConfig('AUTHOR')
  const ENABLE_RSS = siteConfig('ENABLE_RSS', true, NOTION_CONFIG)

  const ORIGIN = LINK

  const isThin =
    router.isFallback ||
    isThinPageRoute(router.route) ||
    Boolean(meta?.isEmptyShell)
  const robots = isThin
    ? 'noindex, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'

  const absoluteUrl = toAbsolute(url, ORIGIN)
  const canonicalUrl = encodeCanonical(absoluteUrl)

  return (
    <Head>
      <meta charSet='UTF-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <link rel='icon' href={favicon} />
      <link
        rel='apple-touch-icon'
        href={pwaEnabled && pwaConfig ? pwaConfig.icon : favicon}
      />
      <title>{title}</title>
      <meta
        name='theme-color'
        content={
          pwaEnabled && pwaConfig ? pwaConfig.themeColor : BACKGROUND_DARK
        }
      />
      <meta name='robots' content={robots} />
      {robots.startsWith('index') && (
        <link rel='canonical' href={canonicalUrl} />
      )}
      <meta name='format-detection' content='telephone=no' />
      <meta name='mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='default' />
      <meta name='apple-mobile-web-app-title' content={title} />
      {pwaEnabled && (
        <>
          <link rel='manifest' href='/manifest.json' />
          <meta name='application-name' content={pwaConfig?.name} />
        </>
      )}
      {ENABLE_RSS && rssUrl && (
        <link
          rel='alternate'
          type='application/rss+xml'
          title={`${SITE_NAME} RSS`}
          href={rssUrl}
        />
      )}

      {/* 搜索引擎验证 */}
      {SEO_GOOGLE_SITE_VERIFICATION && (
        <meta
          name='google-site-verification'
          content={SEO_GOOGLE_SITE_VERIFICATION}
        />
      )}
      {SEO_BAIDU_SITE_VERIFICATION && (
        <meta
          name='baidu-site-verification'
          content={SEO_BAIDU_SITE_VERIFICATION}
        />
      )}

      {/* 基础SEO元数据 */}
      <meta name='keywords' content={keywords} />
      <meta name='description' content={description?.substring(0, 160)} />
      <meta name='author' content={AUTHOR} />
      <meta name='generator' content='茉灵智库' />

      {/* 语言和地区 */}
      <meta httpEquiv='content-language' content={language} />
      <meta name='geo.region' content={siteConfig('GEO_REGION', 'CN')} />
      <meta name='geo.country' content={siteConfig('GEO_COUNTRY', 'CN')} />
      {/* Open Graph 元数据 */}
      <meta property='og:locale' content={lang} />
      <meta property='og:title' content={title} />
      <meta
        property='og:description'
        content={description?.substring(0, 200)}
      />
      <meta property='og:url' content={canonicalUrl} />
      <meta property='og:image' content={toAbsolute(image, ORIGIN)} />
      <meta
        property='og:image:secure_url'
        content={toAbsolute(image, ORIGIN)}
      />
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:image:alt' content={title} />
      <meta property='og:site_name' content={SITE_NAME} />
      <meta
        property='og:type'
        content={meta?.type === 'Post' ? 'article' : type || 'website'}
      />

      {/* Twitter Card 元数据 */}
      <meta name='twitter:card' content='summary_large_image' />
      {TWITTER_SITE && <meta name='twitter:site' content={TWITTER_SITE} />}
      {TWITTER_CREATOR && (
        <meta name='twitter:creator' content={TWITTER_CREATOR} />
      )}
      <meta name='twitter:title' content={title} />
      <meta
        name='twitter:description'
        content={description?.substring(0, 200)}
      />
      <meta name='twitter:image' content={toAbsolute(image, ORIGIN)} />
      <meta name='twitter:image:alt' content={title} />

      {/* 微信分享优化 */}
      <meta property='weixin:title' content={title} />
      <meta
        property='weixin:description'
        content={description?.substring(0, 160)}
      />
      <meta property='weixin:image' content={toAbsolute(image, ORIGIN)} />

      {COMMENT_WEBMENTION_ENABLE && (
        <>
          <link
            rel='webmention'
            href={`https://webmention.io/${COMMENT_WEBMENTION_HOSTNAME}/webmention`}
          />
          <link
            rel='pingback'
            href={`https://webmention.io/${COMMENT_WEBMENTION_HOSTNAME}/xmlrpc`}
          />
          {COMMENT_WEBMENTION_AUTH && (
            <link href={COMMENT_WEBMENTION_AUTH} rel='me' />
          )}
        </>
      )}

      {ANALYTICS_BUSUANZI_ENABLE && (
        <meta name='referrer' content='no-referrer-when-downgrade' />
      )}
      {/* 文章特定元数据 */}
      {meta?.type === 'Post' && (
        <>
          {(meta.publishTime || meta.publishDay) && (
            <meta
              property='article:published_time'
              content={meta.publishTime || meta.publishDay}
            />
          )}
          {(meta.modifiedTime || meta.lastEditedDay) && (
            <meta
              property='article:modified_time'
              content={meta.modifiedTime || meta.lastEditedDay}
            />
          )}
          <meta
            property='og:updated_time'
            content={
              meta.modifiedTime ||
              meta.lastEditedDay ||
              meta.publishTime ||
              meta.publishDay
            }
          />
          <meta property='article:author' content={AUTHOR} />
          <meta property='article:section' content={category} />
          <meta property='article:tag' content={keywords} />
          {FACEBOOK_PAGE && (
            <meta property='article:publisher' content={FACEBOOK_PAGE} />
          )}
        </>
      )}

      {/* 结构化数据 */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            generateStructuredData(meta, siteInfo, url, image, AUTHOR, LINK, {
              language,
              notionConfig: NOTION_CONFIG,
              siteName: SITE_NAME
            })
          )
        }}
      />

      {/* DNS预取和预连接 */}
      {hasGoogleFontsUrl && (
        <link rel='dns-prefetch' href='//fonts.googleapis.com' />
      )}
      <link rel='dns-prefetch' href='https://www.google-analytics.com' />
      <link rel='dns-prefetch' href='https://www.googletagmanager.com' />
      {hasGoogleFontsUrl && (
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
      )}

      {children}
    </Head>
  )
}

/**
 * 将相对路径转为绝对URL
 */
function toAbsolute(u, origin) {
  if (!u) return ''
  if (!origin) origin = siteConfig('LINK')?.replace(/\/+$/, '')
  if (/^https?:\/\//i.test(u)) return u
  return `${origin}${u.startsWith('/') ? '' : '/'}${u}`
}

/**
 * 对含中文路径的 URL 进行规范化编码
 */
function encodeCanonical(u) {
  try {
    const urlObj = new URL(u)
    urlObj.pathname = urlObj.pathname
      .split('/')
      .map(s => encodeURIComponent(decodeURIComponent(s)))
      .join('/')
    return urlObj.toString()
  } catch {
    return u
  }
}

/**
 * 生成编码后的绝对URL（用于结构化数据，保证与canonical一致）
 */
function absEncoded(u, origin) {
  return encodeCanonical(toAbsolute(u, origin))
}

/**
 * 生成结构化数据
 */
export const generateStructuredData = (
  meta,
  siteInfo,
  url,
  image,
  author,
  siteUrl,
  options = {}
) => {
  const origin = normalizeSiteUrl(siteUrl || siteConfig('LINK'))
  const pageUrl = absEncoded(url || origin, origin)
  const language = options.language || siteConfig('LANG', 'zh-CN')
  const siteName = options.siteName || siteInfo?.title || author
  const pageName = meta?.postTitle || meta?.title || siteInfo?.title || siteName
  const description = (meta?.description || siteInfo?.description)?.substring(
    0,
    160
  )
  const imageUrl = toAbsolute(
    Array.isArray(image) ? image.find(Boolean) : image,
    origin
  )
  const logoUrl = toAbsolute(siteInfo?.icon, origin)
  const organizationId = `${origin}/#organization`
  const authorId = `${origin}/#author`
  const websiteId = `${origin}/#website`
  const webPageId = `${pageUrl}#webpage`
  const breadcrumbId = `${pageUrl}#breadcrumb`
  const sameAs = getSameAsLinks(options.notionConfig)
  const organization = {
    '@type': 'Organization',
    '@id': organizationId,
    name: siteName,
    url: origin,
    ...(logoUrl
      ? {
          logo: {
            '@type': 'ImageObject',
            '@id': `${origin}/#logo`,
            url: logoUrl
          }
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {})
  }
  const person = {
    '@type': 'Person',
    '@id': authorId,
    name: author || siteName,
    url: `${origin}/about`,
    ...(sameAs.length ? { sameAs } : {})
  }
  const website = {
    '@type': 'WebSite',
    '@id': websiteId,
    name: siteName,
    description: siteInfo?.description?.substring(0, 160),
    url: origin,
    inLanguage: language,
    author: { '@id': authorId },
    publisher: { '@id': organizationId },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/search?s={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
  const isCollection = ['category', 'tag', 'archive', 'post-list'].includes(
    meta?.pageType
  )
  const webPage = {
    '@type': isCollection ? 'CollectionPage' : 'WebPage',
    '@id': webPageId,
    name: pageName,
    description,
    url: pageUrl,
    inLanguage: language,
    isPartOf: { '@id': websiteId },
    about: { '@id': organizationId },
    ...(imageUrl
      ? {
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: imageUrl
          }
        }
      : {})
  }
  const graph = [organization, person, website, webPage]

  // encodeCanonical 会给根路径补上尾斜杠，比较前先和 origin 对齐，否则首页也会拿到面包屑
  if (normalizeSiteUrl(pageUrl) !== origin) {
    const breadcrumb = {
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: buildBreadcrumbItems(meta, pageName, pageUrl, origin)
    }
    webPage.breadcrumb = { '@id': breadcrumbId }
    graph.push(breadcrumb)
  }

  if (meta?.type === 'Post') {
    const images = (Array.isArray(image) ? image : [image])
      .map(item => toAbsolute(item, origin))
      .filter(Boolean)
    const datePublished = meta.publishTime || getIsoTime(meta.publishDay)
    const dateModified =
      meta.modifiedTime || getIsoTime(meta.lastEditedDay) || datePublished
    const wordCount = Number(meta.wordCount)
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${pageUrl}#article`,
      headline: pageName?.substring(0, 110),
      description,
      ...(images.length ? { image: images } : {}),
      url: pageUrl,
      mainEntityOfPage: { '@id': webPageId },
      datePublished,
      dateModified,
      author: { '@id': authorId },
      publisher: { '@id': organizationId },
      ...(Array.isArray(meta.tags) && meta.tags.length
        ? { keywords: meta.tags.join(', ') }
        : {}),
      ...(meta.category ? { articleSection: meta.category } : {}),
      ...(Number.isFinite(wordCount) && wordCount > 0 ? { wordCount } : {}),
      // 加密文章正文对爬虫不可见，声明 true 会与实际可访问性不符
      isAccessibleForFree: !meta.isLocked,
      inLanguage: language
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

const buildBreadcrumbItems = (meta, pageName, pageUrl, origin) => [
  {
    '@type': 'ListItem',
    position: 1,
    name: 'Home',
    item: origin
  },
  ...(meta?.type === 'Post' && meta?.category
    ? [
        {
          '@type': 'ListItem',
          position: 2,
          name: meta.category,
          item: `${origin}/category/${encodeURIComponent(meta.category)}`
        }
      ]
    : []),
  {
    '@type': 'ListItem',
    position: meta?.type === 'Post' && meta?.category ? 3 : 2,
    name: meta?.breadcrumbName || pageName,
    item: pageUrl
  }
]

const SOCIAL_PROFILE_KEYS = [
  'CONTACT_GITHUB',
  'CONTACT_TWITTER',
  'CONTACT_LINKEDIN',
  'CONTACT_ORCID',
  'CONTACT_CSDN',
  'CONTACT_JUEJIN',
  'CONTACT_BILIBILI',
  'CONTACT_YOUTUBE',
  'CONTACT_XIAOHONGSHU',
  'CONTACT_WEIBO',
  'CONTACT_INSTAGRAM',
  'CONTACT_TELEGRAM',
  'CONTACT_ZHISHIXINGQIU',
  'CONTACT_WEHCHAT_PUBLIC'
]

const getSameAsLinks = notionConfig =>
  SOCIAL_PROFILE_KEYS.map(key => siteConfig(key, '', notionConfig))
    .filter(value => typeof value === 'string' && /^https?:\/\//i.test(value))
    .filter((value, index, values) => values.indexOf(value) === index)

/**
 * 站点品牌名；组件与 getSEOMeta 共用，避免两处回退顺序不一致
 */
const getSiteName = (siteInfo, notionConfig) =>
  siteConfig('SEO_BRAND', null, notionConfig) ||
  siteConfig('TITLE', null, notionConfig) ||
  siteInfo?.title ||
  ''

export const serializeJsonLd = data =>
  JSON.stringify(data).replace(/</g, '\\u003c')

const containsGoogleFontsUrl = fontUrl => {
  const urls = Array.isArray(fontUrl) ? fontUrl : [fontUrl]

  return urls.filter(Boolean).some(url => {
    try {
      return new URL(url).hostname === 'fonts.googleapis.com'
    } catch {
      return false
    }
  })
}

const getAbsoluteImageUrl = (image, siteUrl) => {
  if (typeof image !== 'string') return ''

  const rawImage = image.trim()
  if (!rawImage) return ''
  if (isHttpLink(rawImage) || rawImage.startsWith('data:')) {
    return rawImage
  }

  return createSiteUrl(siteUrl, rawImage) || rawImage
}

const getIsoTime = value => {
  if (!value) return undefined

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined

  return date.toISOString()
}

const isThinPageRoute = route =>
  route === '/search' ||
  route === '/search/[keyword]' ||
  route === '/search/[keyword]/page/[page]' ||
  route === '/404' ||
  route === '/500' ||
  route === '/auth' ||
  route === '/auth/result'

const getSingleValue = value => {
  if (Array.isArray(value)) return value[0]
  return value
}

const normalizeQueryValue = value => {
  const singleValue = getSingleValue(value)
  if (singleValue === undefined || singleValue === null) return ''
  return String(singleValue).trim()
}

const getSearchKeyword = (props = {}, router = {}) =>
  normalizeQueryValue(
    router?.query?.keyword ?? props?.keyword ?? router?.query?.s
  )

const getSearchPage = (props = {}, router = {}) =>
  normalizeQueryValue(router?.query?.page ?? props?.page)

/**
 * 获取SEO信息
 * @param {*} props
 * @param {*} router
 */
const getSEOMeta = (props, router, locale) => {
  const { post, siteInfo, tag, category, page, NOTION_CONFIG } = props
  const keyword = getSearchKeyword(props, router)
  const searchPage = getSearchPage(props, router)

  // SEO title 后缀使用短品牌名，与 Notion TITLE（可能是长标题）解耦
  const SITE_NAME = getSiteName(siteInfo, NOTION_CONFIG)
  switch (router.route) {
    case '/':
      return {
        title: `${siteInfo?.title}`,
        description: `${siteInfo?.description}`,
        image: `${siteInfo?.pageCover}`,
        slug: '',
        type: 'website'
      }
    case '/archive':
      return {
        title: `${locale.NAV.ARCHIVE} | ${SITE_NAME}`,
        description: `浏览${SITE_NAME}的文章归档，按年份和月份查找已发布文章，回顾不同时间的记录与分享。点击文章标题即可阅读全文，方便找回旧文和继续阅读。`,
        image: `${siteInfo?.pageCover}`,
        slug: 'archive',
        type: 'website',
        pageType: 'archive',
        breadcrumbName: locale.NAV.ARCHIVE
      }
    case '/page/[page]':
      return {
        title: `文章列表第${page}页 | ${SITE_NAME}`,
        description: `${SITE_NAME}的文章列表第${page}页，浏览更多已发布内容`,
        image: `${siteInfo?.pageCover}`,
        slug: 'page/' + page,
        type: 'website',
        pageType: 'post-list',
        breadcrumbName: `第${page}页`
      }
    case '/category/[category]':
      return {
        title: `${category} | ${locale.COMMON.CATEGORY} | ${SITE_NAME}`,
        description: `「${category}」分类下的所有文章 - ${SITE_NAME}`,
        slug: 'category/' + category,
        image: `${siteInfo?.pageCover}`,
        type: 'website',
        pageType: 'category',
        breadcrumbName: category
      }
    case '/category/[category]/page/[page]':
      return {
        title: `${category}第${page}页 | ${locale.COMMON.CATEGORY} | ${SITE_NAME}`,
        description: `「${category}」分类第${page}页 - ${SITE_NAME}`,
        slug: `category/${category}/page/${page}`,
        image: `${siteInfo?.pageCover}`,
        type: 'website',
        pageType: 'category',
        breadcrumbName: `${category}第${page}页`
      }
    case '/tag/[tag]':
      return {
        title: `${tag} | ${locale.COMMON.TAGS} | ${SITE_NAME}`,
        description: `标签「${tag}」下的相关文章 - ${SITE_NAME}`,
        image: `${siteInfo?.pageCover}`,
        slug: 'tag/' + tag,
        type: 'website',
        pageType: 'tag',
        breadcrumbName: tag
      }
    case '/tag/[tag]/page/[page]':
      return {
        title: `${tag}第${page}页 | ${locale.COMMON.TAGS} | ${SITE_NAME}`,
        description: `标签「${tag}」第${page}页 - ${SITE_NAME}`,
        image: `${siteInfo?.pageCover}`,
        slug: `tag/${tag}/page/${page}`,
        type: 'website',
        pageType: 'tag',
        breadcrumbName: `${tag}第${page}页`
      }
    case '/search':
      return {
        title: `${keyword || ''}${keyword ? ' | ' : ''}${locale.NAV.SEARCH} | ${SITE_NAME}`,
        description: `在${SITE_NAME}中搜索内容`,
        image: `${siteInfo?.pageCover}`,
        slug: 'search',
        type: 'website',
        breadcrumbName: locale.NAV.SEARCH
      }
    case '/search/[keyword]':
    case '/search/[keyword]/page/[page]':
      return {
        title: `${keyword || ''}${keyword ? ' | ' : ''}${locale.NAV.SEARCH} | ${SITE_NAME}`,
        description: keyword
          ? `搜索「${keyword}」的结果 - ${SITE_NAME}`
          : `在${SITE_NAME}中搜索内容`,
        image: `${siteInfo?.pageCover}`,
        slug:
          'search/' +
          (keyword || '') +
          (router.route === '/search/[keyword]/page/[page]' && searchPage
            ? `/page/${searchPage}`
            : ''),
        type: 'website',
        breadcrumbName: keyword
          ? `${locale.NAV.SEARCH}: ${keyword}`
          : locale.NAV.SEARCH
      }
    case '/404':
      return {
        title: `${SITE_NAME} | ${locale.NAV.PAGE_NOT_FOUND}`,
        image: `${siteInfo?.pageCover}`
      }
    case '/tag':
      return {
        title: `${locale.COMMON.TAGS} | ${SITE_NAME}`,
        description: `${SITE_NAME}的所有文章标签`,
        image: `${siteInfo?.pageCover}`,
        slug: 'tag',
        type: 'website',
        pageType: 'tag',
        breadcrumbName: locale.COMMON.TAGS
      }
    case '/category':
      return {
        title: `${locale.COMMON.CATEGORY} | ${SITE_NAME}`,
        description: `浏览${SITE_NAME}的文章分类目录，按主题查找感兴趣的内容。选择分类可查看该主题下的文章列表，再进入文章阅读全文，方便集中阅读和发现相关内容。`,
        image: `${siteInfo?.pageCover}`,
        slug: 'category',
        type: 'website',
        pageType: 'category',
        breadcrumbName: locale.COMMON.CATEGORY
      }
    default: {
      const normalizedCategory = Array.isArray(post?.category)
        ? post.category[0]
        : post?.category
      return {
        title: post ? `${post?.title} | ${SITE_NAME}` : SITE_NAME,
        postTitle: post?.title,
        description: post?.summary,
        type: post?.type,
        slug: post?.slug,
        // 落到 default 分支又没有 post 的路由（未配置 Clerk 的 /sign-in、
        // 无同名 Notion 页的 /dashboard）渲染出来是空壳，不能进索引
        isEmptyShell: !post,
        image: post?.pageCoverThumbnail || `${siteInfo?.pageCover}`,
        category: normalizedCategory || '',
        tags: post?.tags,
        wordCount: post?.wordCount,
        isLocked: Boolean(post?.password),
        publishDay: post?.publishDay,
        lastEditedDay: post?.lastEditedDay,
        publishTime:
          getIsoTime(post?.publishDate) || getIsoTime(post?.date?.start_date),
        modifiedTime: getIsoTime(post?.lastEditedTime || post?.lastEditedDate)
      }
    }
  }
}

export default SEO
