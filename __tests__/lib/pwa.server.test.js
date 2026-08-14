/**
 * @jest-environment node
 */
jest.mock('node:fs', () => ({
  writeFileSync: jest.fn(),
}))
jest.mock('node:path', () => ({
  join: jest.fn((...args) => args.join('/')),
}))

function getFreshModule(blogPwaEnable = false) {
  jest.resetModules()
  jest.doMock('@/blog.config', () => ({ PWA_ENABLE: blogPwaEnable }))
  const fs = require('node:fs')
  const { writePwaManifest } = require('@/lib/pwa.server')
  return { fs, writePwaManifest }
}

describe('writePwaManifest', () => {
  const originalBuildMode = process.env.BUILD_MODE

  beforeEach(() => {
    process.env.BUILD_MODE = 'true'
  })

  afterAll(() => {
    if (originalBuildMode === undefined) {
      delete process.env.BUILD_MODE
    } else {
      process.env.BUILD_MODE = originalBuildMode
    }
    jest.dontMock('@/blog.config')
  })

  it('does not write when BUILD_MODE is not true', () => {
    process.env.BUILD_MODE = 'false'
    const { fs, writePwaManifest } = getFreshModule()
    writePwaManifest({ siteInfo: {}, notionConfig: { PWA_ENABLE: true } })
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })

  it('does not write when PWA is disabled', () => {
    const { fs, writePwaManifest } = getFreshModule()
    writePwaManifest({ siteInfo: {}, notionConfig: { PWA_ENABLE: false } })
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })

  it('writes when PWA is enabled via boolean true', () => {
    const { fs, writePwaManifest } = getFreshModule()
    writePwaManifest({
      siteInfo: { title: 'Test' },
      notionConfig: { PWA_ENABLE: true },
    })
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
  })

  it('writes when PWA is enabled via string "true"', () => {
    const { fs, writePwaManifest } = getFreshModule()
    writePwaManifest({
      siteInfo: { title: 'Test' },
      notionConfig: { PWA_ENABLE: 'true' },
    })
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
  })

  it('writes when PWA is enabled via string "1"', () => {
    const { fs, writePwaManifest } = getFreshModule()
    writePwaManifest({
      siteInfo: { title: 'Test' },
      notionConfig: { PWA_ENABLE: '1' },
    })
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
  })

  it('writes when PWA is enabled via string "yes"', () => {
    const { fs, writePwaManifest } = getFreshModule()
    writePwaManifest({
      siteInfo: { title: 'Test' },
      notionConfig: { PWA_ENABLE: 'yes' },
    })
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
  })

  it('writes when PWA is enabled via string "on"', () => {
    const { fs, writePwaManifest } = getFreshModule()
    writePwaManifest({
      siteInfo: { title: 'Test' },
      notionConfig: { PWA_ENABLE: 'on' },
    })
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
  })

  it('writes when PWA is enabled via number 1', () => {
    const { fs, writePwaManifest } = getFreshModule()
    writePwaManifest({
      siteInfo: { title: 'Test' },
      notionConfig: { PWA_ENABLE: 1 },
    })
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
  })

  it('does not write when PWA_ENABLE is "false" string', () => {
    const { fs, writePwaManifest } = getFreshModule()
    writePwaManifest({
      siteInfo: { title: 'Test' },
      notionConfig: { PWA_ENABLE: 'false' },
    })
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })

  it('writes when BLOG.PWA_ENABLE is enabled and notionConfig has no override', () => {
    const { fs, writePwaManifest } = getFreshModule(true)
    writePwaManifest({
      siteInfo: { title: 'Test' },
      notionConfig: {},
    })
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
  })

  it('respects explicit false in notionConfig over BLOG fallback', () => {
    const { fs, writePwaManifest } = getFreshModule(true)
    writePwaManifest({
      siteInfo: { title: 'Test' },
      notionConfig: { PWA_ENABLE: false },
    })
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })
})
