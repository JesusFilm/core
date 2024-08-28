import { MockedResponse } from '@apollo/client/testing'
import { JourneyUpdateInput } from '../../../__generated__/globalTypes'
import {
  JourneySettingsUpdate,
  JourneySettingsUpdateVariables
} from '../../../__generated__/JourneySettingsUpdate'
import { JOURNEY_SETTINGS_UPDATE } from './useJourneyUpdateMutation'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

export const getJourneySettingsUpdateMock = <T extends JourneyUpdateInput>(
  input: T
): MockedResponse<JourneySettingsUpdate, JourneySettingsUpdateVariables> => {
  return {
    request: {
      query: JOURNEY_SETTINGS_UPDATE,
      variables: {
        id: defaultJourney.id,
        input
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyUpdate: {
          ...defaultJourney,
          ...input
        }
      }
    }))
  }
}
