import { fireEvent, render, screen } from '@testing-library/react'
import TaxonomyIndex, {
  buildTaxonomyGroups,
  selectTaxonomyGroups,
  taxonomyPalette
} from '@/themes/heo/components/TaxonomyIndex'

jest.mock('@/components/SmartLink', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

jest.mock('@/lib/global', () => {
  const zh = require('@/lib/lang/zh-CN')
  return { useGlobal: () => ({ locale: zh.default || zh }) }
})

// 固定在正午，避免测试机时区把日期推到前后一天
const at = (month, day) => Date.UTC(2026, month - 1, day, 12)

const posts = [
  {
    short_id: 'p1',
    title: 'Notion 入门',
    href: '/article/notion',
    category: '技术教程',
    tags: ['工具', '教程'],
    publishDate: at(8, 1)
  },
  {
    short_id: 'p2',
    title: 'Windows 优化',
    href: '/article/windows',
    category: '技术教程',
    tags: ['工具'],
    publishDate: at(8, 20)
  },
  {
    short_id: 'p3',
    title: '随手记',
    href: '/article/note',
    category: '碎片杂文',
    tags: ['随笔'],
    publishDate: at(7, 5)
  }
]

const categoryOptions = [
  { name: '碎片杂文', count: 1 },
  { name: '技术教程', count: 2 }
]

const tagOptions = [
  { name: '工具', count: 2 },
  { name: '教程', count: 1 },
  { name: '随笔', count: 1 }
]

describe('heo TaxonomyIndex 数据整理', () => {
  it('分类按篇数倒序，组内文章按发布时间倒序', () => {
    const groups = buildTaxonomyGroups({
      options: categoryOptions,
      posts,
      kind: 'category'
    })

    expect(groups.map(group => group.name)).toEqual(['技术教程', '碎片杂文'])
    expect(groups[0].count).toBe(2)
    expect(groups[0].posts.map(post => post.title)).toEqual([
      'Windows 优化',
      'Notion 入门'
    ])
    expect(groups[0].href).toBe(
      '/category/%E6%8A%80%E6%9C%AF%E6%95%99%E7%A8%8B'
    )
  })

  it('一篇文章有多个标签时，每个标签下都能看到它', () => {
    const groups = buildTaxonomyGroups({
      options: tagOptions,
      posts,
      kind: 'tag'
    })

    expect(groups.map(group => group.name)).toEqual(['工具', '教程', '随笔'])
    expect(groups[0].posts.map(post => post.title)).toEqual([
      'Windows 优化',
      'Notion 入门'
    ])
    expect(groups[1].posts.map(post => post.title)).toEqual(['Notion 入门'])
  })

  it('有几篇列几篇，不做截断', () => {
    const many = Array.from({ length: 9 }, (_, i) => ({
      short_id: `m${i}`,
      title: `文章 ${i}`,
      href: `/article/m${i}`,
      category: '技术教程',
      publishDate: at(8, i + 1)
    }))
    const groups = buildTaxonomyGroups({
      options: [{ name: '技术教程', count: 9 }],
      posts: many,
      kind: 'category'
    })

    expect(groups[0].posts).toHaveLength(9)
    expect(groups[0].posts[0].title).toBe('文章 8')
  })

  it('Notion 没给篇数时，用实际匹配到的文章数', () => {
    const groups = buildTaxonomyGroups({
      options: [{ name: '技术教程' }, { name: '碎片杂文', count: 0 }],
      posts,
      kind: 'category'
    })

    expect(groups.map(group => [group.name, group.count])).toEqual([
      ['技术教程', 2],
      ['碎片杂文', 1]
    ])
  })

  it('名字里的特殊字符会编码进链接', () => {
    const groups = buildTaxonomyGroups({
      options: [{ name: 'C++', count: 1 }],
      posts: [{ title: 'x', href: '/article/x', tags: ['C++'] }],
      kind: 'tag'
    })

    expect(groups[0].href).toBe('/tag/C%2B%2B')
  })

  it('缺数据时不抛错，返回空数组', () => {
    expect(buildTaxonomyGroups({ options: null, posts: null })).toEqual([])
    expect(
      buildTaxonomyGroups({ options: categoryOptions, posts: undefined })
    ).toHaveLength(2)
  })
})

describe('heo TaxonomyIndex 选中', () => {
  const groups = [{ name: '工具' }, { name: 'AI工具' }, { name: '随笔' }]

  it('没选时返回全部', () => {
    expect(selectTaxonomyGroups(groups, '')).toHaveLength(3)
    expect(selectTaxonomyGroups(groups, undefined)).toHaveLength(3)
  })

  it('选中一个就只留它，名字要完全一致', () => {
    expect(selectTaxonomyGroups(groups, '工具').map(g => g.name)).toEqual([
      '工具'
    ])
  })

  it('选的那个已经不在了，退回全部', () => {
    expect(selectTaxonomyGroups(groups, '不存在')).toHaveLength(3)
    expect(selectTaxonomyGroups(null, '工具')).toEqual([])
  })
})

describe('heo TaxonomyIndex 配色', () => {
  it('Notion 选了颜色就用那个颜色', () => {
    expect(taxonomyPalette('green', '随便').bg).toBe(
      taxonomyPalette('green', '另一个').bg
    )
    expect(taxonomyPalette('green', 'x')).not.toEqual(
      taxonomyPalette('red', 'x')
    )
  })

  it('没选颜色时按名字定色，同名永远同色', () => {
    expect(taxonomyPalette('gray', '技术教程')).toEqual(
      taxonomyPalette(undefined, '技术教程')
    )
    expect(taxonomyPalette('default', '技术教程')).toEqual(
      taxonomyPalette('', '技术教程')
    )
  })

  it('每种配色都给齐亮色和暗色的底色、文字、选中底', () => {
    const palette = taxonomyPalette(undefined, '任意名字')
    expect(Object.keys(palette).sort()).toEqual([
      'bg',
      'darkBg',
      'darkFg',
      'darkSel',
      'fg'
    ])
    Object.values(palette).forEach(value =>
      expect(value).toMatch(/^#[0-9a-f]{6}$/)
    )
  })
})

describe('heo 标签索引页', () => {
  const renderTagIndex = () =>
    render(
      <TaxonomyIndex
        kind='tag'
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        allNavPages={posts}
      />
    )

  const renderCategoryIndex = () =>
    render(
      <TaxonomyIndex
        kind='category'
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        allNavPages={posts}
      />
    )

  it('页头显示标题和三项统计，卡里列出文章', () => {
    renderTagIndex()

    expect(
      screen.getByRole('heading', { level: 1, name: '博客标签' })
    ).toBeInTheDocument()
    // 3 个标签 / 3 篇文章 / 2 个分类
    expect(screen.getByRole('link', { name: '3 标签' })).toHaveAttribute(
      'href',
      '/tag'
    )
    expect(screen.getByRole('link', { name: '2 分类' })).toHaveAttribute(
      'href',
      '/category'
    )
    expect(screen.getByRole('link', { name: '3 篇文章' })).toHaveAttribute(
      'href',
      '/archive'
    )
    expect(
      screen.getByRole('link', { name: 'Windows 优化 08-20' })
    ).toHaveAttribute('href', '/article/windows')
  })

  it('卡头写齐名字和篇数，整条点进标签页', () => {
    renderTagIndex()
    // 标签前面带 #
    const cardHead = screen.getByRole('link', { name: '#工具 2 篇' })

    expect(cardHead).toHaveAttribute('href', '/tag/%E5%B7%A5%E5%85%B7')
    expect(cardHead.closest('section')).toHaveTextContent('Windows 优化')
  })

  it('分类页的卡头不带 #', () => {
    renderCategoryIndex()

    expect(screen.getByRole('link', { name: '技术教程 2 篇' })).toHaveAttribute(
      'href',
      '/category/%E6%8A%80%E6%9C%AF%E6%95%99%E7%A8%8B'
    )
  })

  it('当前所在的统计项标记 aria-current', () => {
    renderTagIndex()

    expect(screen.getByRole('link', { name: '3 标签' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: '2 分类' })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('胶囊墙列出全部标签，点一个就只留它那张卡', () => {
    renderTagIndex()

    // 默认「全部」是按下的状态
    expect(screen.getByRole('button', { name: '全部 3' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: '#工具 2' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )

    const pill = screen.getByRole('button', { name: '#教程 1' })
    fireEvent.click(pill)

    expect(pill).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('link', { name: '#教程 1 篇' })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: '#随笔 1 篇' })
    ).not.toBeInTheDocument()
    // 胶囊墙本身还是全的，可以直接换一个
    expect(screen.getByRole('button', { name: '#随笔 1' })).toBeInTheDocument()

    // 再点一次同一颗，回到全部
    fireEvent.click(pill)
    expect(screen.getByRole('link', { name: '#随笔 1 篇' })).toBeInTheDocument()
  })

  it('点「全部」把卡片放回来', () => {
    renderTagIndex()

    fireEvent.click(screen.getByRole('button', { name: '#工具 2' }))
    expect(
      screen.queryByRole('link', { name: '#随笔 1 篇' })
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '全部 3' }))
    expect(screen.getByRole('link', { name: '#随笔 1 篇' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '#工具 2 篇' })).toBeInTheDocument()
  })

  it('分类页的胶囊不带 #，一样点了就只留一张卡', () => {
    renderCategoryIndex()

    expect(
      screen.getByRole('heading', { level: 1, name: '博客分类' })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '技术教程 2' }))
    expect(
      screen.getByRole('link', { name: '技术教程 2 篇' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: '碎片杂文 1 篇' })
    ).not.toBeInTheDocument()
  })
})
