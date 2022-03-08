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

  it('shows no action by default', () => {
    const { getByText } = render(
      <MockedProvider>
        <Action />
      </MockedProvider>
    )
    expect(getByText('None')).toBeInTheDocument()
  })

  it('disables Next Step option if there is no next step', async () => {
    const selectedStep = steps[4]
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedStep, steps }}>
          <Action />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button'))
    await waitFor(() =>
      expect(getByRole('option', { name: 'Next Step' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
    )
  })

  it('changes action to NavigateAction when Next Step is selected', async () => {
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
          gtmEventName: 'gtmEventName',
          __typename: 'NavigateAction'
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
      gtmEventName: 'gtmEventName',
      __typename: 'NavigateAction'
    })
  })

  it('shows card selector when Selected Card is selected', async () => {
    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider>
        <Action />
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'None' }))
    await waitFor(() => expect(getByText('Selected Card')).toBeInTheDocument())
    fireEvent.click(getByRole('option', { name: 'Selected Card' }))
    await waitFor(() =>
      expect(getByTestId('horizontal-select')).toBeInTheDocument()
    )
  })

  it('shows journey dropdown when Another Journey is selected', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <Action />
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'None' }))
    await waitFor(() =>
      expect(getByText('Another Journey')).toBeInTheDocument()
    )
    fireEvent.click(getByRole('option', { name: 'Another Journey' }))
    await waitFor(() =>
      expect(getByText('Select the Journey...')).toBeInTheDocument()
    )
  })

  it('shows url input text box when URL/Website is selected', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <Action />
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'None' }))
    await waitFor(() => expect(getByText('Selected Card')).toBeInTheDocument())
    fireEvent.click(getByRole('option', { name: 'URL/Website' }))
    await waitFor(() =>
      expect(getByText('Paste URL here...')).toBeInTheDocument()
    )
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
    expect(getByText('URL/Website')).toBeInTheDocument()

    expect(getByRole('button', { name: 'URL/Website' })).toBeInTheDocument()
    fireEvent.mouseDown(getByRole('button', { name: 'URL/Website' }))
    fireEvent.click(getByRole('option', { name: 'None' }))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['ButtonBlock:button1.id']?.action).toBeNull()
  })
})
