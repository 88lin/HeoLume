/** @jest-environment node */
import { NextRequest } from 'next/server'
import BLOG from '@/blog.config'

const protect = jest.fn()
const auth = jest.fn(() => ({ userId: null }))
auth.protect = protect

jest.mock('@/blog.config', () => ({ UUID_REDIRECT: false }))
jest.mock('@/lib/utils', () => ({
  checkStrIsNotionId: () => false,
  getLastPartOfUrl: path => path.split('/').pop()
}))
jest.mock('notion-utils', () => ({ idToUuid: value => value }))
jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: handler => request => handler(auth, request),
  createRouteMatcher: patterns => request => patterns.some(pattern =>
    new RegExp('^' + pattern + '$').test(request.nextUrl.pathname))
}))

const originalKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const originalToken = process.env.NOTION_ACTIVE_TOKEN
const originalFetch = global.fetch

beforeEach(() => {
  delete process.env.NOTION_ACTIVE_TOKEN
  auth.mockReturnValue({ userId: null })
  protect.mockReset()
})

afterEach(() => {
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  else process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalKey
  if (originalToken === undefined) delete process.env.NOTION_ACTIVE_TOKEN
  else process.env.NOTION_ACTIVE_TOKEN = originalToken
  BLOG.UUID_REDIRECT = false
  global.fetch = originalFetch
})

function loadMiddleware(withClerk = false) {
  if (withClerk) process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key'
  else delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  let middleware
  jest.isolateModules(() => { middleware = require('@/middleware').default })
  return middleware
}

it.each([undefined, 'invalid-token'])('keeps the configured runtime guard for token %s', async token => {
  if (token === undefined) delete process.env.NOTION_ACTIVE_TOKEN
  else process.env.NOTION_ACTIVE_TOKEN = token
  BLOG.UUID_REDIRECT = true
  const middleware = loadMiddleware()
  for (const path of ['/', '/article/example', '/category/tools']) {
    const response = await middleware(new NextRequest('https://example.com' + path), {})
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/html')
    expect(await response.text()).toBe('')
    expect(response.headers.get('x-middleware-next')).toBeNull()
  }
  expect(global.fetch).not.toHaveBeenCalled()
})

it('allows API requests without a runtime token', async () => {
  const response = await loadMiddleware()(new NextRequest('https://example.com/api/example'), {})
  expect(response.headers.get('x-middleware-next')).toBe('1')
})

it('keeps UUID redirects and preserves the query on an allowed request', async () => {
  BLOG.UUID_REDIRECT = true
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ old: 'article/new' }) })
  // API paths pass the runtime guard without a machine-specific activation token.
  const response = await loadMiddleware()(new NextRequest('https://example.com/api/old?from=link'), {})
  expect(response.status).toBe(308)
  expect(response.headers.get('location')).toBe('https://example.com/article/new?from=link')
})

it('keeps the Clerk login requirement on the dashboard', async () => {
  const response = await loadMiddleware(true)(new NextRequest('https://example.com/dashboard'))
  expect(response.status).toBe(307)
  const destination = new URL(response.headers.get('location'))
  expect(destination.pathname).toBe('/sign-in')
  expect(destination.searchParams.get('redirectTo')).toBe('https://example.com/dashboard')
})

it('keeps Clerk permission checks on admin routes', async () => {
  auth.mockReturnValue({ userId: 'member', protect })
  const response = await loadMiddleware(true)(new NextRequest('https://example.com/admin/team/memberships'))
  expect(protect).toHaveBeenCalledWith(expect.any(Function))
  const hasPermission = protect.mock.calls[0][0]
  expect(hasPermission(() => false)).toBe(false)
  expect(hasPermission(({ permission }) => permission === 'org:sys_memberships:manage')).toBe(true)
  expect(response.headers.get('x-middleware-next')).toBe('1')
})
