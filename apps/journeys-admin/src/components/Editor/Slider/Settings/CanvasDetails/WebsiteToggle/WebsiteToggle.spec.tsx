import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../../../../../__generated__/JourneyFields'
import {
  JourneySettingsUpdate,
  JourneySettingsUpdateVariables
} from '../../../../../../../__generated__/JourneySettingsUpdate'
import { JOURNEY_SETTINGS_UPDATE } from '../../../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation'
import { CommandRedoItem } from '../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../Toolbar/Items/CommandUndoItem'

import { WebsiteToggle } from '.'

describe('WebsiteToggle', () => {
  const defaultJourney = {
    __typename: 'Journey',
    id: 'journey.id',
    title: 'Internal Title',
    description: 'Internal Description',
    strategySlug: null,
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'LanguageName',
          value: 'English',
          primary: true
        }
      ]
    },
    tags: [],
    website: null
  } as unknown as Journey

  const getJourneySettingsUpdateMock = (
    website: boolean
  ): MockedResponse<JourneySettingsUpdate, JourneySettingsUpdateVariables> => {
    return {
      request: {
        query: JOURNEY_SETTINGS_UPDATE,
        variables: {
          id: defaultJourney.id,
          input: {
            website
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyUpdate: {
            ...defaultJourney,
            website
          }
        }
      }))
    }
  }

  it('should update to website mode', async () => {
    const mockWebsiteTrueUpdate = getJourneySettingsUpdateMock(true)

    render(
      <MockedProvider mocks={[mockWebsiteTrueUpdate]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <WebsiteToggle />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Journey' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Website' }))
    await waitFor(() => expect(mockWebsiteTrueUpdate.result).toHaveBeenCalled())
  })

  it('should update to journey mode', async () => {
    const journey = {
      ...defaultJourney,
      website: true
    }

    const mockWebsiteFalseUpdate = getJourneySettingsUpdateMock(false)

    render(
      <MockedProvider mocks={[mockWebsiteFalseUpdate]}>
        <JourneyProvider value={{ journey }}>
          <EditorProvider>
            <WebsiteToggle />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Website' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Journey' }))
    await waitFor(() =>
      expect(mockWebsiteFalseUpdate.result).toHaveBeenCalled()
    )
  })

  it('should not update when clicking the already selected option', async () => {
    const mockWebsiteTrueUpdate = getJourneySettingsUpdateMock(true)

    render(
      <MockedProvider mocks={[mockWebsiteTrueUpdate]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <WebsiteToggle />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Journey' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Journey' }))
    await waitFor(() =>
      expect(mockWebsiteTrueUpdate.result).not.toHaveBeenCalled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Journey' }))
  })

  it('should undo and redo', async () => {
    const journey = {
      ...defaultJourney,
      website: false
    }

    const mockWebsiteTrueUpdate = getJourneySettingsUpdateMock(true)
    const mockWebsiteTrueSecondUpdate = getJourneySettingsUpdateMock(true)
    const mockWebsiteFalseUpdate = getJourneySettingsUpdateMock(false)

    render(
      <MockedProvider
        mocks={[
          mockWebsiteTrueUpdate,
          mockWebsiteFalseUpdate,
          mockWebsiteTrueSecondUpdate
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <EditorProvider>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <WebsiteToggle />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Journey' })).toHaveClass(
      'Mui-selected'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Website' }))
    await waitFor(() => expect(mockWebsiteTrueUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(mockWebsiteFalseUpdate.result).toHaveBeenCalled()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() =>
      expect(mockWebsiteTrueSecondUpdate.result).toHaveBeenCalled()
    )
  })
})
