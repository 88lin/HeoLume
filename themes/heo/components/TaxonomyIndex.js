import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import { useMemo, useState } from 'react'

const getPostTime = post => {
  const time = new Date(post?.publishDate ?? 0).getTime()
  return Number.isNaN(time) ? 0 : time
}

const formatPostDate = value => {
  const time = new Date(value ?? 0).getTime()
  if (!time || Number.isNaN(time)) return ''
  return formatDateFmt(time, 'MM-dd')
}

const PALETTES = {
  rose: {
    bg: '#ffe4e8',
    fg: '#be123c',
    darkBg: '#a92848',
    darkFg: '#fed1dc',
    darkSel: '#d0385e'
  },
  peony: {
    bg: '#ffe3f1',
    fg: '#be185d',
    darkBg: '#a52766',
    darkFg: '#fdd1e7',
    darkSel: '#cf3180'
  },
  orchid: {
    bg: '#fbe2fe',
    fg: '#a21caf',
    darkBg: '#9626a1',
    darkFg: '#f9d0fd',
    darkSel: '#bc2fc9'
  },
  lilac: {
    bg: '#f4e4ff',
    fg: '#7e22ce',
    darkBg: '#852eba',
    darkFg: '#eed3ff',
    darkSel: '#9e4bd2'
  },
  violet: {
    bg: '#eae2ff',
    fg: '#6d28d9',
    darkBg: '#673ccb',
    darkFg: '#e3d6ff',
    darkSel: '#805dd4'
  },
  iris: {
    bg: '#e2e5ff',
    fg: '#4338ca',
    darkBg: '#4e48cb',
    darkFg: '#dbd9ff',
    darkSel: '#6a65d3'
  },
  azure: {
    bg: '#ddebff',
    fg: '#1d4ed8',
    darkBg: '#2b56b8',
    darkFg: '#cfddfc',
    darkSel: '#426ed3'
  },
  peacock: {
    bg: '#d6f4fd',
    fg: '#0e7490',
    darkBg: '#16627c',
    darkFg: '#c0e3ee',
    darkSel: '#1b7c9c'
  },
  mint: {
    bg: '#d3f8ee',
    fg: '#0f766e',
    darkBg: '#116761',
    darkFg: '#b8e5e2',
    darkSel: '#158079'
  }
}

// Notion 里选的颜色对到上面这套，棕/橙/黄这些不好看的换成同族的莓紫和蓝紫
const NOTION_COLOR_MAP = {
  red: 'rose',
  pink: 'peony',
  brown: 'orchid',
  orange: 'violet',
  yellow: 'iris',
  purple: 'lilac',
  blue: 'azure',
  green: 'mint'
}

// Notion 里不选颜色就都是 gray，全灰一片不好看，按名字轮着上色，相邻两个尽量差开色相
const AUTO_COLORS = [
  'peony',
  'azure',
  'violet',
  'mint',
  'orchid',
  'peacock',
  'rose',
  'iris',
  'lilac'
]

/**
 * 名字定色：同一个分类/标签不管在哪个页面出现，颜色都一样
 */
export function taxonomyPalette(color, name) {
  const mapped = NOTION_COLOR_MAP[color]
  if (mapped) return PALETTES[mapped]
  const text = typeof name === 'string' ? name : ''
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 100000
  }
  return PALETTES[AUTO_COLORS[hash % AUTO_COLORS.length]]
}

/**
 * 把分类/标签和它下面的文章对应起来，一个分类/标签一张卡
 * 组内文章按发布时间倒序，有几篇列几篇，不做截断
 * 排序固定为「篇数多的在前，篇数相同按名称」，保证服务端和浏览器渲染一致
 */
export function buildTaxonomyGroups({ options, posts, kind = 'category' }) {
  const buckets = new Map()
  const sorted = [...(Array.isArray(posts) ? posts : [])].sort(
    (a, b) => getPostTime(b) - getPostTime(a)
  )
  sorted.forEach(post => {
    // 一篇文章只有一个分类，但可以有多个标签
    const names = kind === 'tag' ? post?.tags : [post?.category]
    if (!Array.isArray(names)) return
    names.forEach(name => {
      if (!name || typeof name !== 'string') return
      const bucket = buckets.get(name)
      if (bucket) {
        bucket.push(post)
      } else {
        buckets.set(name, [post])
      }
    })
  })

  return (Array.isArray(options) ? options : [])
    .filter(option => option?.name)
    .map(option => {
      const matched = buckets.get(option.name) || []
      return {
        name: option.name,
        // Notion 统计出来的篇数优先，取不到时退回实际匹配到的数量
        count: option.count > 0 ? option.count : matched.length,
        href: `/${kind}/${encodeURIComponent(option.name)}`,
        posts: matched,
        palette: taxonomyPalette(option.color, option.name)
      }
    })
    .sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-Hans-CN')
    )
}

/**
 * 选中某个分类/标签时只留它一张卡，没选（或者选的那个已经不在了）就是全部
 */
export function selectTaxonomyGroups(groups, name) {
  const list = Array.isArray(groups) ? groups : []
  if (!name) return list
  const picked = list.filter(group => group?.name === name)
  return picked.length > 0 ? picked : list
}

/**
 * 分类 / 标签索引页
 * 顶上把所有分类/标签铺成一排柔色胶囊，点哪个下面就只留哪张卡，再点一次回到全部
 * 一个分类/标签一张独立的卡：卡头是柔色底的名字 + 篇数，卡身两列列出这个分类下的全部文章
 * @param {'category'|'tag'} kind 当前是分类页还是标签页
 */
export default function TaxonomyIndex(props) {
  const { kind = 'category', categoryOptions, tagOptions, allNavPages } = props
  const { locale } = useGlobal()
  const isTag = kind === 'tag'
  // 空串表示「全部」
  const [active, setActive] = useState('')

  const groups = useMemo(
    () =>
      buildTaxonomyGroups({
        options: isTag ? tagOptions : categoryOptions,
        posts: allNavPages,
        kind
      }),
    [isTag, kind, tagOptions, categoryOptions, allNavPages]
  )
  const visibleGroups = useMemo(
    () => selectTaxonomyGroups(groups, active),
    [groups, active]
  )

  const stats = [
    {
      kind: 'category',
      value: categoryOptions?.length ?? 0,
      label: locale.COMMON.CATEGORY,
      href: '/category'
    },
    {
      kind: 'post',
      value: allNavPages?.length ?? 0,
      label: locale.COMMON.POSTS,
      href: '/archive'
    },
    {
      kind: 'tag',
      value: tagOptions?.length ?? 0,
      label: locale.COMMON.TAGS,
      href: '/tag'
    }
  ]

  // 胶囊墙的无障碍名：「分类筛选」/「标签筛选」
  const filterLabel = `${isTag ? locale.COMMON.TAGS : locale.COMMON.CATEGORY}筛选`

  return (
    <>
      {/* 页头：标题 + 三个可点的统计，底下压一条细线把页头和内容分开 */}
      <div className='flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-gray-200 pb-5 dark:border-slate-700/60'>
        <h1 className='text-3xl font-extrabold sm:text-4xl dark:text-gray-200'>
          {isTag ? locale.MENU.TAGS : locale.MENU.CATEGORY}
        </h1>
        {/* 三个统计连成一条，比散开的胶囊整齐 */}
        <div className='inline-flex overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm dark:border-slate-600/70 dark:bg-[#3e434c]'>
          {stats.map((stat, index) => {
            const current = stat.kind === kind
            return (
              <SmartLink
                key={stat.kind}
                href={stat.href}
                aria-current={current ? 'page' : undefined}
                className={`px-3 py-1.5 text-sm transition-colors duration-200 sm:px-4 ${index > 0 ? 'border-l border-gray-200 dark:border-slate-600/70' : ''} ${current ? 'bg-blue-50 text-[color:var(--info-card-primary)] dark:bg-[#2e73c3] dark:text-white' : 'text-gray-600 hover:text-[color:var(--info-card-primary)] dark:text-slate-300 dark:hover:text-white'}`}>
                <span className='font-bold tabular-nums'>{stat.value}</span>{' '}
                {stat.label}
              </SmartLink>
            )
          })}
        </div>
      </div>

      {/* 胶囊墙：一眼看完站里有哪些分类/标签，点一个下面就只留它那张卡。直接铺在页面上，不再套一层卡 */}
      {groups.length > 0 && (
        <div
          role='group'
          aria-label={filterLabel}
          className='mt-6 flex flex-wrap gap-2 sm:gap-2.5'>
          <button
            type='button'
            aria-pressed={!active}
            onClick={() => setActive('')}
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 sm:px-4 sm:py-2 sm:text-base ${!active ? 'bg-[color:var(--info-card-primary)] text-white dark:bg-[#2e73c3] dark:text-white' : 'bg-white text-gray-600 shadow-sm hover:text-[color:var(--info-card-primary)] dark:bg-[#555b68] dark:text-slate-100 dark:hover:text-white'}`}>
            全部
            <span className='tabular-nums opacity-70'>{groups.length}</span>
          </button>
          {groups.map(group => (
            <TaxonomyPill
              key={group.name}
              group={group}
              isTag={isTag}
              active={active === group.name}
              // 点已经选中的那个就回到全部
              onSelect={() =>
                setActive(current => (current === group.name ? '' : group.name))
              }
            />
          ))}
        </div>
      )}

      {/* 一个分类/标签一张卡，卡之间留白分开 */}
      {visibleGroups.length > 0 ? (
        <div className='mt-6 space-y-4'>
          {visibleGroups.map(group => (
            <TaxonomyCard key={group.name} group={group} isTag={isTag} />
          ))}
        </div>
      ) : (
        <div className='mt-6 rounded-3xl border border-dashed border-gray-300 py-12 text-center text-base text-gray-500 sm:py-16 dark:border-slate-600 dark:text-slate-400'>
          还没有内容
        </div>
      )}
    </>
  )
}

/**
 * 一颗胶囊：柔色底 + 同族深色字
 * 选中时亮色反过来用深底白字；暗色不反色，只把同色相点亮一档再配白字，晚上看不晃眼
 * 配色同样走内联 CSS 变量，Tailwind 只认这几个固定类名
 */
function TaxonomyPill({ group, isTag, active, onSelect }) {
  const { bg, fg, darkBg, darkFg, darkSel } = group.palette
  return (
    <button
      type='button'
      aria-pressed={active}
      onClick={onSelect}
      title={group.name}
      style={{
        '--tx-bg': bg,
        '--tx-fg': fg,
        '--tx-bg-dark': darkBg,
        '--tx-fg-dark': darkFg,
        '--tx-sel-dark': darkSel
      }}
      className={`inline-flex max-w-[13rem] items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 sm:max-w-[16rem] sm:px-4 sm:py-2 sm:text-base ${active ? 'bg-[color:var(--tx-fg)] text-white dark:bg-[color:var(--tx-sel-dark)] dark:text-white' : 'bg-[color:var(--tx-bg)] text-[color:var(--tx-fg)] dark:bg-[color:var(--tx-bg-dark)] dark:text-[color:var(--tx-fg-dark)]'}`}>
      <span className='truncate'>{isTag ? `#${group.name}` : group.name}</span>
      <span className='shrink-0 tabular-nums opacity-70'>{group.count}</span>
    </button>
  )
}

/**
 * 一张卡：卡头是柔色底 + 同族深色字的名字和篇数，整条可点，进这个分类/标签的列表页
 * 卡身把这个分类/标签下的文章列全，一行一篇，窄屏一列、中屏往上两列
 * 配色走内联 CSS 变量，Tailwind 只认这几个固定类名，不用为每种颜色各生成一遍
 */
function TaxonomyCard({ group, isTag }) {
  const { bg, fg, darkBg, darkFg } = group.palette
  return (
    <section
      style={{
        '--tx-bg': bg,
        '--tx-fg': fg,
        '--tx-bg-dark': darkBg,
        '--tx-fg-dark': darkFg
      }}
      className='overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-700/70 dark:bg-[#1e1e1e]'>
      <SmartLink
        href={group.href}
        title={group.name}
        className='flex items-center gap-3 bg-[color:var(--tx-bg)] px-4 py-3 text-[color:var(--tx-fg)] sm:gap-4 sm:px-5 sm:py-3.5 dark:bg-[color:var(--tx-bg-dark)] dark:text-[color:var(--tx-fg-dark)]'>
        <h2 className='min-w-0 flex-1 truncate text-lg font-bold sm:text-xl'>
          {isTag ? `#${group.name}` : group.name}
        </h2>
        {/* 篇数跟在名字后面，自己撑开宽度，不会被裁 */}
        <span className='shrink-0 whitespace-nowrap text-sm font-bold tabular-nums sm:text-base'>
          {group.count} 篇
        </span>
      </SmartLink>

      {group.posts.length > 0 && (
        <div className='grid gap-x-8 px-2 py-2.5 sm:px-3 sm:py-3 md:grid-cols-2'>
          {group.posts.map(post => (
            <SmartLink
              key={post.short_id || post.href}
              href={post.href}
              title={post.title}
              className='group/row flex items-start gap-3 rounded-xl px-2.5 py-2 transition-colors duration-200 hover:bg-[color:var(--tx-bg)] sm:items-center sm:px-3 dark:hover:bg-[color:var(--tx-bg-dark)]'>
              {/* 小圆点只是分行用，读屏不用念 */}
              <span
                aria-hidden='true'
                className='mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300 transition-colors duration-200 group-hover/row:bg-[color:var(--tx-fg)] sm:mt-0 dark:bg-slate-500 dark:group-hover/row:bg-[color:var(--tx-fg-dark)]'
              />
              {/* 窄屏标题最多两行、日期落到下一行；宽屏还是一行截断、日期靠右 */}
              <span className='flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3'>
                <span className='line-clamp-2 min-w-0 flex-1 text-base leading-snug text-gray-700 sm:line-clamp-none sm:truncate dark:text-slate-200'>
                  {post.title}
                </span>
                <span className='shrink-0 text-sm tabular-nums text-gray-500 dark:text-slate-400'>
                  {formatPostDate(post.publishDate)}
                </span>
              </span>
            </SmartLink>
          ))}
        </div>
      )}
    </section>
  )
}
