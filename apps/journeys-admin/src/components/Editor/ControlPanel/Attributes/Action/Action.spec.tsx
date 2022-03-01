import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { EditorProvider } from '@core/journeys/ui'
import { InMemoryCache } from '@apollo/client'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../libs/context'
import { Action, NAVIGATE_ACTION_UPDATE, ACTION_DELETE } from './Action'
import { steps } from './data'

describe('Action', () => {
  const selectedStep = steps[1]
  const selectedBlock = selectedStep?.children[0].children[3]

  it('shows default select option', () => {
    const { getByText } = render(
      <MockedProvider>
        <Action />
      </MockedProvider>
    )
    expect(getByText('Select an Action...')).toBeInTheDocument()
  })

  it('changes action to navigateAction', async () => {
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
        blockUpdateNavigateAction: {
          id: 'journeyId',
          gtmEventName: 'gtmEventName'
        }
      }
    }))

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: NAVIGATE_ACTION_UPDATE,
              variables: {
                id: selectedBlock?.id,
                journeyId: 'journeyId',
                input: {}
              }
            },
            result
          }
        ]}
        cache={cache}
      >
        <JourneyProvider
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps, selectedBlock, selectedStep }}>
            <Action />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByText('URL/Website'))
    fireEvent.click(getByText('Next Step'))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['ButtonBlock:button1.id']?.action).toEqual({
      gtmEventName: 'gtmEventName'
    })
  })

  it('shows properties for current action', () => {
    const { getByText } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Action />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByText('URL/Website')).toBeInTheDocument()
  })

  it('shows properties for new action selected', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <Action />
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'Select an Action...' }))
    await waitFor(() =>
      expect(getByText('Another Journey')).toBeInTheDocument()
    )
    fireEvent.click(getByRole('option', { name: 'Another Journey' }))
    await waitFor(() =>
      expect(getByText('Select the Journey...')).toBeInTheDocument()
    )
  })

  it('deletes action from block', async () => {
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
          id: 'journeyId'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ACTION_DELETE,
              variables: {
                id: selectedBlock?.id
              }
            },
            result
          }
        ]}
        cache={cache}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Action />
        </EditorProvider>
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'URL/Website' })).toBeInTheDocument()
    fireEvent.mouseDown(getByRole('button', { name: 'URL/Website' }))
    fireEvent.click(getByRole('option', { name: 'Select an Action...' }))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['ButtonBlock:button1.id']?.action).toBeNull()
  })
})
