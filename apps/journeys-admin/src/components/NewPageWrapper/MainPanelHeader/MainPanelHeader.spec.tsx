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
    const { getByRole, getByText } = render(
      <MainPanelHeader title="Page title" backHref="/" />
    )
    expect(getByRole('link')).toHaveAttribute('href', '/')
    expect(getByText('Page title')).toBeInTheDocument()
  })

  it('should show back button with backHrefHistory', async () => {
    const back = jest.fn()
    mockUseRouter.mockReturnValue({ back } as unknown as NextRouter)
    const { getByTestId, getByText } = render(
      <MainPanelHeader title="Page title" backHrefHistory />
    )
    fireEvent.click(getByTestId('backHref-history-button'))

    await waitFor(() => expect(back).toHaveBeenCalled())
    expect(getByText('Page title')).toBeInTheDocument()
  })
})
