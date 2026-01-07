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

import { getCurrentAction } from './utils/getCurrentAction'
import { getFilteredActions } from './utils/getFilteredActions'
import { getNewAction } from './utils/getNewAction'
import type { MetaAction, MetaActionType } from './utils/metaActions'

import { BlockEventLabel } from '../../../../../../../../../__generated__/globalTypes'
import {
  MetaActionButtonEventLabelUpdate,
  MetaActionButtonEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/MetaActionButtonEventLabelUpdate'
import {
  MetaActionCardEventLabelUpdate,
  MetaActionCardEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/MetaActionCardEventLabelUpdate'
import {
  MetaActionRadioOptionEventLabelUpdate,
  MetaActionRadioOptionEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/MetaActionRadioOptionEventLabelUpdate'
import {
  MetaActionVideoEndEventLabelUpdate,
  MetaActionVideoEndEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/MetaActionVideoEndEventLabelUpdate'
import {
  MetaActionVideoStartEventLabelUpdate,
  MetaActionVideoStartEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/MetaActionVideoStartEventLabelUpdate'

interface MetaActionProps {
  videoActionType?: 'start' | 'complete'
  label?: string
  showHelperText?: boolean
}

export const META_ACTION_CARD_EVENT_LABEL_UPDATE = gql`
  mutation MetaActionCardEventLabelUpdate(
    $id: ID!
    $eventLabel: BlockEventLabel
  ) {
    cardBlockUpdate(id: $id, input: { eventLabel: $eventLabel }) {
      id
      eventLabel
    }
  }
`

export const META_ACTION_BUTTON_EVENT_LABEL_UPDATE = gql`
  mutation MetaActionButtonEventLabelUpdate(
    $id: ID!
    $eventLabel: BlockEventLabel
  ) {
    buttonBlockUpdate(id: $id, input: { eventLabel: $eventLabel }) {
      id
      eventLabel
    }
  }
`

export const META_ACTION_RADIO_OPTION_EVENT_LABEL_UPDATE = gql`
  mutation MetaActionRadioOptionEventLabelUpdate(
    $id: ID!
    $eventLabel: BlockEventLabel
  ) {
    radioOptionBlockUpdate(id: $id, input: { eventLabel: $eventLabel }) {
      id
      eventLabel
    }
  }
`

export const META_ACTION_VIDEO_START_EVENT_LABEL_UPDATE = gql`
  mutation MetaActionVideoStartEventLabelUpdate(
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

export const META_ACTION_VIDEO_END_EVENT_LABEL_UPDATE = gql`
  mutation MetaActionVideoEndEventLabelUpdate(
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

export function MetaAction({
  videoActionType,
  label,
  showHelperText = true
}: MetaActionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const [cardEventLabelUpdate] = useMutation<
    MetaActionCardEventLabelUpdate,
    MetaActionCardEventLabelUpdateVariables
  >(META_ACTION_CARD_EVENT_LABEL_UPDATE)

  const [buttonEventLabelUpdate] = useMutation<
    MetaActionButtonEventLabelUpdate,
    MetaActionButtonEventLabelUpdateVariables
  >(META_ACTION_BUTTON_EVENT_LABEL_UPDATE)

  const [radioOptionEventLabelUpdate] = useMutation<
    MetaActionRadioOptionEventLabelUpdate,
    MetaActionRadioOptionEventLabelUpdateVariables
  >(META_ACTION_RADIO_OPTION_EVENT_LABEL_UPDATE)

  const [videoStartEventLabelUpdate] = useMutation<
    MetaActionVideoStartEventLabelUpdate,
    MetaActionVideoStartEventLabelUpdateVariables
  >(META_ACTION_VIDEO_START_EVENT_LABEL_UPDATE)

  const [videoEndEventLabelUpdate] = useMutation<
    MetaActionVideoEndEventLabelUpdate,
    MetaActionVideoEndEventLabelUpdateVariables
  >(META_ACTION_VIDEO_END_EVENT_LABEL_UPDATE)

  function handleChange(event: SelectChangeEvent): void {
    if (selectedBlock == null) return

    const previousAction = getCurrentAction(selectedBlock, videoActionType)
    const nextAction = getNewAction(event.target.value)
    if (previousAction.type === nextAction.type) return

    const blockId = selectedBlock.id
    const blockTypename = selectedBlock.__typename

    add({
      parameters: {
        execute: { metaActionType: nextAction.type },
        undo: { metaActionType: previousAction.type }
      },
      execute({ metaActionType }) {
        const eventLabel: BlockEventLabel | null =
          metaActionType === 'none' ? null : metaActionType

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

  const metaAction = getCurrentAction(selectedBlock, videoActionType)

  const filteredActions: MetaAction[] = getFilteredActions(
    selectedBlock,
    videoActionType
  )

  const displayLabel = label ?? t('Event to track:')

  return (
    <>
      <Stack sx={{ px: 4, pt: 0, pb: 3 }} data-testid="MetaActionSelect">
        <FormControl variant="filled">
          <InputLabel sx={{ '&.MuiFormLabel-root': { lineHeight: 1.5 } }}>
            {displayLabel}
          </InputLabel>

          <Select
            onChange={handleChange}
            value={metaAction.type as MetaActionType}
            IconComponent={ChevronDownIcon}
          >
            {filteredActions.map(({ type, label }) => {
              return (
                <MenuItem key={`button-action-${label}`} value={type}>
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
