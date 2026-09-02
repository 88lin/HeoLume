import { selectRandomPool } from '@/themes/heo/components/RandomPostButton'

const posts = ['a', 'b', 'c', 'd', 'e', 'f'].map(name => ({
  href: `/article/${name}`
}))

const hrefs = result => result.pool.map(item => item.href)

describe('heo RandomPostButton 随机池', () => {
  it('排除当前正在看的这篇', () => {
    const result = selectRandomPool({
      posts,
      visited: [],
      currentHref: '/article/a'
    })

    expect(hrefs(result)).toEqual([
      '/article/b',
      '/article/c',
      '/article/d',
      '/article/e',
      '/article/f'
    ])
    expect(result.reset).toBe(false)
  })

  it('排除已经读过的，a→b→c→d→e 之后不会又跳回 b', () => {
    const result = selectRandomPool({
      posts,
      visited: ['/article/a', '/article/b', '/article/c', '/article/d'],
      currentHref: '/article/e'
    })

    expect(hrefs(result)).toEqual(['/article/f'])
    expect(result.reset).toBe(false)
  })

  it('还有没读过的时候不清空记录', () => {
    const result = selectRandomPool({
      posts,
      visited: ['/article/a', '/article/b'],
      currentHref: '/article/c'
    })

    expect(hrefs(result)).toEqual([
      '/article/d',
      '/article/e',
      '/article/f'
    ])
    expect(result.reset).toBe(false)
  })

  it('全站读完后重新开始，但仍然排除当前这篇', () => {
    const result = selectRandomPool({
      posts,
      visited: posts.map(item => item.href),
      currentHref: '/article/c'
    })

    expect(result.reset).toBe(true)
    expect(hrefs(result)).toEqual([
      '/article/a',
      '/article/b',
      '/article/d',
      '/article/e',
      '/article/f'
    ])
  })

  it('非文章页没有当前文章，只排除读过的', () => {
    const result = selectRandomPool({
      posts,
      visited: ['/article/a'],
      currentHref: undefined
    })

    expect(hrefs(result)).toEqual([
      '/article/b',
      '/article/c',
      '/article/d',
      '/article/e',
      '/article/f'
    ])
  })

  it('只有一篇文章且正在看它时，随机池为空，不会跳到自己', () => {
    const single = [{ href: '/article/only' }]

    const result = selectRandomPool({
      posts: single,
      visited: ['/article/only'],
      currentHref: '/article/only'
    })

    expect(result.pool).toEqual([])
    expect(result.reset).toBe(true)
  })

  it('已读记录不是数组时当作空处理', () => {
    const result = selectRandomPool({
      posts,
      visited: null,
      currentHref: undefined
    })

    expect(result.pool).toHaveLength(6)
    expect(result.reset).toBe(false)
  })
})
