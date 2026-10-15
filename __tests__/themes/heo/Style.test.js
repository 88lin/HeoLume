/** @jest-environment node */
import { renderToStaticMarkup } from 'react-dom/server'
import { createStyleRegistry, StyleRegistry } from 'styled-jsx'
import { siteConfig } from '@/lib/config'
import { Style } from '@/themes/heo/style'

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((_key, fallback) => fallback)
}))

function renderCss() {
  const registry = createStyleRegistry()
  renderToStaticMarkup(
    <StyleRegistry registry={registry}>
      <Style />
    </StyleRegistry>
  )
  return renderToStaticMarkup(<>{registry.styles()}</>)
}

it('keeps valid light and dark backgrounds when the custom theme omits upstream color settings', () => {
  const css = renderCss()
  expect(css).toMatch(/body\s*\{\s*background-color:\s*#f7f9fe/)
  expect(css).toMatch(/html\.dark\s+body\s*\{\s*background-color:\s*#18171d/)
})

it('uses configured backgrounds for overscroll in both color modes', () => {
  siteConfig.mockImplementation(
    (key, fallback) =>
      ({
        HEO_COLOR_BG: '#fafafa',
        HEO_COLOR_BG_DARK: '#101010'
      })[key] ?? fallback
  )
  const css = renderCss()
  expect(css).toMatch(/body\s*\{\s*background-color:\s*#fafafa/)
  expect(css).toMatch(/html\.dark\s+body\s*\{\s*background-color:\s*#101010/)
})
