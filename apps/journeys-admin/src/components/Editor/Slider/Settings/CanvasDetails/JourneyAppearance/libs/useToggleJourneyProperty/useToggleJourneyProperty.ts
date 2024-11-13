import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../../../../../__generated__/JourneyFields'
import { useJourneyUpdateMutation } from '../../../../../../../../libs/useJourneyUpdateMutation'

export function useToggleJourneyProperty(
  field: keyof Pick<
    JourneyFields,
    | 'showHosts'
    | 'showChatButtons'
    | 'showReactionButtons'
    | 'showLogo'
    | 'showMenu'
    | 'showDisplayTitle'
  >
): [boolean, (checked: boolean) => void] {
  const { journey } = useJourney()
  const { add } = useCommand()
  const [journeyUpdate] = useJourneyUpdateMutation()

  function updateToggleProperty(checked: boolean): void {
    if (journey == null) return

    add({
      parameters: {
        execute: { value: checked },
        undo: { value: !checked }
      },
      execute({ value }) {
        void journeyUpdate({
          variables: {
            id: journey.id,
            input: {
              [field]: value
            }
          },
          optimisticResponse: {
            journeyUpdate: {
              ...journey,
              [field]: value
            }
          }
        })
      }
    })
  }

  return [journey?.[field] === true, updateToggleProperty]
}
