import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../__generated__/GetJourney'
import { BLOCK_ACTION_DELETE } from '../../../../../../../../libs/useBlockActionDeleteMutation/useBlockActionDeleteMutation'

import { Action } from './Action'
import { steps } from './data'

import { blockActionEmailUpdateMock } from '../../../../../../../../libs/useBlockActionEmailUpdateMutation/useBlockActionEmailUpdateMutation.mock'
import { blockActionLinkUpdateMock } from '../../../../../../../../libs/useBlockActionLinkUpdateMutation/useBlockActionLinkUpdateMutation.mock'
import userEvent from '@testing-library/user-event'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const selectedStep = steps[1]
  const selectedBlock = selectedStep?.children[0].children[3]

  const buttonBlockWithLinkAction = {
    ...selectedBlock,
    action: {
      __typename: 'LinkAction',
      url: 'https://example.com',
      customizable: false,
      parentStepId: selectedStep?.id
    }
  } as TreeBlock<ButtonBlock>

  const buttonBlockWithEmailAction = {
    ...selectedBlock,
    action: {
      __typename: 'EmailAction',
      email: 'test@example.com',
      customizable: false,
      parentStepId: selectedStep?.id
    }
  } as TreeBlock<ButtonBlock>

  it('shows no action by default', () => {
    const { getByText } = render(
      <MockedProvider>
        <Action />
      </MockedProvider>
    )
    expect(getByText('None')).toBeInTheDocument()
  })

  it('shows "back to map button" when Selected Card is selected', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <Action />
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('combobox'))
    await waitFor(() => expect(getByText('Selected Card')).toBeInTheDocument())
    fireEvent.click(getByRole('option', { name: 'Selected Card' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'back to map' })).toBeInTheDocument()
    )
  })

  it('shows url input text box when URL/Website is selected', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <Action />
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('combobox'))
    await waitFor(() => expect(getByText('Selected Card')).toBeInTheDocument())
    fireEvent.click(getByRole('option', { name: 'URL/Website' }))
    await waitFor(() =>
      expect(getByText('Paste URL here...')).toBeInTheDocument()
    )
  })

  it('shows customization toggle when URL/Website is selected', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[{
          request: {
            ...blockActionLinkUpdateMock.request,
            variables: {
              id: "button1.id",
              input: {
                "url": "https://example.com",
                customizable: false,
                "parentStepId": "step1.id"
              }
            }
          }, result: blockActionLinkUpdateMock.result
        }]}
      >
        <JourneyProvider
          value={{
            journey: { template: true } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider
            initialState={{
              selectedBlock: buttonBlockWithLinkAction,
              selectedStep
            }}
          >
            <Action />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('combobox'))
    await waitFor(() => expect(getByRole('option', { name: 'URL/Website' })).toBeInTheDocument())
    fireEvent.click(getByRole('option', { name: 'URL/Website' }))

    await waitFor(() => {
      expect(getByText('Needs Customization')).toBeInTheDocument()
      expect(
        getByRole('checkbox', { name: 'Toggle customizable' })
      ).toBeInTheDocument()
    })
  })

  it('shows customization toggle when Email is selected', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[{
          request: {
            ...blockActionEmailUpdateMock.request,
            variables: {
              id: "button1.id",
              input: {
                "email": "test@example.com",
                customizable: false,
                parentStepId: "step1.id"
              }
            }
          }, result: blockActionEmailUpdateMock.result
        }]}
      >
        <JourneyProvider
          value={{
            journey: { template: true } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider
            initialState={{
              selectedBlock: buttonBlockWithEmailAction,
              selectedStep
            }}
          >
            <Action />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('combobox'))
    await waitFor(() => expect(getByRole('option', { name: 'Email' })).toBeInTheDocument())
    fireEvent.click(getByRole('option', { name: 'Email' }))

    await waitFor(() => {
      expect(getByText('Needs Customization')).toBeInTheDocument()
      expect(
        getByRole('checkbox', { name: 'Toggle customizable' })
      ).toBeInTheDocument()
    })
  })

  it('shows focus text input on select change to email or url', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[{
          request: {
            ...blockActionEmailUpdateMock.request,
            variables: {
              id: "button1.id",
              input: {
                "email": "test@example.com",
                customizable: false,
                parentStepId: "step1.id"
              }
            }
          },
          result: blockActionEmailUpdateMock.result
        },
        {
          request: {
            ...blockActionLinkUpdateMock.request,
            variables: {
              id: "button1.id",
              input: {
                "url": "https://example.com",
                customizable: false,
                "parentStepId": "step1.id"
              }
            }
          }, result: blockActionLinkUpdateMock.result
        }]}
      >
        <JourneyProvider
          value={{
            journey: { template: true } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider
            initialState={{
              selectedBlock: buttonBlockWithEmailAction,
              selectedStep
            }}
          >
            <Action />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    // starts at email as default so we have to assert URL first
    fireEvent.mouseDown(getByRole('combobox'))
    await waitFor(() => expect(getByRole('option', { name: 'URL/Website' })).toBeInTheDocument())
    userEvent.click(getByRole('option', { name: 'URL/Website' }))
    await waitFor(() => expect(getByRole('textbox', { name: 'Paste URL here...' })).toHaveFocus())

    // then switch to email
    fireEvent.mouseDown(getByRole('combobox'))
    await waitFor(() => expect(getByRole('option', { name: 'Email' })).toBeInTheDocument())
    userEvent.click(getByRole('option', { name: 'Email' }))
    await waitFor(() => expect(getByRole('textbox', { name: 'Paste Email here...' })).toHaveFocus())
  })


  it('should filter out LinkAction and EmailAction options for submit buttons', async () => {
    const submitButtonBlock = {
      ...selectedBlock,
      submitEnabled: true
    } as TreeBlock<ButtonBlock>

    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: submitButtonBlock }}>
          <Action />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(screen.getByRole('combobox'))

    expect(screen.queryByText('URL/Website')).not.toBeInTheDocument()
    expect(screen.queryByText('Send Email')).not.toBeInTheDocument()

    expect(screen.getByRole('option', { name: 'None' })).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Selected Card' })
    ).toBeInTheDocument()
  })

  it('deletes action from block, when no action selected', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'ButtonBlock:button1.id' }],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'ButtonBlock:button1.id': {
        ...selectedBlock
      }
    })

    const result = jest.fn(() => ({
      data: {
        blockDeleteAction: {
          id: 'button1.id'
        }
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_ACTION_DELETE,
              variables: {
                id: selectedBlock?.id
              }
            },
            result
          }
        ]}
        cache={cache}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              language: {
                __typename: 'Language',
                id: '529',
                bcp47: 'en',
                iso3: 'eng'
              }
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <Action />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('URL/Website')).toBeInTheDocument()

    expect(getByRole('combobox')).toHaveTextContent('URL/Website')
    fireEvent.mouseDown(getByRole('combobox'))
    fireEvent.click(getByRole('option', { name: 'None' }))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['ButtonBlock:button1.id']?.action).toBeNull()
  })
})
