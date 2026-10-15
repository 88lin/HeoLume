import { getStaticProps as search } from '@/pages/search/[keyword]'
import { getStaticProps as searchPage } from '@/pages/search/[keyword]/page/[page]'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { getDataFromCache } from '@/lib/cache/cache_manager'

jest.mock('@/lib/config', () => ({
  siteConfig: (key, fallback) => (key === 'POSTS_PER_PAGE' ? 2 : fallback)
}))
jest.mock('@/lib/db/SiteDataApi', () => ({ fetchGlobalAllData: jest.fn() }))
jest.mock('@/lib/cache/cache_manager', () => ({ getDataFromCache: jest.fn() }))
jest.mock('@/lib/db/notion/getPostBlocks', () => ({
  getPageBlockCacheKey: id => id
}))
jest.mock('@/themes/theme', () => ({ DynamicLayout: () => null }))

const posts = [1, 2, 3].map(id => ({
  id: `post-${id}`,
  title: `Article ${id}`,
  type: 'Post',
  status: 'Published'
}))
let cachedBlocks

beforeEach(() => {
  fetchGlobalAllData.mockResolvedValue({
    NOTION_CONFIG: {},
    allPages: [
      ...posts,
      {
        id: 'private',
        type: 'Page',
        status: 'Invisible',
        password: 'protected'
      }
    ]
  })
  cachedBlocks = Object.fromEntries(
    posts.map(post => [
      post.id,
      {
        block: {
          [post.id]: {
            value: { type: 'page', content: ['public-text', 'private'] }
          },
          'public-text': {
            value: {
              type: 'text',
              parent_id: post.id,
              properties: { title: [['Public search content']] }
            }
          },
          private: {
            value: { type: 'page', parent_id: post.id, content: ['secret'] }
          },
          secret: {
            value: {
              type: 'text',
              parent_id: 'private',
              properties: { title: [['PRIVATE_SEARCH_MARKER']] }
            }
          }
        }
      }
    ])
  )
  getDataFromCache.mockImplementation(id => Promise.resolve(cachedBlocks[id]))
})

describe.each([
  ['first page', search, {}],
  ['second page', searchPage, { page: '2' }]
])('%s', (_name, getProps, params) => {
  it('searches public content from the current nested Notion cache format', async () => {
    for (const recordMap of Object.values(cachedBlocks)) {
      recordMap.block = Object.fromEntries(
        Object.entries(recordMap.block).map(([id, entry]) => [
          id,
          { value: { role: 'reader', value: { id, ...entry.value } } }
        ])
      )
    }
    const { props } = await getProps({
      params: { ...params, keyword: 'PUBLIC SEARCH' }
    })
    expect(props?.postCount).toBe(3)
    expect(JSON.stringify(props)).not.toContain('PRIVATE_SEARCH_MARKER')
  })

  it('does not match text inside a protected Page, including unlisted pages', async () => {
    const result = await getProps({
      params: { ...params, keyword: 'PRIVATE_SEARCH_MARKER' }
    })
    expect(result.notFound || result.props.postCount === 0).toBe(true)
    expect(result.props?.posts || []).toEqual([])
  })

  it('keeps case-insensitive public search and pagination without leaking snippets or mutating cache', async () => {
    const { props } = await getProps({
      params: { ...params, keyword: 'PUBLIC SEARCH' }
    })
    expect(props.postCount).toBe(3)
    expect(props.posts.map(post => post.id)).toEqual(
      params.page ? ['post-3'] : ['post-1', 'post-2']
    )
    expect(JSON.stringify(props)).not.toContain('PRIVATE_SEARCH_MARKER')
    expect(JSON.stringify(cachedBlocks)).toContain('PRIVATE_SEARCH_MARKER')
    expect(props.allPages).toBeUndefined()
  })
})
