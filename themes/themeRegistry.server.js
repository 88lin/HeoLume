import BLOG from '@/blog.config'
import * as defaultThemeModule from 'notionnext-default-theme'

const defaultThemeName = String(BLOG.THEME || '')
  .split(',')[0]
  .trim()

export const getServerThemeModule = themeName => {
  return themeName === defaultThemeName ? defaultThemeModule : null
}
