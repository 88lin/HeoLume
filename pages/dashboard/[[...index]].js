import BLOG from '@/blog.config'
import { isExport } from '@/lib/utils/buildMode'
import { siteConfig } from '@/lib/config'
import { resolvePostProps } from '@/lib/db/SiteDataApi'
import { DynamicLayout } from '@/themes/theme'
import PropTypes from 'prop-types'

/**
 * 根据notion的slug访问页面
 * 只解析一级目录例如 /about
 * @param {*} props
 * @returns
 */
const Dashboard = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props?.NOTION_CONFIG)

  Dashboard.propTypes = {
    NOTION_CONFIG: PropTypes.object
  }
  return <DynamicLayout theme={theme} layoutName='LayoutDashboard' {...props} />
}

export async function getStaticProps({ locale, revalidateReason }) {
  const prefix = 'dashboard'
  const props = await resolvePostProps({
    prefix,
    locale,
    revalidateReason,
  })
  const revalidate = process.env.EXPORT
    ? undefined
    : siteConfig(
      'NEXT_REVALIDATE_SECOND',
      BLOG.NEXT_REVALIDATE_SECOND,
      props.NOTION_CONFIG
    )

  // 既没有 Clerk 也没有同名 Notion 页时渲染出来是空壳；带 revalidate 是为了
  // 之后新建 slug 为 dashboard 的页面时这个 404 能自己过期
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !props.post) {
    return { notFound: true, revalidate }
  }

  return {
    props,
    revalidate
  }
}

export const getStaticPaths = () => {
  return {
    paths: [
      { params: { index: [] } }, // 对应首页路径
      { params: { index: ['membership'] } },
      { params: { index: ['balance'] } },
      { params: { index: ['user-profile'] } },
      { params: { index: ['user-profile', 'security'] } }, // 嵌套路由，按结构传递
      { params: { index: ['order'] } },
      { params: { index: ['affiliate'] } }
    ],
    fallback: isExport() ? false : 'blocking'
  }
}

export default Dashboard
