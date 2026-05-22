import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GoogleSheetsSyncButton } from './GoogleSheetsSyncButton'

describe('GoogleSheetsSyncButton', () => {
  const handleSyncClick = jest.fn()

  beforeEach(() => {
    handleSyncClick.mockClear()
  })

  it('should render sync button', () => {
    render(
      <GoogleSheetsSyncButton disabled={false} onSyncClick={handleSyncClick} />
    )

    expect(
      screen.getByRole('button', { name: 'Sync to Google Sheets' })
    ).toBeInTheDocument()
  })

  it('should call onSyncClick when clicked', async () => {
    render(
      <GoogleSheetsSyncButton disabled={false} onSyncClick={handleSyncClick} />
    )

    const user = userEvent.setup()
    await user.click(
      screen.getByRole('button', { name: 'Sync to Google Sheets' })
    )

    expect(handleSyncClick).toHaveBeenCalledTimes(1)
  })

  it('should disable button when disabled is true', () => {
    render(
      <GoogleSheetsSyncButton disabled={true} onSyncClick={handleSyncClick} />
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should show tooltip with permission message when disabled', () => {
    render(
      <GoogleSheetsSyncButton disabled={true} onSyncClick={handleSyncClick} />
    )

    expect(
      screen.getByRole('button', {
        name: 'Sync to Google Sheets - Only team members and journey owners can export data.'
      })
    ).toBeInTheDocument()
  })

  it('should not call onSyncClick when disabled and clicked', async () => {
    render(
      <GoogleSheetsSyncButton disabled={true} onSyncClick={handleSyncClick} />
    )

    const user = userEvent.setup({
      pointerEventsCheck: 0
    })
    await user.click(screen.getByRole('button'))

    expect(handleSyncClick).not.toHaveBeenCalled()
  })
})
