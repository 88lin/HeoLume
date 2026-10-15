import { getPublicPostBlockMap } from '@/lib/utils/publicPost'
import BLOG from '@/blog.config'
import { isExport } from '@/lib/utils/buildMode'
import { getDataFromCache } from '@/lib/cache/cache_manager'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { buildPostSearchResult } from '@/lib/utils/search'
import { adapterNotionBlockMap } from '@/lib/utils/notion.util'
import { DynamicLayout } from '@/themes/theme'
import { getPageBlockCacheKey } from '@/lib/db/notion/getPostBlocks'

const Index = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutSearch' {...props} />
}

/**
 * 服务端搜索
 * @param {*} param0
 * @returns
 */
export async function getStaticProps({ params: { keyword }, locale }) {
  const props = await fetchGlobalAllData({
    from: 'search-props',
    locale
  })
  const { allPages } = props
  const allPosts = allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  ) || []
  props.posts = await filterByMemCache(allPosts, keyword, allPages)
  props.postCount = props.posts.length
  const POST_LIST_STYLE = siteConfig(
    'POST_LIST_STYLE',
    'Page',
    props?.NOTION_CONFIG
  )
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)

  // 处理分页
  if (POST_LIST_STYLE === 'scroll') {
    // 滚动列表默认给前端返回所有数据
  } else if (POST_LIST_STYLE) {
    props.posts = props.posts?.slice(0, POSTS_PER_PAGE)
  }
  props.keyword = keyword
  delete props.allPages
  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export function getStaticPaths() {
  return {
    paths: [{ params: { keyword: 'NotionNext' } }],
    fallback: isExport() ? false : true
  }
}

/**
 * 在内存缓存中进行全文索引
 * @param {*} allPosts
 * @param keyword 关键词
 * @returns
 */
async function filterByMemCache(allPosts, keyword, allPages) {
  const filterPosts = []
  for (const post of allPosts) {
    const cacheKey = getPageBlockCacheKey(post.id, post.lastEditedDate)
    const page = getPublicPostBlockMap(
      post,
      adapterNotionBlockMap(await getDataFromCache(cacheKey, true)),
      allPages
    )
    const resultPost = buildPostSearchResult(post, page, keyword)
    if (resultPost) {
      filterPosts.push(resultPost)
    }
  }
  return filterPosts
}

export default Index
