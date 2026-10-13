import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import FloatTocButton from '@/themes/heo/components/FloatTocButton'
import Header from '@/themes/heo/components/Header'

jest.mock('notion-utils', () => ({
  uuidToId: value => value.replace(/-/g, '')
}))
jest.mock('@/lib/config', () => ({ siteConfig: () => false }))
jest.mock('@/lib/global', () => ({
  useGlobal: () => ({
    locale: {
      COMMON: {
        TABLE_OF_CONTENTS: 'Table of contents',
        BLOG: 'Blog',
        TAGS: 'Tags'
      },
      MENU: { LIGHT_MODE: 'Light mode', DARK_MODE: 'Dark mode' }
    }
  })
}))
jest.mock('next/router', () => ({ useRouter: jest.fn() }))
jest.mock('@/components/SmartLink', () => ({
  __esModule: true,
  default: ({ children, ...props }) => <a {...props}>{children}</a>
}))
jest.mock('@/themes/heo/components/Logo', () => () => null)
jest.mock('@/themes/heo/components/MenuListTop', () => ({
  MenuListTop: () => null
}))
jest.mock('@/themes/heo/components/MenuListSide', () => ({
  MenuListSide: () => null
}))
jest.mock('@/themes/heo/components/TagGroups', () => () => null)
jest.mock('@/themes/heo/components/ReadingProgress', () => () => null)
jest.mock('@/themes/heo/components/SearchButton', () => () => null)
jest.mock('@/themes/heo/components/RandomPostButton', () => () => null)
jest.mock('@/themes/heo/dayNightTransition', () => ({
  toggleDarkModeWithTransition: jest.fn()
}))

const post = {
  id: 'first',
  toc: [
    { id: 'abc', text: 'First section', indentLevel: 0 },
    { id: 'def', text: 'Second section', indentLevel: 0 }
  ]
}

describe('Heo NavigationDialogs', () => {
  // Unmount portals before the global setup clears document.body.
  afterEach(cleanup)

  beforeEach(() => {
    useRouter.mockReturnValue({ asPath: '/first' })
  })

  async function expectClosed(trigger) {
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  }

  it('keeps closed TOC links out of the tab order and returns focus on Escape', async () => {
    const user = userEvent.setup()
    render(<FloatTocButton post={post} />)
    const trigger = screen.getByRole('button', { name: 'Table of contents' })
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    await user.tab()
    expect(trigger).toHaveFocus()
    await user.keyboard('{Enter}')
    const dialog = await screen.findByRole('dialog', {
      name: 'Table of contents'
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    for (let i = 0; i < 5; i++) {
      await user.tab()
      expect(dialog).toContainElement(document.activeElement)
    }
    await user.keyboard('{Escape}')
    await expectClosed(trigger)
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it.each(['selection', 'close button', 'outside click'])(
    'closes the TOC after %s',
    async action => {
      const user = userEvent.setup()
      render(<FloatTocButton post={post} />)
      const trigger = screen.getByRole('button', { name: 'Table of contents' })
      await user.click(trigger)
      const dialog = await screen.findByRole('dialog')
      if (action === 'selection')
        await user.click(
          within(dialog).getByRole('link', { name: 'First section' })
        )
      else if (action === 'close button')
        await user.click(
          within(dialog).getByRole('button', { name: '关闭目录' })
        )
      else await user.click(document.getElementById('right-drawer-background'))
      await expectClosed(trigger)
    }
  )

  it('clears the open TOC on article, lock, and responsive visibility changes', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<FloatTocButton post={post} />)
    const trigger = screen.getByRole('button', { name: 'Table of contents' })
    await user.click(trigger)
    rerender(<FloatTocButton post={{ ...post, id: 'second' }} />)
    await expectClosed(trigger)
    await user.click(trigger)
    trigger.style.display = 'none'
    fireEvent.resize(window)
    await expectClosed(trigger)
    trigger.style.display = ''
    await user.click(trigger)
    rerender(<FloatTocButton post={post} lock />)
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    rerender(<FloatTocButton post={post} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('synchronizes the real Header and SlideOver through Escape, close, route and resize', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Header />)
    const trigger = screen.getByRole('button', { name: '打开菜单' })
    await user.click(trigger)
    await screen.findByRole('dialog', { name: '菜单' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    await expectClosed(trigger)
    await waitFor(() => expect(trigger).toHaveFocus())
    await user.keyboard(' ')
    await user.click(await screen.findByRole('button', { name: 'Close panel' }))
    await expectClosed(trigger)
    await user.click(trigger)
    useRouter.mockReturnValue({ asPath: '/second' })
    rerender(<Header />)
    await expectClosed(trigger)
    await user.click(trigger)
    trigger.style.display = 'none'
    fireEvent.resize(window)
    await expectClosed(trigger)
  })
})
