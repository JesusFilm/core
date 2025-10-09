import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../__generated__/GetJourney'
import { BLOCK_ACTION_DELETE } from '../../../../../../../../libs/useBlockActionDeleteMutation/useBlockActionDeleteMutation'

import { Action } from './Action'
import { steps } from './data'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Action', () => {
  const selectedStep = steps[1]
  const selectedBlock = selectedStep?.children[0].children[3]

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

  it('shows customization toggle when URL/Website is selected and journeyCustomization', async () => {
    const buttonBlockWithLinkAction = {
      ...selectedBlock,
      action: {
        __typename: 'LinkAction',
        url: 'http://example.com',
        customizable: false,
        parentStepId: selectedStep?.id
      }
    } as TreeBlock<ButtonBlock>

    const { getByRole, getByText } = render(
      <MockedProvider>
        <FlagsProvider flags={{ journeyCustomization: true }}>
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
        </FlagsProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(getByText('Customize')).toBeInTheDocument()
      expect(
        getByRole('checkbox', { name: 'Toggle customizable' })
      ).toBeInTheDocument()
    })
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
