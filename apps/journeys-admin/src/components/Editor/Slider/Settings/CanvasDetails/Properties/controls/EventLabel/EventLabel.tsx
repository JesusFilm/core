import { gql, useMutation } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import { useCommand } from '@core/journeys/ui/CommandProvider'

import type { EventLabelOption, EventLabelType } from './utils/eventLabels'
import { getCurrentEventLabel } from './utils/getCurrentEventLabel'
import { getFilteredEventLabels } from './utils/getFilteredEventLabels'
import { getEventLabelOption } from './utils/getEventLabelOption'

import { BlockEventLabel } from '../../../../../../../../../__generated__/globalTypes'
import {
  EventLabelButtonEventLabelUpdate,
  EventLabelButtonEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/EventLabelButtonEventLabelUpdate'
import {
  EventLabelCardEventLabelUpdate,
  EventLabelCardEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/EventLabelCardEventLabelUpdate'
import {
  EventLabelRadioOptionEventLabelUpdate,
  EventLabelRadioOptionEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/EventLabelRadioOptionEventLabelUpdate'
import {
  EventLabelVideoEndEventLabelUpdate,
  EventLabelVideoEndEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/EventLabelVideoEndEventLabelUpdate'
import {
  EventLabelVideoStartEventLabelUpdate,
  EventLabelVideoStartEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/EventLabelVideoStartEventLabelUpdate'

interface EventLabelProps {
  videoActionType?: 'start' | 'complete'
  label?: string
  showHelperText?: boolean
}

export const EVENT_LABEL_CARD_EVENT_LABEL_UPDATE = gql`
  mutation EventLabelCardEventLabelUpdate(
    $id: ID!
    $eventLabel: BlockEventLabel
  ) {
    cardBlockUpdate(id: $id, input: { eventLabel: $eventLabel }) {
      id
      eventLabel
    }
  }
`

export const EVENT_LABEL_BUTTON_EVENT_LABEL_UPDATE = gql`
  mutation EventLabelButtonEventLabelUpdate(
    $id: ID!
    $eventLabel: BlockEventLabel
  ) {
    buttonBlockUpdate(id: $id, input: { eventLabel: $eventLabel }) {
      id
      eventLabel
    }
  }
`

export const EVENT_LABEL_RADIO_OPTION_EVENT_LABEL_UPDATE = gql`
  mutation EventLabelRadioOptionEventLabelUpdate(
    $id: ID!
    $eventLabel: BlockEventLabel
  ) {
    radioOptionBlockUpdate(id: $id, input: { eventLabel: $eventLabel }) {
      id
      eventLabel
    }
  }
`

export const EVENT_LABEL_VIDEO_START_EVENT_LABEL_UPDATE = gql`
  mutation EventLabelVideoStartEventLabelUpdate(
    $id: ID!
    $eventLabel: BlockEventLabel
  ) {
    videoBlockUpdate(id: $id, input: { eventLabel: $eventLabel }) {
      id
      eventLabel
      endEventLabel
    }
  }
`

export const EVENT_LABEL_VIDEO_END_EVENT_LABEL_UPDATE = gql`
  mutation EventLabelVideoEndEventLabelUpdate(
    $id: ID!
    $endEventLabel: BlockEventLabel
  ) {
    videoBlockUpdate(id: $id, input: { endEventLabel: $endEventLabel }) {
      id
      eventLabel
      endEventLabel
    }
  }
`

export function EventLabel({
  videoActionType,
  label,
  showHelperText = true
}: EventLabelProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const [cardEventLabelUpdate] = useMutation<
    EventLabelCardEventLabelUpdate,
    EventLabelCardEventLabelUpdateVariables
  >(EVENT_LABEL_CARD_EVENT_LABEL_UPDATE)

  const [buttonEventLabelUpdate] = useMutation<
    EventLabelButtonEventLabelUpdate,
    EventLabelButtonEventLabelUpdateVariables
  >(EVENT_LABEL_BUTTON_EVENT_LABEL_UPDATE)

  const [radioOptionEventLabelUpdate] = useMutation<
    EventLabelRadioOptionEventLabelUpdate,
    EventLabelRadioOptionEventLabelUpdateVariables
  >(EVENT_LABEL_RADIO_OPTION_EVENT_LABEL_UPDATE)

  const [videoStartEventLabelUpdate] = useMutation<
    EventLabelVideoStartEventLabelUpdate,
    EventLabelVideoStartEventLabelUpdateVariables
  >(EVENT_LABEL_VIDEO_START_EVENT_LABEL_UPDATE)

  const [videoEndEventLabelUpdate] = useMutation<
    EventLabelVideoEndEventLabelUpdate,
    EventLabelVideoEndEventLabelUpdateVariables
  >(EVENT_LABEL_VIDEO_END_EVENT_LABEL_UPDATE)

  function handleChange(event: SelectChangeEvent): void {
    if (selectedBlock == null) return

    const previousEventLabel = getCurrentEventLabel(
      t,
      selectedBlock,
      videoActionType
    )
    const nextEventLabel = getEventLabelOption(
      t,
      event.target.value as EventLabelType | null
    )
    if (previousEventLabel.type === nextEventLabel.type) return

    const blockId = selectedBlock.id
    const blockTypename = selectedBlock.__typename

    add({
      parameters: {
        execute: { eventLabelType: nextEventLabel.type },
        undo: { eventLabelType: previousEventLabel.type }
      },
      execute({ eventLabelType }) {
        const eventLabel: BlockEventLabel | null =
          eventLabelType === 'none' ? null : eventLabelType

        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep
        })

        switch (blockTypename) {
          case 'CardBlock':
            void cardEventLabelUpdate({
              variables: { id: blockId, eventLabel },
              optimisticResponse: {
                cardBlockUpdate: {
                  __typename: 'CardBlock',
                  id: blockId,
                  eventLabel
                }
              }
            })
            return
          case 'ButtonBlock':
            void buttonEventLabelUpdate({
              variables: { id: blockId, eventLabel },
              optimisticResponse: {
                buttonBlockUpdate: {
                  __typename: 'ButtonBlock',
                  id: blockId,
                  eventLabel
                }
              }
            })
            return
          case 'RadioOptionBlock':
            void radioOptionEventLabelUpdate({
              variables: { id: blockId, eventLabel },
              optimisticResponse: {
                radioOptionBlockUpdate: {
                  __typename: 'RadioOptionBlock',
                  id: blockId,
                  eventLabel
                }
              }
            })
            return
          case 'VideoBlock': {
            if (videoActionType === 'complete') {
              void videoEndEventLabelUpdate({
                variables: { id: blockId, endEventLabel: eventLabel },
                optimisticResponse: {
                  videoBlockUpdate: {
                    __typename: 'VideoBlock',
                    id: blockId,
                    eventLabel: selectedBlock.eventLabel ?? null,
                    endEventLabel: eventLabel
                  }
                }
              })
              return
            }
            void videoStartEventLabelUpdate({
              variables: { id: blockId, eventLabel },
              optimisticResponse: {
                videoBlockUpdate: {
                  __typename: 'VideoBlock',
                  id: blockId,
                  eventLabel,
                  endEventLabel: selectedBlock.endEventLabel ?? null
                }
              }
            })
            return
          }
          default:
            return
        }
      }
    })
  }

  const currentEventLabel = getCurrentEventLabel(
    t,
    selectedBlock,
    videoActionType
  )

  const filteredEventLabels: EventLabelOption[] = getFilteredEventLabels(
    t,
    selectedBlock,
    videoActionType
  )

  const displayLabel = label ?? t('Event to track:')

  return (
    <>
      <Stack sx={{ px: 4, pt: 0, pb: 3 }} data-testid="EventLabelSelect">
        <FormControl variant="filled">
          <InputLabel sx={{ '&.MuiFormLabel-root': { lineHeight: 1.5 } }}>
            {displayLabel}
          </InputLabel>

          <Select
            onChange={handleChange}
            value={currentEventLabel.type as EventLabelType}
            IconComponent={ChevronDownIcon}
          >
            {filteredEventLabels.map(({ type, label }) => {
              return (
                <MenuItem key={`event-label-${label}`} value={type}>
                  {t(label)}
                </MenuItem>
              )
            })}
          </Select>
          {showHelperText && (
            <FormHelperText sx={{ mb: 2, mt: 3 }}>
              {t(
                'Pick the event label you want to appear in analytics. Tracking covers user actions in every project created from your template.'
              )}
            </FormHelperText>
          )}
        </FormControl>
      </Stack>
    </>
  )
}
