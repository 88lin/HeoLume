import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

// 随机漫步的已读记录，只在当前标签页有效，关掉标签页即重置
const VISITED_KEY = 'heo-random-visited'

const readVisited = () => {
  try {
    const list = JSON.parse(window.sessionStorage.getItem(VISITED_KEY))
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

const writeVisited = list => {
  try {
    window.sessionStorage.setItem(VISITED_KEY, JSON.stringify(list))
  } catch {
    // 无痕模式下 sessionStorage 可能不可写，忽略
  }
}

/**
 * 挑出可以随机跳转的文章：跳过当前这篇和读过的
 * 全站读完时返回 reset，由调用方清空已读记录重新开始，否则按钮会彻底点不动
 */
export function selectRandomPool({ posts, visited, currentHref }) {
  const skip = new Set(Array.isArray(visited) ? visited : [])
  if (currentHref) {
    skip.add(currentHref)
  }
  const unread = posts.filter(item => !skip.has(item.href))
  if (unread.length > 0) {
    return { pool: unread, reset: false }
  }
  return { pool: posts.filter(item => item.href !== currentHref), reset: true }
}

/**
 * 随机跳转到一个文章（从全部已发布文章中抽取，跳过当前这篇和读过的）
 */
export default function RandomPostButton(props) {
  const { allNavPages, post } = props
  const router = useRouter()
  const { locale } = useGlobal()
  const posts = Array.isArray(allNavPages)
    ? allNavPages.filter(item => item?.href)
    : []
  const currentHref = post?.href

  // 每打开一篇文章就记一笔，随机时避开
  useEffect(() => {
    if (!currentHref) return
    const visited = readVisited()
    if (!visited.includes(currentHref)) {
      writeVisited(visited.concat(currentHref))
    }
  }, [currentHref])

  /**
   * 随机跳转文章
   */
  function handleClick() {
    if (posts.length === 0) return

    const { pool, reset } = selectRandomPool({
      posts,
      visited: readVisited(),
      currentHref
    })
    if (reset) {
      writeVisited(currentHref ? [currentHref] : [])
    }
    if (pool.length === 0) return

    router.push(pool[Math.floor(Math.random() * pool.length)].href)
  }

  if (posts.length === 0) {
    return null
  }

  return (
        <div title={locale.MENU.WALK_AROUND} className='cursor-pointer hover:bg-[rgba(139,92,246,0.12)] dark:hover:bg-[rgba(139,92,246,0.2)] rounded-full w-10 h-10 flex justify-center items-center duration-200 transition-all' onClick={handleClick}>
            <i className="fa-solid fa-podcast"></i>
        </div>
  )
}
