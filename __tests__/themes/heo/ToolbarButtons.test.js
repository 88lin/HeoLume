import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useImperativeHandle } from 'react'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { toggleDarkModeWithTransition } from '@/themes/heo/dayNightTransition'
import DarkModeButton from '@/themes/heo/components/DarkModeButton'
import RandomPostButton from '@/themes/heo/components/RandomPostButton'
import SearchButton from '@/themes/heo/components/SearchButton'

let mockModalReady = true
const mockOpenSearch = jest.fn()
jest.mock(
  'next/dynamic',
  () => () =>
    function SearchModal({ cRef }) {
      useImperativeHandle(cRef, () =>
        mockModalReady ? { openSearch: mockOpenSearch } : null
      )
      return <div data-testid='search-modal' />
    }
)
jest.mock('@/lib/config', () => ({ siteConfig: jest.fn() }))
jest.mock('@/lib/global', () => ({ useGlobal: jest.fn() }))
jest.mock('next/router', () => ({ useRouter: jest.fn() }))
jest.mock('@/themes/heo/dayNightTransition', () => ({
  toggleDarkModeWithTransition: jest.fn()
}))

const locale = {
  MENU: {
    LIGHT_MODE: 'Light mode',
    DARK_MODE: 'Dark mode',
    WALK_AROUND: 'Random post'
  },
  NAV: { SEARCH: 'Search' }
}
const push = jest.fn()

describe('Heo ToolbarButtons', () => {
  // Unmount portals before the global setup clears document.body.
  afterEach(cleanup)

  beforeEach(() => {
    useGlobal.mockReturnValue({
      locale,
      isDarkMode: false,
      updateDarkMode: jest.fn()
    })
    useRouter.mockReturnValue({ push })
    siteConfig.mockReturnValue('configured')
    mockModalReady = true
  })

  it.each(['ALGOLIA_APP_ID', 'ALGOLIA_SEARCH_ONLY_APP_KEY', 'ALGOLIA_INDEX'])(
    'falls back to the search page without mounting Algolia when %s is missing',
    async missing => {
      siteConfig.mockImplementation(key =>
        key === missing ? '' : 'configured'
      )
      const user = userEvent.setup()
      render(<SearchButton />)
      expect(screen.queryByTestId('search-modal')).not.toBeInTheDocument()
      await user.tab()
      await user.keyboard('{Enter}')
      expect(push).toHaveBeenCalledWith('/search')
    }
  )

  it('falls back safely while the lazy search modal is not ready', async () => {
    mockModalReady = false
    render(<SearchButton />)
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(push).toHaveBeenCalledWith('/search')
    expect(mockOpenSearch).not.toHaveBeenCalled()
  })

  it('opens the ready modal by keyboard without submitting a surrounding form', async () => {
    const submit = jest.fn(event => event.preventDefault())
    const user = userEvent.setup()
    render(
      <form onSubmit={submit}>
        <SearchButton />
      </form>
    )
    await user.tab()
    await user.keyboard(' ')
    expect(mockOpenSearch).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
    expect(submit).not.toHaveBeenCalled()
  })

  it('announces the next color-mode action and preserves the existing transition', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<DarkModeButton />)
    await user.tab()
    await user.keyboard('{Enter}')
    expect(toggleDarkModeWithTransition).toHaveBeenCalledWith(
      expect.objectContaining({ isDarkMode: false })
    )
    useGlobal.mockReturnValue({
      locale,
      isDarkMode: true,
      updateDarkMode: jest.fn()
    })
    rerender(<DarkModeButton />)
    expect(
      screen.getByRole('button', { name: 'Light mode' })
    ).toBeInTheDocument()
  })

  it('opens another post using the keyboard and never submits a form', async () => {
    const submit = jest.fn(event => event.preventDefault())
    const user = userEvent.setup()
    const posts = [{ href: '/first' }, { href: '/second' }]
    render(
      <form onSubmit={submit}>
        <RandomPostButton allNavPages={posts} post={posts[0]} />
      </form>
    )
    await user.tab()
    await user.keyboard(' ')
    expect(push).toHaveBeenCalledWith('/second')
    expect(submit).not.toHaveBeenCalled()
  })
})
