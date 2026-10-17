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

it('keeps the custom page colors for the page and overscroll when no colors are configured', () => {
  const css = renderCss()
  expect(css).toMatch(/#theme-heo,\s*body\s*\{\s*background-color:\s*var\(--heo-color-bg,\s*#f7f9fe\)/)
  expect(css).toMatch(/html\.dark\s+#theme-heo,\s*html\.dark\s+body\s*\{\s*background-color:\s*var\(--heo-color-bg-dark,\s*#17191d\)/)
})

it('uses the same configured backgrounds for the page and overscroll in both color modes', () => {
  siteConfig.mockImplementation(
    (key, fallback) =>
      ({
        HEO_COLOR_BG: '#fafafa',
        HEO_COLOR_BG_DARK: '#101010'
      })[key] ?? fallback
  )
  const css = renderCss()
  expect(css).toMatch(/#theme-heo,\s*body\s*\{\s*background-color:\s*var\(--heo-color-bg,\s*#fafafa\)/)
  expect(css).toMatch(/html\.dark\s+#theme-heo,\s*html\.dark\s+body\s*\{\s*background-color:\s*var\(--heo-color-bg-dark,\s*#101010\)/)
})

it.each([{}, { HEO_COLOR_BG: '#fafafa', HEO_COLOR_BG_DARK: '#101010' }])(
  'preserves escaped custom hover selectors in the compiled stylesheet with %j',
  config => {
    siteConfig.mockImplementation((key, fallback) => config[key] ?? fallback)
    const css = renderCss()
    // These are literal Tailwind class names, not CSS pseudo-classes. Adding
    // background interpolation to the large template previously ate the escapes.
    const selectors = [
      '.hover\\:bg-indigo-600:hover',
      '.group:hover .md\\:group-hover\\:bg-indigo-600',
      '.hover\\:text-indigo-600:hover',
      '.group:hover .group-hover\\:text-indigo-600',
      '.group:hover .group-hover\\:text-indigo-700',
      '.hover\\:text-indigo-700:hover',
      '.hover\\:border-indigo-600:hover',
      '.hover\\:border-blue-600:hover',
      '.dark .hover\\:border-indigo-600:hover',
      '.dark .hover\\:border-blue-600:hover'
    ]
    for (const selector of selectors) expect(css).toContain(selector)
  }
)

it('keeps custom catalog spacing for both the sidebar and the portalled dialog', () => {
  const css = renderCss()
  expect(css).toMatch(
    /#theme-heo \.notion-table-of-contents-item\[data-toc-id\],\s*#heo-floating-toc \.notion-table-of-contents-item\[data-toc-id\]\s*\{\s*padding-left:\s*10px;\s*padding-right:\s*10px/
  )
})
