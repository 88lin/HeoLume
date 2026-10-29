/** @jest-environment node */

import fs from 'fs'
import { createFeed, generateRss } from '@/lib/utils/rss'
import { getPostBlocks } from '@/lib/db/SiteDataApi'

// Exercise the real router hook, NotionPage, React server renderer and Feed.
// RSS renders outside both Next's RouterContext and the app's GlobalContext.
jest.unmock('next/router')
jest.mock('@/lib/global', () => ({
  useGlobal: () => undefined,
  getGlobalSnapshot: () => ({})
}))
jest.mock('@/lib/db/SiteDataApi', () => ({ getPostBlocks: jest.fn() }))
jest.mock('@/lib/db/notion/getPostBlocks', () => ({
  formatNotionBlock: block => block
}))
jest.mock('@/lib/utils/notion.util', () => ({
  adapterNotionBlockMap: blockMap => blockMap
}))
jest.mock('@/lib/db/notion/mapImage', () => ({
  compressImage: value => value,
  mapImgUrl: value => value
}))
jest.mock('@/components/NotionEmbed', () => () => null)
jest.mock('@fisch0920/medium-zoom', () => jest.fn())
jest.mock('react-notion-x', () => ({
  NotionRenderer: ({ components, mapPageUrl }) => (
    <>
      <p>RSS full article content</p>
      <components.PageLink href={mapPageUrl('4aea95fb3fd5fcf81846aaaaaaaaaaaa')} className='notion-page-link'>Related page</components.PageLink>
      <components.PageLink href={mapPageUrl('da8daa2f8d19420987d51cc9bdf01241')} className='notion-page-link'>Child page</components.PageLink>
      <components.Link href='#chapter-1'>Chapter</components.Link>
      <components.Link href='?view=compact#chapter-1'>Article view</components.Link>
      <components.Link href='./related'>Relative article</components.Link>
    </>
  )
}))

it.each(['static', 'shared'])('generates %s full-content feeds without a Next router mounted', async mode => {
  jest.spyOn(fs, 'statSync').mockImplementation(() => {
    throw new Error('ENOENT')
  })
  jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {})
  jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {})
  getPostBlocks.mockResolvedValue({ block: {} })

  const props = {
    NOTION_CONFIG: { RSS_FULL_CONTENT: true, CONTACT_EMAIL: '', INNER_PAGE_URL_PARENT_PATH: true },
    allLinkPages: [{ short_id: 'fcf8-1846-aaaaaaaaaaaa', href: '/links' }],
    siteInfo: {
      title: 'Test feed',
      description: 'RSS regression test',
      link: 'https://example.com'
    },
    latestPosts: [{
      id: 'post-1',
      slug: 'rss-post',
      href: '/article/rss-post',
      title: 'RSS article',
      summary: 'Summary only',
      publishDay: '2026-10-03'
    }]
  }

  let outputs
  if (mode === 'static') {
    await generateRss(props)
    outputs = fs.writeFileSync.mock.calls.map(([, content]) => content)
    expect(fs.writeFileSync).toHaveBeenCalledTimes(3)
  } else {
    const feed = await createFeed({
      ...props,
      posts: props.latestPosts
    })
    outputs = [feed.rss2(), feed.atom1(), feed.json1()]
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  }

  expect(getPostBlocks).toHaveBeenCalledWith('post-1', 'rss-content')
  for (const content of outputs) {
    expect(content).toContain('RSS full article content')
  }
  const jsonFeed = JSON.parse(outputs[2])
  expect(jsonFeed.items[0].url).toBe('https://example.com/article/rss-post')
  expect(jsonFeed.items[0].content_html).toContain('href="https://example.com/links"')
  expect(jsonFeed.items[0].content_html).toContain('href="https://example.com/article/rss-post/da8daa2f8d19420987d51cc9bdf01241"')
  expect(jsonFeed.items[0].content_html).toContain('href="https://example.com/article/rss-post#chapter-1"')
  expect(jsonFeed.items[0].content_html).toContain('href="https://example.com/article/rss-post?view=compact#chapter-1"')
  expect(jsonFeed.items[0].content_html).toContain('href="https://example.com/article/related"')
})
