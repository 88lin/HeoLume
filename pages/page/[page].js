import { getPublicPostBlockMap } from '@/lib/utils/publicPost'
import BLOG from '@/blog.config'
import { isExport } from '@/lib/utils/buildMode'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData, getPostBlocks } from '@/lib/db/SiteDataApi'
import { formatNotionBlock } from '@/lib/db/notion/getPostBlocks'
import { adapterNotionBlockMap } from '@/lib/utils/notion.util'
import { DynamicLayout } from '@/themes/theme'

/**
 * 文章列表分页
 * @param {*} props
 * @returns
 */
const Page = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutPostList' {...props} />
}

export async function getStaticPaths({ locale }) {
  const from = 'page-paths'
  const { postCount, NOTION_CONFIG } = await fetchGlobalAllData({
    from,
    locale
  })
  const totalPages = Math.ceil(
    postCount / siteConfig('POSTS_PER_PAGE', null, NOTION_CONFIG)
  )
  return {
    // remove first page, we 're not gonna handle that.
    paths: Array.from({ length: totalPages - 1 }, (_, i) => ({
      params: { page: '' + (i + 2) }
    })),
    fallback: isExport() ? false : 'blocking'
  }
}

export async function getStaticProps({ params: { page }, locale }) {
  const pageNumber = Number(page)
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    return { notFound: true }
  }
  if (pageNumber === 1) {
    return { redirect: { destination: '/', permanent: true } }
  }

  const from = `page-${page}`
  const props = await fetchGlobalAllData({ from, locale })
  const { allPages } = props
  const POST_PREVIEW_LINES = siteConfig(
    'POST_PREVIEW_LINES',
    12,
    props?.NOTION_CONFIG
  )

  const allPosts = (allPages ?? []).filter(
    page => page.type === 'Post' && page.status === 'Published'
  )
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
  // 越界页也要带上 revalidate，否则 ISR 会把 404 缓存到下次部署，新文章撑出的页码永远打不开
  const revalidate = process.env.EXPORT
    ? undefined
    : siteConfig(
        'NEXT_REVALIDATE_SECOND',
        BLOG.NEXT_REVALIDATE_SECOND,
        props.NOTION_CONFIG
      )
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)
  if (pageNumber > totalPages) {
    return { notFound: true, revalidate }
  }
  // 处理分页
  props.posts = allPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  props.page = pageNumber

  // 处理预览
  if (siteConfig('POST_LIST_PREVIEW', false, props?.NOTION_CONFIG)) {
    for (const i in props.posts) {
      const post = props.posts[i]
      if (post.password && post.password !== '') {
        continue
      }
      const rawBlockMap = await getPostBlocks(post.id, 'slug', POST_PREVIEW_LINES)
      post.blockMap = getPublicPostBlockMap(
        post,
        adapterNotionBlockMap(rawBlockMap),
        props.allPages
      )
      if (post.blockMap?.block) {
        post.blockMap.block = formatNotionBlock(post.blockMap.block)
      }
    }
  }

  delete props.allPages
  return {
    props,
    revalidate
  }
}

export default Page
