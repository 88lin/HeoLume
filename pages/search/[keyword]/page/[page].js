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
  const { keyword } = props
  props = { ...props, currentSearch: keyword }

  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutSearch' {...props} />
}

/**
 * 服务端搜索
 * @param {*} param0
 * @returns
 */
export async function getStaticProps({ params: { keyword, page }, locale }) {
  const pageNumber = Number(page)
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return { notFound: true }
  }
  if (pageNumber === 1) {
    return {
      redirect: {
        destination: `/search/${encodeURIComponent(keyword)}`,
        permanent: true
      }
    }
  }

  const props = await fetchGlobalAllData({
    from: 'search-props',
    pageType: ['Post'],
    locale
  })
  const { allPages } = props
  const allPosts = allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  ) || []
  props.posts = await filterByMemCache(allPosts, keyword, allPages)
  props.postCount = props.posts.length
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
  const revalidate = isExport()
    ? undefined
    : siteConfig(
        'NEXT_REVALIDATE_SECOND',
        BLOG.NEXT_REVALIDATE_SECOND,
        props.NOTION_CONFIG
      )
  // 越界页允许 ISR 重试，新增搜索结果后可以重新生成。
  if (pageNumber > Math.ceil(props.postCount / POSTS_PER_PAGE)) {
    return { notFound: true, revalidate }
  }
  // 处理分页
  props.posts = props.posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  props.keyword = keyword
  props.page = pageNumber
  delete props.allPages
  return {
    props,
    revalidate
  }
}

export function getStaticPaths() {
  return {
    // 第 1 页由平台重定向；静态导出不生成重复 HTML。
    paths: [],
    fallback: isExport() ? false : 'blocking'
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
