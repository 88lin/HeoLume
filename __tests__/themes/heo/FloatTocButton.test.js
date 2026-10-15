import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FloatTocButton from '@/themes/heo/components/FloatTocButton'

jest.mock('@/lib/global', () => ({
  useGlobal: () => ({ locale: { COMMON: { TABLE_OF_CONTENTS: '文章目录' } } })
}))
jest.mock(
  '@/themes/heo/components/Catalog',
  () =>
    function MockCatalog({ onItemClick }) {
      return (
        <a href='#chapter' onClick={onItemClick}>
          Chapter
        </a>
      )
    }
)

// Unmount the dialog portal before the global setup clears document.body.
afterEach(cleanup)

it('opens the directory from the keyboard and hides its links when closed', async () => {
  const user = userEvent.setup()
  render(<FloatTocButton post={{ toc: [{ id: 'chapter' }] }} />)
  const button = screen.getByRole('button', { name: '文章目录' })
  expect(button).toHaveAttribute('aria-expanded', 'false')
  expect(
    screen.queryByRole('link', { name: 'Chapter' })
  ).not.toBeInTheDocument()
  await user.tab()
  expect(button).toHaveFocus()
  await user.keyboard('{Enter}')
  expect(button).toHaveAttribute('aria-expanded', 'true')
  expect(await screen.findByRole('link', { name: 'Chapter' })).toBeVisible()
  await user.keyboard('{Escape}')
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  )
  expect(button).toHaveAttribute('aria-expanded', 'false')
  await waitFor(() => expect(button).toHaveFocus())
  expect(
    screen.queryByRole('link', { name: 'Chapter' })
  ).not.toBeInTheDocument()
})

it('closes from a directory link and restores focus to its trigger', async () => {
  const user = userEvent.setup()
  render(<FloatTocButton post={{ toc: [{ id: 'chapter' }] }} />)
  const button = screen.getByRole('button', { name: '文章目录' })
  await user.click(button)
  await user.click(await screen.findByRole('link', { name: 'Chapter' }))
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  )
  await waitFor(() => expect(button).toHaveFocus())
  expect(button).toHaveAttribute('aria-expanded', 'false')
})

it.each(['post', 'lock', 'desktop'])(
  'closes when the %s context changes',
  async context => {
    const user = userEvent.setup()
    const post = { id: 'first', toc: [{ id: 'chapter' }] }
    const { rerender } = render(<FloatTocButton post={post} />)
    const button = screen.getByRole('button', { name: '文章目录' })
    await user.click(button)
    expect(await screen.findByRole('dialog')).toBeVisible()
    if (context === 'post')
      rerender(<FloatTocButton post={{ ...post, id: 'second' }} />)
    if (context === 'lock') rerender(<FloatTocButton post={post} lock />)
    if (context === 'desktop') {
      button.style.display = 'none'
      fireEvent(window, new Event('resize'))
    }
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(
      screen.queryByRole('link', { name: 'Chapter' })
    ).not.toBeInTheDocument()
  }
)
