/**
 * @jest-environment node
 */
jest.mock('node:fs', () => ({ writeFileSync: jest.fn() }))
jest.mock('node:path', () => ({ join: jest.fn(() => '/tmp/manifest.json') }))

import fs from 'node:fs'
import { writePwaManifest } from '@/lib/pwa.server'

describe('writePwaManifest', () => {
  const originalBuildMode = process.env.BUILD_MODE

  beforeEach(() => {
    process.env.BUILD_MODE = 'true'
    fs.writeFileSync.mockClear()
  })

  afterAll(() => {
    if (originalBuildMode === undefined) {
      delete process.env.BUILD_MODE
    } else {
      process.env.BUILD_MODE = originalBuildMode
    }
  })

  it('leaves an existing manifest untouched when PWA is disabled', () => {
    writePwaManifest({ notionConfig: { PWA_ENABLE: false } })

    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })

  it('writes a manifest during builds only after PWA is enabled', () => {
    writePwaManifest({
      siteInfo: { title: 'Installable blog' },
      notionConfig: { PWA_ENABLE: true, PWA_NAME: 'Installable blog' }
    })

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/tmp/manifest.json',
      expect.stringContaining('"name": "Installable blog"')
    )
  })
})
