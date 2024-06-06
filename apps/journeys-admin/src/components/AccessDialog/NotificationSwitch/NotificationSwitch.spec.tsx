import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { useEventEmailNotificationsUpdateMock } from '../../../libs/useEventEmailNotificationsUpdateMutation/useEventEmailNotificationsUpdateMutation.mock'

import { NotificationSwitch } from '.'

describe('NotificationSwitch', () => {
  it('updates event email notifications on click', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[useEventEmailNotificationsUpdateMock]}>
          <NotificationSwitch />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'false'
    )
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument())
    await waitFor(() =>
      expect(useEventEmailNotificationsUpdateMock.result).toHaveBeenCalled()
    )
  })
})
