import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { InMemoryCache } from '@apollo/client'
import { JourneyFields as Journey } from '../../../../../__generated__/JourneyFields'
import { CREATE_USER_INVITE, EmailInviteForm } from './EmailInviteForm'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('EmailInviteForm', () => {
  it('should validate when fields are empty', async () => {
    const { getByRole, getAllByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EmailInviteForm users={[]} />
        </MockedProvider>
      </SnackbarProvider>
    )

    const email = getByRole('textbox', { name: 'Email' })

    fireEvent.click(email)
    expect(getByRole('button', { name: 'add user' })).toBeDisabled()
    fireEvent.change(email, { target: { value: '123abc@' } })
    fireEvent.click(getByRole('button', { name: 'add user' }))
    fireEvent.change(email, { target: { value: '' } })

    await waitFor(() => {
      const inlineErrors = getAllByText('Required')
      expect(inlineErrors[0]).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should validate when email is invalid', async () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EmailInviteForm users={[]} />
        </MockedProvider>
      </SnackbarProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })

    fireEvent.change(email, {
      target: { value: '123abc@' }
    })
    fireEvent.click(getByRole('button', { name: 'add user' }))

    await waitFor(() => {
      const inlineError = getByText('Please enter a valid email address')
      expect(inlineError).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should validate when email is already exists', async () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <EmailInviteForm users={['admin@email.com']} />
        </MockedProvider>
      </SnackbarProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })

    fireEvent.change(email, {
      target: { value: 'admin@email.com' }
    })
    fireEvent.click(getByRole('button', { name: 'add user' }))

    await waitFor(() => {
      const inlineError = getByText('This email is already on the list')
      expect(inlineError).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should create user invite on click', async () => {
    const result = jest.fn(() => ({
      data: {
        userInviteCreate: {
          id: 'inviteId',
          email: 'test@email.com',
          acceptedAt: null,
          removedAt: null
        }
      }
    }))

    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        userInvites: []
      }
    })

    const { getByRole } = render(
      <JourneyProvider
        value={{ journey: { id: 'journeyId' } as unknown as Journey }}
      >
        <SnackbarProvider>
          <MockedProvider
            cache={cache}
            mocks={[
              {
                request: {
                  query: CREATE_USER_INVITE,
                  variables: {
                    journeyId: 'journeyId',
                    input: {
                      email: 'test@email.com'
                    }
                  }
                },
                result
              }
            ]}
          >
            <EmailInviteForm users={[]} />
          </MockedProvider>
        </SnackbarProvider>
      </JourneyProvider>
    )
    const email = getByRole('textbox', { name: 'Email' })

    fireEvent.change(email, {
      target: { value: 'test@email.com' }
    })
    fireEvent.click(getByRole('button', { name: 'add user' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(cache.extract()?.ROOT_QUERY?.userInvites).toEqual([
        { __ref: 'UserInvite:inviteId' }
      ])
    })
  })
})
