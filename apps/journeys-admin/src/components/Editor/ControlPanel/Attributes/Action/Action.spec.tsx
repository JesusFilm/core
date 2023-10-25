import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'

import { ACTION_DELETE, Action, NAVIGATE_ACTION_UPDATE } from './Action'
import { steps } from './data'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
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

  it('enables Next Step option if there is a next step', async () => {
    const selectedStep = {
      ...steps[1],
      nextBlockId: null
    }
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedStep, steps }}>
          <Action />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button'))
    await waitFor(() =>
      expect(getByRole('option', { name: 'Next Step' })).not.toHaveAttribute(
        'aria-disabled'
      )
    )
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
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base,
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
                id: selectedBlock?.id,
                journeyId: 'journeyId'
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

    expect(getByRole('button', { name: 'URL/Website' })).toBeInTheDocument()
    fireEvent.mouseDown(getByRole('button', { name: 'URL/Website' }))
    fireEvent.click(getByRole('option', { name: 'None' }))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['ButtonBlock:button1.id']?.action).toBeNull()
  })
})
