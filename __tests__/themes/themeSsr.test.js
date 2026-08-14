/**
 * @jest-environment node
 */

const mockLayoutIndex = () => null
const mockLayoutBase = ({ children }) => children
const mockDynamic = jest.fn(() => function MockDynamicLayout() {
  return null
})

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    THEMES: ['heo', 'magzine', 'next']
  }
}))

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args) => mockDynamic(...args)
}))

jest.mock('next/router', () => ({
  useRouter: () => ({ asPath: '/' })
}))

jest.mock(
  'notionnext-theme-registry',
  () => ({
    getServerThemeModule: jest.fn(themeName =>
      themeName === 'heo'
        ? {
            LayoutBase: mockLayoutBase,
            LayoutIndex: mockLayoutIndex
          }
        : null
    )
  }),
  { virtual: true }
)

import { getBaseLayoutByTheme, useLayoutByTheme } from '@/themes/theme'

describe('server theme registry', () => {
  it('returns default-theme layouts synchronously', () => {
    const Layout = useLayoutByTheme({
      theme: 'heo',
      layoutName: 'LayoutIndex'
    })

    expect(Layout).toBe(mockLayoutIndex)
    expect(getBaseLayoutByTheme('heo')).toBe(mockLayoutBase)
    expect(mockDynamic).not.toHaveBeenCalled()
  })

  it('does not add a loading boundary to other dynamic themes', () => {
    useLayoutByTheme({ theme: 'next', layoutName: 'LayoutIndex' })

    expect(mockDynamic).toHaveBeenCalledTimes(1)
    expect(mockDynamic.mock.calls[0][1]).toEqual({ ssr: true })
  })

  it('preserves the magazine loading skeleton', () => {
    useLayoutByTheme({ theme: 'magzine', layoutName: 'LayoutIndex' })

    expect(mockDynamic).toHaveBeenCalledTimes(1)
    expect(mockDynamic.mock.calls[0][1]).toEqual(
      expect.objectContaining({ ssr: true, loading: expect.any(Function) })
    )
  })
})
