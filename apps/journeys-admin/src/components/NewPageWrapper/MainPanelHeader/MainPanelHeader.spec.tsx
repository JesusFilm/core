import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { MainPanelHeader } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('MainPanelHeader', () => {
  it('should show back button with correct link', () => {
    const { getByRole } = render(
      <MainPanelHeader title="Page title" backHref="/" />
    )
    expect(getByRole('link')).toHaveAttribute('href', '/')
  })

  it('should show alt back button with router.push', async () => {
    const back = jest.fn()
    mockUseRouter.mockReturnValue({ back } as unknown as NextRouter)
    const { getByRole } = render(
      <MainPanelHeader title="Page title" backHrefHistory />
    )

    expect(getByRole('button')).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(back).toHaveBeenCalled())
  })

  it('should take user to last visited page', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByRole } = render(
      <MainPanelHeader title="Page title" backHrefHistory={false} />
    )

    expect(getByRole('button')).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(push).toHaveBeenCalled())
  })
})
