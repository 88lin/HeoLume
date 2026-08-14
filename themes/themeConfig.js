import BLOG from '@/blog.config'
import getConfig from 'next/config'
import { getQueryVariable } from '../lib/utils'

export const { THEMES = [] } = getConfig()?.publicRuntimeConfig || {}

const normalizeThemeName = themeValue => {
  if (!themeValue || typeof themeValue !== 'string') return BLOG.THEME
  const firstTheme = themeValue.split(',')[0].trim()
  if (!firstTheme) return BLOG.THEME
  return THEMES.includes(firstTheme) ? firstTheme : BLOG.THEME
}

const getThemeExport = (mod, exportName) => {
  if (mod?.[exportName]) return mod[exportName]
  if (mod?.default?.[exportName]) return mod.default[exportName]
  if (exportName === 'LayoutBase' && typeof mod?.default === 'function') {
    return mod.default
  }
  return null
}

async function importThemeConfig(themeFolderName) {
  try {
    const mod = await import(`@/themes/${themeFolderName}`)
    return getThemeExport(mod, 'THEME_CONFIG')
  } catch (err) {
    console.error(`Failed to load theme config "${themeFolderName}":`, err)
    return null
  }
}

export const getThemeConfig = async themeQuery => {
  const themeName = normalizeThemeName(themeQuery)
  let cfg = await importThemeConfig(themeName)
  if (cfg) return cfg

  const fallback = normalizeThemeName(BLOG.THEME)
  if (fallback !== themeName) {
    cfg = await importThemeConfig(fallback)
    if (cfg) {
      console.warn(
        `[theme] "${themeName}" config unavailable, using fallback "${fallback}".`
      )
      return cfg
    }
  }
  console.warn('[theme] No theme configuration could be loaded, using empty config.')
  return {}
}

export const initDarkMode = (updateDarkMode, defaultDarkMode) => {
  let newDarkMode = isPreferDark()
  const userDarkMode = loadDarkModeFromLocalStorage()
  if (userDarkMode) {
    newDarkMode = userDarkMode === 'dark' || userDarkMode === 'true'
    saveDarkModeToLocalStorage(newDarkMode)
  }

  if (defaultDarkMode === 'true') newDarkMode = true

  const queryMode = getQueryVariable('mode')
  if (queryMode) newDarkMode = queryMode === 'dark'

  updateDarkMode(newDarkMode)
  document
    .getElementsByTagName('html')[0]
    .setAttribute('class', newDarkMode ? 'dark' : 'light')
}

export function isPreferDark() {
  if (BLOG.APPEARANCE === 'dark') return true
  if (BLOG.APPEARANCE === 'auto') {
    const date = new Date()
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    return (
      prefersDarkMode ||
      (BLOG.APPEARANCE_DARK_TIME &&
        (date.getHours() >= BLOG.APPEARANCE_DARK_TIME[0] ||
          date.getHours() < BLOG.APPEARANCE_DARK_TIME[1]))
    )
  }
  return false
}

export const loadDarkModeFromLocalStorage = () => {
  return localStorage.getItem('darkMode')
}

export const saveDarkModeToLocalStorage = newTheme => {
  localStorage.setItem('darkMode', newTheme)
}
