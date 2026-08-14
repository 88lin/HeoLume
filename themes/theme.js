import BLOG from '@/blog.config'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { getServerThemeModule } from 'notionnext-theme-registry'
import { getQueryParam, isBrowser } from '../lib/utils'
import { THEMES } from './themeConfig'
export {
  THEMES,
  getThemeConfig,
  initDarkMode,
  isPreferDark,
  loadDarkModeFromLocalStorage,
  saveDarkModeToLocalStorage
} from './themeConfig'

const baseLayoutCache = new Map()
const layoutByThemeCache = new Map()
let domFixTimer = null

const LayoutLoading = () => (
  <div className='min-h-screen w-full bg-[#f6f6f1] dark:bg-black' />
)

const EmptyBaseLayout = ({ children }) => <>{children}</>
const EmptyPageLayout = () => null

const IndexLayoutLoading = () => (
  <div className='pt-10 md:pt-18 w-full bg-[#f6f6f1] dark:bg-black'>
    <div className='mx-auto w-full max-w-screen-3xl px-4 py-10 lg:px-0'>
      <div className='grid gap-10 xl:grid-cols-2'>
        <section className='space-y-5'>
          <div className='h-80 w-full animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-10 w-4/5 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-4 w-2/3 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
        </section>
        <section className='space-y-6'>
          <div className='h-48 w-full animate-pulse bg-gray-200 dark:bg-gray-800' />
          {[0, 1].map(item => (
            <div
              key={item}
              className='flex gap-6 border-t border-gray-300 pt-6 dark:border-gray-800'>
              <div className='min-w-0 flex-1 space-y-3'>
                <div className='h-6 w-4/5 animate-pulse bg-gray-200 dark:bg-gray-800' />
                <div className='h-4 w-2/3 animate-pulse bg-gray-200 dark:bg-gray-800' />
                <div className='h-4 w-20 animate-pulse bg-gray-200 dark:bg-gray-800' />
              </div>
              <div className='h-32 w-32 shrink-0 animate-pulse bg-gray-200 dark:bg-gray-800' />
            </div>
          ))}
        </section>
      </div>

      <section className='mt-12'>
        <div className='flex items-center justify-between'>
          <div className='h-7 w-28 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-5 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
        </div>
        <div className='mt-6 grid gap-8 md:grid-cols-2 xl:grid-cols-4'>
          {[0, 1, 2, 3].map(item => (
            <div
              key={item}
              className='space-y-4 border-t border-gray-300 pt-5 dark:border-gray-800'>
              <div className='h-5 w-3/4 animate-pulse bg-gray-200 dark:bg-gray-800' />
              <div className='h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
)

const getLayoutLoading = (themeName, layoutName) => {
  if (themeName !== 'magzine') return undefined
  return layoutName === 'LayoutIndex' ? IndexLayoutLoading : LayoutLoading
}

const normalizeThemeName = themeValue => {
  if (!themeValue || typeof themeValue !== 'string') return BLOG.THEME
  const firstTheme = themeValue.split(',')[0].trim()
  if (!firstTheme) return BLOG.THEME
  return THEMES.includes(firstTheme) ? firstTheme : BLOG.THEME
}

const getFallbackThemeName = themeName => {
  const preferred = normalizeThemeName(BLOG.THEME)
  if (preferred && preferred !== themeName) return preferred
  if (THEMES.includes('example') && themeName !== 'example') return 'example'
  return THEMES.find(item => item !== themeName) || null
}

const getThemeExport = (mod, exportName) => {
  if (mod?.[exportName]) return mod[exportName]
  if (mod?.default?.[exportName]) return mod.default[exportName]
  if (exportName === 'LayoutBase' && typeof mod?.default === 'function') {
    return mod.default
  }
  return null
}

const getLayoutFromModule = (mod, layoutName) =>
  getThemeExport(mod, layoutName) ||
  (layoutName === 'LayoutSlug' ? null : getThemeExport(mod, 'LayoutSlug'))

const getServerLayout = (themeName, layoutName) => {
  if (themeName === 'magzine') return null
  return getLayoutFromModule(getServerThemeModule(themeName), layoutName)
}

async function importThemeLayout(themeFolderName, layoutName) {
  try {
    const mod = await import(`@/themes/${themeFolderName}`)
    return getLayoutFromModule(mod, layoutName)
  } catch (err) {
    console.error(`Failed to load theme "${themeFolderName}":`, err)
    return null
  }
}

async function resolveThemeLayout(themeName, layoutName, emptyLayout) {
  let Layout = await importThemeLayout(themeName, layoutName)
  if (Layout) return Layout

  const fallback = getFallbackThemeName(themeName)
  if (fallback) {
    Layout = await importThemeLayout(fallback, layoutName)
    if (Layout) {
      console.warn(
        `[theme] "${themeName}" missing "${layoutName}", using fallback "${fallback}".`
      )
      return Layout
    }
  }

  console.warn(`[theme] "${themeName}" missing "${layoutName}", using empty layout.`)
  return emptyLayout
}

const getCurrentTheme = (router, fallbackTheme) => {
  const queryTheme = getQueryParam(router?.asPath, 'theme')
  return normalizeThemeName(queryTheme || fallbackTheme || BLOG.THEME)
}

const scheduleFixThemeDOM = (delay = 120) => {
  if (!isBrowser) return
  if (domFixTimer) clearTimeout(domFixTimer)
  domFixTimer = setTimeout(() => {
    fixThemeDOM()
    domFixTimer = null
  }, delay)
}

const fixThemeDOM = () => {
  if (!isBrowser) return
  const elements = document.querySelectorAll('[id^="theme-"]')
  if (elements?.length <= 1) return

  for (let i = 0; i < elements.length - 1; i++) {
    if (elements[i]?.parentNode?.contains(elements[i])) {
      elements[i].parentNode.removeChild(elements[i])
    }
  }
  elements[0]?.scrollIntoView()
}

export const getBaseLayoutByTheme = theme => {
  const normalizedTheme = normalizeThemeName(theme)
  if (baseLayoutCache.has(normalizedTheme)) {
    return baseLayoutCache.get(normalizedTheme)
  }

  if (typeof window === 'undefined') {
    const BaseLayout = getServerLayout(normalizedTheme, 'LayoutBase')
    if (BaseLayout) {
      baseLayoutCache.set(normalizedTheme, BaseLayout)
      return BaseLayout
    }
  }

  const DynamicBaseLayout = dynamic(
    () => resolveThemeLayout(normalizedTheme, 'LayoutBase', EmptyBaseLayout),
    { ssr: true }
  )
  baseLayoutCache.set(normalizedTheme, DynamicBaseLayout)
  return DynamicBaseLayout
}

export const DynamicLayout = props => {
  const { theme, layoutName } = props
  const SelectedLayout = useLayoutByTheme({ layoutName, theme })
  return <SelectedLayout {...props} />
}

export const useLayoutByTheme = ({ layoutName, theme }) => {
  const router = useRouter()
  const themeQuery = getCurrentTheme(router, theme)
  const cacheKey = `${themeQuery}:${layoutName}`

  if (layoutByThemeCache.has(cacheKey)) {
    scheduleFixThemeDOM(themeQuery === BLOG.THEME ? 80 : 240)
    return layoutByThemeCache.get(cacheKey)
  }

  if (typeof window === 'undefined') {
    const ResolvedLayout = getServerLayout(themeQuery, layoutName)
    if (ResolvedLayout) {
      layoutByThemeCache.set(cacheKey, ResolvedLayout)
      return ResolvedLayout
    }
  }

  const loadLayout = () =>
    resolveThemeLayout(themeQuery, layoutName, EmptyPageLayout)
  const layoutLoading = getLayoutLoading(themeQuery, layoutName)
  const DynamicLayoutComponent = layoutLoading
    ? dynamic(loadLayout, { ssr: true, loading: layoutLoading })
    : dynamic(loadLayout, { ssr: true })
  layoutByThemeCache.set(cacheKey, DynamicLayoutComponent)
  scheduleFixThemeDOM(themeQuery === BLOG.THEME ? 80 : 240)
  return DynamicLayoutComponent
}
