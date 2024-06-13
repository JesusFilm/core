import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { useEventEmailNotificationsUpdateMock } from '../../../libs/useJourneyNotifcationUpdate/useJourneyNotifcationUpdate.mock'

import { NotificationSwitch } from '.'

describe('NotificationSwitch', () => {
  it('updates event email notifications on click', async () => {
    const result = jest
      .fn()
      .mockReturnValueOnce(useEventEmailNotificationsUpdateMock.result)
    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[{ ...useEventEmailNotificationsUpdateMock, result }]}
        >
          <NotificationSwitch
            id="eventEmailNotificationId"
            name="username"
            checked={false}
            disabled={false}
            userId="userId"
            journeyId="journeyId"
          />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'false'
    )
    fireEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('displays tooltip when hovered', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <NotificationSwitch
            id="eventEmailNotificationId"
            name="username"
            checked={false}
            disabled={false}
            userId="userId"
            journeyId="journeyId"
          />
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.focusIn(screen.getByRole('checkbox'))
    await waitFor(() =>
      expect(
        screen.getByRole('tooltip', { name: 'Only username can change this' })
      ).toBeVisible()
    )
  })

  it('does not update event email notifications when disabled', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <NotificationSwitch
            id="eventEmailNotificationId"
            name="username"
            checked={false}
            disabled
            userId="userId"
            journeyId="journeyId"
          />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
})
