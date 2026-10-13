import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FloatTocButton from '@/themes/heo/components/FloatTocButton'

jest.mock('@/lib/global', () => ({
  useGlobal: () => ({ locale: { COMMON: { TABLE_OF_CONTENTS: '文章目录' } } })
}))
jest.mock(
  '@/themes/heo/components/Catalog',
  () =>
    function MockCatalog() {
      return <a href='#chapter'>Chapter</a>
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
