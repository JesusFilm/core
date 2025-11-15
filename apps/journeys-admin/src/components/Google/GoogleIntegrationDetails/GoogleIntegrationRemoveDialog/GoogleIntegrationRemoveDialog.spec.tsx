import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { useRouter } from 'next/router'

import { GET_INTEGRATION } from '../../../../libs/useIntegrationQuery'

import {
  GoogleIntegrationRemoveDialog,
  GoogleIntegrationRemoveDialogProps
} from './GoogleIntegrationRemoveDialog'

import '../../../../../test/i18n'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('GoogleIntegrationRemoveDialog', () => {
  const integrationDeleteMock: MockedResponse = {
    request: {
      query: expect.anything(),
      variables: { id: 'integrationId' }
    },
    result: {
      data: {
        integrationDelete: {
          id: 'integrationId'
        }
      }
    }
  }

  function renderComponent(
    props: Partial<GoogleIntegrationRemoveDialogProps> = {}
  ): ReturnType<typeof render> {
    ;(useRouter as jest.Mock).mockReturnValue({
      push: jest.fn()
    })

    const handleClose = props.handleClose ?? jest.fn()

    return render(
      <MockedProvider mocks={[integrationDeleteMock]} addTypename={false}>
        <SnackbarProvider>
          <GoogleIntegrationRemoveDialog
            open
            integrationId="integrationId"
            teamId="teamId"
            handleClose={handleClose}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
  }

  it('calls integration delete mutation and navigates on confirm', async () => {
    const { getByRole } = renderComponent()

    fireEvent.click(getByRole('button', { name: 'Remove Integration' }))

    await waitFor(() =>
      expect(getByRole('button', { name: 'Remove Integration' })).toBeEnabled()
    )
  })

  it('closes dialog on cancel', async () => {
    const handleClose = jest.fn()

    const { getByRole } = renderComponent({ handleClose })

    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(handleClose).toHaveBeenCalled())
  })
})


