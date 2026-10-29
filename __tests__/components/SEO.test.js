import { render } from '@testing-library/react'
import SEO, { generateStructuredData, serializeJsonLd } from '@/components/SEO'

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn()
}))

jest.mock('@/lib/global', () => ({
  useGlobal: () => ({
    locale: {
      NAV: {
        ARCHIVE: 'Archive',
        SEARCH: 'Search',
        PAGE_NOT_FOUND: 'Not Found'
      },
      COMMON: { CATEGORY: 'Category', TAGS: 'Tags' }
    }
  })
}))

const { siteConfig } = require('@/lib/config')

const baseSiteConfig = {
  AUTHOR: 'Example Author',
  BACKGROUND_DARK: '#ffffff',
  BLOG_FAVICON: '/favicon.ico',
  ENABLE_RSS: true,
  FONT_URL: '',
  KEYWORDS: 'notion,next',
  LANG: 'en-US',
  LINK: 'https://example.com',
  PATH: '',
  SUB_PATH: '',
  TITLE: 'Example Blog'
}

const renderSeo = fontUrl => {
  siteConfig.mockImplementation((key, defaultVal) => {
    if (key === 'FONT_URL') return fontUrl
    return Object.prototype.hasOwnProperty.call(baseSiteConfig, key)
      ? baseSiteConfig[key]
      : defaultVal
  })

  return render(
    <SEO
      siteInfo={{
        title: 'Example Blog',
        description: 'Example description',
        icon: '/logo.png',
        pageCover: '/cover.png',
        link: 'https://example.com'
      }}
    />
  )
}

describe('SEO structured data', () => {
  const siteInfo = {
    title: 'Example Blog',
    description: 'Example description',
    icon: '/logo.png'
  }

  it('generates BlogPosting data for published articles', () => {
    const data = generateStructuredData(
      {
        type: 'Post',
        title: 'Structured data in NotionNext',
        description: 'A test article',
        publishTime: '2026-07-01T00:00:00.000Z',
        modifiedTime: '2026-07-02T00:00:00.000Z',
        tags: ['notion', 'seo'],
        category: 'Engineering'
      },
      siteInfo,
      'https://example.com/article/structured-data',
      'https://example.com/cover.png',
      'Example Author',
      'https://example.com'
    )
    const blogPosting = data['@graph'].find(
      item => item['@type'] === 'BlogPosting'
    )

    expect(blogPosting).toMatchObject({
      '@type': 'BlogPosting',
      '@id': 'https://example.com/article/structured-data#article',
      headline: 'Structured data in NotionNext',
      url: 'https://example.com/article/structured-data',
      datePublished: '2026-07-01T00:00:00.000Z',
      dateModified: '2026-07-02T00:00:00.000Z',
      keywords: 'notion, seo',
      articleSection: 'Engineering',
      mainEntityOfPage: {
        '@id': 'https://example.com/article/structured-data#webpage'
      }
    })
    expect(blogPosting.publisher).toEqual({
      '@id': 'https://example.com/#organization'
    })
    expect(
      data['@graph'].find(item => item['@type'] === 'Organization').logo.url
    ).toBe('https://example.com/logo.png')
    expect(
      data['@graph'].find(item => item['@type'] === 'BreadcrumbList')
        .itemListElement
    ).toHaveLength(3)
  })

  it('connects non-article pages to the site entities', () => {
    const data = generateStructuredData(
      { type: 'Page', title: 'About' },
      siteInfo,
      'https://example.com/about',
      'https://example.com/cover.png',
      'Example Author',
      'https://example.com',
      { language: 'en-US', siteName: 'Example Blog' }
    )
    const website = data['@graph'].find(item => item['@type'] === 'WebSite')
    const webPage = data['@graph'].find(item => item['@type'] === 'WebPage')

    expect(data['@context']).toBe('https://schema.org')
    expect(website).toMatchObject({
      '@id': 'https://example.com/#website',
      name: 'Example Blog',
      url: 'https://example.com',
      inLanguage: 'en-US'
    })
    expect(webPage).toMatchObject({
      '@id': 'https://example.com/about#webpage',
      name: 'About',
      url: 'https://example.com/about',
      isPartOf: { '@id': 'https://example.com/#website' }
    })
  })

  it('omits the breadcrumb on the home page', () => {
    const data = generateStructuredData(
      { type: 'website', title: 'Example Blog', slug: '' },
      siteInfo,
      'https://example.com',
      '',
      'Example Author',
      'https://example.com'
    )

    expect(
      data['@graph'].find(item => item['@type'] === 'BreadcrumbList')
    ).toBeUndefined()
    expect(
      data['@graph'].find(item => item['@type'] === 'WebPage').breadcrumb
    ).toBeUndefined()
  })

  it('uses clean breadcrumb names on collection pages', () => {
    const data = generateStructuredData(
      {
        type: 'website',
        pageType: 'category',
        title: '技术教程第2页 | Category | Example Blog',
        breadcrumbName: '技术教程第2页'
      },
      siteInfo,
      'https://example.com/category/tech/page/2',
      '',
      'Example Author',
      'https://example.com'
    )
    const breadcrumb = data['@graph'].find(
      item => item['@type'] === 'BreadcrumbList'
    )

    expect(breadcrumb.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://example.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '技术教程第2页',
        item: 'https://example.com/category/tech/page/2'
      }
    ])
  })

  it('points the author entity at the about page', () => {
    const data = generateStructuredData(
      { type: 'Page', title: 'About' },
      siteInfo,
      'https://example.com/about',
      '',
      'Example Author',
      'https://example.com'
    )

    expect(
      data['@graph'].find(item => item['@type'] === 'Person')
    ).toMatchObject({
      '@id': 'https://example.com/#author',
      name: 'Example Author',
      url: 'https://example.com/about'
    })
  })

  it('marks password-protected posts as not freely accessible', () => {
    const buildPost = isLocked =>
      generateStructuredData(
        {
          type: 'Post',
          title: 'Gated post',
          isLocked
        },
        siteInfo,
        'https://example.com/article/gated',
        '',
        'Example Author',
        'https://example.com'
      )['@graph'].find(item => item['@type'] === 'BlogPosting')

    expect(buildPost(false).isAccessibleForFree).toBe(true)
    expect(buildPost(true).isAccessibleForFree).toBe(false)
  })

  it('serializes script-closing text without creating an executable tag', () => {
    const serialized = serializeJsonLd({
      headline: '</script><script>alert(1)</script>'
    })

    expect(serialized).not.toContain('</script>')
    expect(JSON.parse(serialized)).toEqual({
      headline: '</script><script>alert(1)</script>'
    })
  })

  it('adds configured social profiles as sameAs entity links', () => {
    siteConfig.mockImplementation((key, defaultVal) => {
      if (key === 'CONTACT_GITHUB') return 'https://github.com/example'
      if (key === 'CONTACT_WEHCHAT_PUBLIC') {
        return 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=Example=='
      }
      return defaultVal
    })
    const data = generateStructuredData(
      { type: 'Page', title: 'About' },
      siteInfo,
      'https://example.com/about',
      '',
      'Example Author',
      'https://example.com'
    )

    expect(
      data['@graph'].find(item => item['@type'] === 'Person').sameAs
    ).toEqual([
      'https://github.com/example',
      'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=Example=='
    ])
  })
})

describe('SEO RSS discovery', () => {
  it('exposes an RSS alternate link for readers and browsers', () => {
    const { container } = renderSeo('')
    const rssLink = container.querySelector(
      'link[rel="alternate"][type="application/rss+xml"]'
    )

    expect(rssLink).toBeInTheDocument()
    expect(rssLink.getAttribute('href')).toBe(
      'https://example.com/rss/feed.xml'
    )
    expect(container.querySelectorAll('link[type="application/rss+xml"]')).toHaveLength(1)
    expect(rssLink.getAttribute('title')).toBe('Example Blog RSS')
  })

  it('uses the deployment subpath without duplicating the RSS declaration', () => {
    siteConfig.mockImplementation((key, defaultVal) => {
      if (key === 'SUB_PATH') return '/blog/'
      return Object.prototype.hasOwnProperty.call(baseSiteConfig, key)
        ? baseSiteConfig[key]
        : defaultVal
    })

    const { container } = render(
      <SEO siteInfo={{ title: 'Example Blog', link: 'https://example.com' }} />
    )
    const rssLinks = container.querySelectorAll('link[type="application/rss+xml"]')

    expect(rssLinks).toHaveLength(1)
    expect(rssLinks[0].getAttribute('href')).toBe('https://example.com/blog/rss/feed.xml')
  })

  it('omits the alternate link when RSS is disabled', () => {
    siteConfig.mockImplementation((key, defaultVal) => {
      if (key === 'ENABLE_RSS') return false
      return Object.prototype.hasOwnProperty.call(baseSiteConfig, key)
        ? baseSiteConfig[key]
        : defaultVal
    })

    const { container } = render(
      <SEO
        siteInfo={{
          title: 'Example Blog',
          description: 'Example description',
          link: 'https://example.com'
        }}
      />
    )

    expect(
      container.querySelector('link[type="application/rss+xml"]')
    ).not.toBeInTheDocument()
  })
})

describe('SEO font resource hints', () => {
  it('omits Google Fonts hints for non-Google font URLs', () => {
    const { container } = renderSeo(
      'https://npm.elemecdn.com/lxgw-wenkai-webfont@1.6.0/style.css'
    )

    expect(
      container.querySelector('link[href="//fonts.googleapis.com"]')
    ).not.toBeInTheDocument()
    expect(
      container.querySelector('link[href="https://fonts.gstatic.com"]')
    ).not.toBeInTheDocument()
  })

  it('emits Google Fonts hints for Google font URLs', () => {
    const { container } = renderSeo([
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'
    ])

    expect(
      container.querySelector('link[href="//fonts.googleapis.com"]')
    ).toBeInTheDocument()
    expect(
      container.querySelector('link[href="https://fonts.gstatic.com"]')
    ).toBeInTheDocument()
  })
})

describe('font config defaults', () => {
  const originalFontUrl = process.env.NEXT_PUBLIC_FONT_URL

  afterEach(() => {
    jest.resetModules()
    if (originalFontUrl === undefined) {
      delete process.env.NEXT_PUBLIC_FONT_URL
    } else {
      process.env.NEXT_PUBLIC_FONT_URL = originalFontUrl
    }
  })

  it('does not load large Chinese Google Fonts by default', () => {
    delete process.env.NEXT_PUBLIC_FONT_URL
    jest.resetModules()

    const fontConfig = require('@/conf/font.config')
    const defaultFontUrls = Array.isArray(fontConfig.FONT_URL)
      ? fontConfig.FONT_URL
      : [fontConfig.FONT_URL]

    expect(defaultFontUrls).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining('Noto+Sans+SC'),
        expect.stringContaining('Noto+Serif+SC')
      ])
    )
  })

  it('keeps NEXT_PUBLIC_FONT_URL opt-in support', () => {
    process.env.NEXT_PUBLIC_FONT_URL =
      'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400&display=swap'
    jest.resetModules()

    const fontConfig = require('@/conf/font.config')

    expect(fontConfig.FONT_URL).toBe(process.env.NEXT_PUBLIC_FONT_URL)
  })
})
