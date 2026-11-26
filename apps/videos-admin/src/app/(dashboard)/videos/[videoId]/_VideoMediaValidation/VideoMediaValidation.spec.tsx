import { type MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import Box from '@mui/material/Box'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { Suspense } from 'react'

import {
  GET_VIDEO_MEDIA_VALIDATION,
  UPDATE_VIDEO_MEDIA_VALIDATION,
  VideoMediaValidation
} from './VideoMediaValidation'

vi.mock('@apollo/client/react', async () => {
  const original = await vi.importActual('@apollo/client/react')
  return {
    ...original,
    useSuspenseQuery: vi.fn(() => ({
      data: { adminVideo: { id: 'video1', ...loadedValues() } }
    }))
  }
})

function loadedValues() {
  return {
    gospelPresentation: true,
    gospelStartSeconds: 3725,
    gospelEndSeconds: 3790,
    opportunityToRespond: false,
    opportunityToRespondEndSeconds: null,
    biblicallyAccuratePortrayal: null,
    personOfJesusDisplayed: null,
    validationComments: 'Partial'
  }
}

const loaded = {
  gospelPresentation: true,
  gospelStartSeconds: 3725,
  gospelEndSeconds: 3790,
  opportunityToRespond: false,
  opportunityToRespondEndSeconds: null,
  biblicallyAccuratePortrayal: null,
  personOfJesusDisplayed: null,
  validationComments: 'Partial'
}

const queryMock = {
  request: { query: GET_VIDEO_MEDIA_VALIDATION, variables: { id: 'video1' } },
  result: {
    data: { adminVideo: { __typename: 'Video', id: 'video1', ...loaded } }
  }
}

const savedValues = {
  ...loaded,
  gospelPresentation: null,
  gospelStartSeconds: 150
}

function buildUpdateMock(
  overrides: Partial<MockLink.MockedResponse> = {},
  result = vi.fn(() => ({
    data: {
      videoUpdate: { __typename: 'Video', id: 'video1', ...savedValues }
    }
  }))
): MockLink.MockedResponse {
  return {
    request: {
      query: UPDATE_VIDEO_MEDIA_VALIDATION,
      variables: { input: { id: 'video1', ...savedValues } }
    },
    result,
    ...overrides
  }
}

function renderComponent(mocks: MockLink.MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks}>
      <SnackbarProvider>
        <Suspense fallback={<Box>Loading...</Box>}>
          <VideoMediaValidation videoId="video1" />
        </Suspense>
      </SnackbarProvider>
    </MockedProvider>
  )
}

async function selectNotAssessed(
  user: ReturnType<typeof userEvent.setup>,
  label: string
) {
  await user.click(screen.getByLabelText(label))
  await user.click(
    within(await screen.findByRole('listbox')).getByText('Not assessed')
  )
}

describe('VideoMediaValidation', () => {
  it('renders existing values', async () => {
    renderComponent([queryMock])

    expect(await screen.findByLabelText('Gospel Start')).toHaveValue('01:02:05')
    expect(screen.getByLabelText('Gospel End')).toHaveValue('01:03:10')
    expect(screen.getByLabelText('Comments')).toHaveValue('Partial')
    expect(screen.getByLabelText('Gospel Presentation')).toHaveTextContent(
      'Yes'
    )
    expect(
      screen.getByLabelText('Includes Opportunity to Respond')
    ).toHaveTextContent('No')
    expect(
      screen.getByLabelText('Biblically Accurate Portrayal of Jesus')
    ).toHaveTextContent('Not assessed')
    expect(screen.getByLabelText('End of Opportunity to Respond')).toHaveValue(
      ''
    )
  })

  it('saves converted values and shows success snackbar', async () => {
    const user = userEvent.setup()
    const result = vi.fn(() => ({
      data: {
        videoUpdate: { __typename: 'Video', id: 'video1', ...savedValues }
      }
    }))
    renderComponent([queryMock, buildUpdateMock({}, result)])

    const start = await screen.findByLabelText('Gospel Start')
    await user.clear(start)
    await user.type(start, '2:30')
    await selectNotAssessed(user, 'Gospel Presentation')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(
      await screen.findByText('Successfully updated media validation')
    ).toBeInTheDocument()
  })

  it.each(['1:75', 'abc'])('blocks malformed timestamp %s', async (value) => {
    const user = userEvent.setup()
    const result = vi.fn()
    renderComponent([queryMock, buildUpdateMock({}, result)])

    const start = await screen.findByLabelText('Gospel Start')
    await user.clear(start)
    await user.type(start, value)
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Use HH:MM:SS or MM:SS')).toBeInTheDocument()
    expect(result).not.toHaveBeenCalled()
  })

  it('blocks inverted gospel span', async () => {
    const user = userEvent.setup()
    const result = vi.fn()
    renderComponent([queryMock, buildUpdateMock({}, result)])

    const start = await screen.findByLabelText('Gospel Start')
    await user.clear(start)
    await user.type(start, '00:02:00')
    const end = screen.getByLabelText('Gospel End')
    await user.clear(end)
    await user.type(end, '00:01:00')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByText('Gospel end must not be before gospel start')
    ).toBeInTheDocument()
    expect(result).not.toHaveBeenCalled()
  })

  it('reverts on cancel', async () => {
    const user = userEvent.setup()
    renderComponent([queryMock])

    const start = await screen.findByLabelText('Gospel Start')
    await user.clear(start)
    await user.type(start, '2:30')
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(start).toHaveValue('01:02:05'))
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('shows error snackbar when mutation fails', async () => {
    const user = userEvent.setup()
    renderComponent([
      queryMock,
      buildUpdateMock({
        result: undefined,
        error: new GraphQLError(
          'Media Validation timestamps must be zero or greater',
          {
            extensions: { code: 'BAD_USER_INPUT' }
          }
        ) as unknown as Error
      })
    ])

    const start = await screen.findByLabelText('Gospel Start')
    await user.clear(start)
    await user.type(start, '2:30')
    await selectNotAssessed(user, 'Gospel Presentation')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByText('Failed to update media validation')
    ).toBeInTheDocument()
  })
})
