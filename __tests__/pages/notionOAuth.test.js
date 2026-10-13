/** @jest-environment node */
import { startNotionOAuth, completeNotionOAuth } from '@/lib/server/notionOAuth'
import callback from '@/pages/api/auth/callback/notion'
import authorize from '@/pages/api/auth/notion'
import { getServerSideProps } from '@/pages/auth'

const mockAxiosPost = jest.fn()
jest.mock('axios', () => ({ post: (...args) => mockAxiosPost(...args) }))
const state = 'a'.repeat(43)
const req = () => ({
  method: 'GET',
  query: { code: 'one-time-code', state },
  cookies: { notion_oauth_state: state }
})
const res = () => ({
  headers: {},
  setHeader(k, v) {
    this.headers[k] = v
  },
  status(code) {
    this.statusCode = code
    return this
  },
  json(body) {
    this.body = body
    return this
  },
  redirect(code, url) {
    this.statusCode = code
    this.url = url
    return this
  }
})
const oldEnv = { ...process.env }
beforeEach(() => {
  process.env.OAUTH_CLIENT_ID = 'fixture-client'
  process.env.OAUTH_CLIENT_SECRET = 'fixture-secret'
  process.env.OAUTH_REDIRECT_URI =
    'https://example.com/api/auth/callback/notion'
  mockAxiosPost.mockResolvedValue({
    status: 200,
    data: {
      access_token: 'fixture-access-token',
      owner: { email: 'private@example.com' }
    }
  })
})
afterAll(() => {
  process.env = oldEnv
})

it('starts with an unpredictable state bound to an HttpOnly cookie', () => {
  const response = res()
  const result = startNotionOAuth(response)
  const url = new URL(result.redirect)
  expect(url.searchParams.get('state')).toHaveLength(43)
  expect(response.headers['Set-Cookie']).toContain(
    url.searchParams.get('state')
  )
  expect(response.headers['Set-Cookie']).toContain('HttpOnly; SameSite=Lax')
  expect(response.headers['Set-Cookie']).toContain('Secure')
})
it.each([undefined, 'b'.repeat(43), ['a'], '中'.repeat(43)])(
  'rejects invalid state before exchanging the code (%j)',
  async invalid => {
    const request = req()
    request.cookies.notion_oauth_state = invalid
    expect((await completeNotionOAuth(request, res())).status).toBe(400)
    expect(mockAxiosPost).not.toHaveBeenCalled()
  }
)
it('returns only a fixed success URL through both callback routes', async () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => {})
  const response = res()
  await callback(req(), response)
  expect(response.url).toBe('/auth/result?status=success')
  expect(response.headers['Set-Cookie']).toContain('Max-Age=0')
  const legacy = await getServerSideProps({
    req: req(),
    res: res(),
    query: req().query
  })
  expect(legacy.redirect.destination).toBe(response.url)
  expect(JSON.stringify([response, legacy])).not.toMatch(
    /fixture-access-token|private@example|fixture-secret/
  )
  expect(log).not.toHaveBeenCalled()
})
it('does not log or forward an upstream error payload', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {})
  mockAxiosPost.mockRejectedValue(new Error('fixture-secret'))
  const result = await completeNotionOAuth(req(), res())
  expect(result.status).toBe(502)
  expect(JSON.stringify(result)).not.toContain('fixture-secret')
  expect(log).not.toHaveBeenCalled()
})
it('fails closed when OAuth is unconfigured', async () => {
  delete process.env.OAUTH_CLIENT_SECRET
  expect(startNotionOAuth(res()).status).toBe(503)
  expect((await completeNotionOAuth(req(), res())).status).toBe(503)
  expect(mockAxiosPost).not.toHaveBeenCalled()
})

it.each([
  { code: undefined },
  { code: ['one-time-code'] },
  { code: 'a'.repeat(2049) },
  { state: undefined },
  { state: ['a'.repeat(43)] },
  { state: 'b'.repeat(43) },
  { state: '中'.repeat(43) }
])(
  'rejects malformed callback parameters before token exchange (%j)',
  async query => {
    const request = req()
    request.query = { ...request.query, ...query }
    const response = res()
    await callback(request, response)
    expect(response.statusCode).toBe(400)
    expect(response.headers['Set-Cookie']).toContain('Max-Age=0')
    expect(mockAxiosPost).not.toHaveBeenCalled()
  }
)

it('starts the legacy route through the same authorization endpoint', async () => {
  const response = res()
  const legacy = await getServerSideProps({
    req: req(),
    res: response,
    query: {}
  })
  expect(legacy.redirect.destination).toBe('/api/auth/notion')
  expect(response.headers['Cache-Control']).toBe('private, no-store')
  expect(response.headers['Referrer-Policy']).toBe('no-referrer')
  expect(mockAxiosPost).not.toHaveBeenCalled()

  const startResponse = res()
  authorize(req(), startResponse)
  expect(startResponse.statusCode).toBe(302)
  expect(new URL(startResponse.url).origin).toBe('https://api.notion.com')
  expect(startResponse.headers['Set-Cookie']).toContain('Max-Age=600')
})

it('handles a denied legacy authorization without retrying or exposing the error', async () => {
  const response = res()
  const legacy = await getServerSideProps({
    req: req(),
    res: response,
    query: {
      error: 'access_denied',
      error_description: 'private-details',
      state
    }
  })
  expect(legacy.redirect.destination).toBe('/auth/result?status=error')
  expect(response.headers['Set-Cookie']).toContain('Max-Age=0')
  expect(mockAxiosPost).not.toHaveBeenCalled()
})

it.each([authorize, callback])(
  'rejects POST requests to an OAuth endpoint',
  async handler => {
    const response = res()
    await handler({ ...req(), method: 'POST' }, response)
    expect(response.statusCode).toBe(405)
    expect(response.headers['Set-Cookie']).toBeUndefined()
    expect(mockAxiosPost).not.toHaveBeenCalled()
  }
)
