import { gql, useMutation } from '@apollo/client'
import { sendGTMEvent } from '@next/third-parties/google'
import { useTranslation } from 'next-i18next'
import { usePlausible } from 'next-plausible'
import { ReactElement, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { RadioQuestionSubmissionEventCreateInput } from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { isActiveBlockOrDescendant, useBlocks } from '../../libs/block'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider'
import {
  JourneyPlausibleEvents,
  keyify,
  templateKeyify
} from '../../libs/plausibleHelpers'
// eslint-disable-next-line import/no-cycle
import { actionToTarget } from '../../libs/plausibleHelpers/plausibleHelpers'
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { RadioOption } from '../RadioOption'
import { RadioOptionFields } from '../RadioOption/__generated__/RadioOptionFields'

import { RadioQuestionFields } from './__generated__/RadioQuestionFields'
import {
  RadioQuestionSubmissionEventCreate,
  RadioQuestionSubmissionEventCreateVariables
} from './__generated__/RadioQuestionSubmissionEventCreate'
import { GridVariant } from './GridVariant'
import { ListVariant } from './ListVariant'

export const RADIO_QUESTION_SUBMISSION_EVENT_CREATE = gql`
  mutation RadioQuestionSubmissionEventCreate(
    $input: RadioQuestionSubmissionEventCreateInput!
  ) {
    radioQuestionSubmissionEventCreate(input: $input) {
      id
    }
  }
`

interface RadioQuestionProps extends TreeBlock<RadioQuestionFields> {
  uuid?: () => string
  wrappers?: WrappersProps
  addOption?: () => void
}

/**
 * RadioQuestion component that renders a radio question with selectable options.
 *
 * This component displays radio options in either a grid or list layout based on the
 * `gridView` property. It handles user interactions, tracks selections, and creates
 * submission events for analytics. The component supports both default/embed variants
 * (which track events) and admin variants (which don't).
 *
 * Features:
 * - Renders radio options as either GridVariant or ListVariant
 * - Tracks user selections and prevents multiple selections
 * - Creates submission events for analytics (Plausible and GTM)
 * - Clears selection when navigating away from the block
 * - Supports custom wrappers for editor mode
 * - Provides addOption callback for editor functionality
 *
 * @param {RadioQuestionProps} props - The component props
 * @param {string} props.id - The unique identifier of the radio question block (aliased as blockId)
 * @param {boolean | null} props.gridView - Whether to display options in a grid layout (true) or list layout (false/null)
 * @param {TreeBlock[]} props.children - Array of child blocks (radio options)
 * @param {() => string} [props.uuid] - Optional UUID generator function
 * @param {WrappersProps} [props.wrappers] - Optional wrapper props for block rendering
 * @param {() => void} [props.addOption] - Optional callback to add a new radio option, omit if the maximum number of options has been reached or pass undefined if the maximum number of options has been reached
 * @returns {ReactElement} The rendered radio question component (GridVariant or ListVariant)
 */

export function RadioQuestion({
  id: blockId,
  gridView,
  children,
  uuid = uuidv4,
  wrappers,
  addOption
}: RadioQuestionProps): ReactElement {
  const [radioQuestionSubmissionEventCreate] = useMutation<
    RadioQuestionSubmissionEventCreate,
    RadioQuestionSubmissionEventCreateVariables
  >(RADIO_QUESTION_SUBMISSION_EVENT_CREATE)
  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { variant, journey } = useJourney()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { blockHistory, treeBlocks } = useBlocks()
  const { t } = useTranslation('libs-journeys-ui')
  const activeBlock = blockHistory[blockHistory.length - 1]

  useEffect(() => {
    // test via e2e: radio selection is cleared when going back to card that is no longer rendered
    if (!isActiveBlockOrDescendant(blockId)) setSelectedId(null)
  }, [blockId, blockHistory])

  const heading =
    activeBlock != null
      ? getStepHeading(activeBlock.id, activeBlock.children, treeBlocks, t)
      : 'None'

  const handleClick = (
    radioOptionBlockId: string,
    radioOptionLabel: string
  ): void => {
    if (variant === 'default' || variant === 'embed') {
      const id = uuid()
      const input: RadioQuestionSubmissionEventCreateInput = {
        id,
        blockId,
        radioOptionBlockId,
        stepId: activeBlock?.id,
        label: heading,
        value: radioOptionLabel
      }
      void radioQuestionSubmissionEventCreate({
        variables: {
          input
        }
      })
      const radioOptionBlock = children.find(
        (child) =>
          child.id === radioOptionBlockId &&
          child.__typename === 'RadioOptionBlock'
      ) as TreeBlock<RadioOptionFields> | undefined
      if (journey != null && radioOptionBlock != null) {
        plausible('radioQuestionSubmit', {
          u: `${window.location.origin}/${journey.id}/${input.stepId}`,
          props: {
            ...input,
            key: keyify({
              stepId: input.stepId ?? '',
              event: 'radioQuestionSubmit',
              blockId: radioOptionBlock.id,
              target: radioOptionBlock.action,
              journeyId: journey?.id
            }),
            simpleKey: keyify({
              stepId: input.stepId ?? '',
              event: 'radioQuestionSubmit',
              blockId: radioOptionBlock.id,
              journeyId: journey?.id
            }),
            templateKey: templateKeyify({
              event: 'radioQuestionSubmit',
              target: actionToTarget(radioOptionBlock.action),
              journeyId: journey?.id
            })
          }
        })
        if (radioOptionBlock.eventLabel != null) {
          plausible(radioOptionBlock.eventLabel, {
            u: `${window.location.origin}/${journey.id}/${input.blockId}`,
            props: {
              ...input,
              key: keyify({
                stepId: input.stepId ?? '',
                event: radioOptionBlock.eventLabel,
                blockId: radioOptionBlock.id,
                target: radioOptionBlock.action,
                journeyId: journey?.id
              }),
              simpleKey: keyify({
                stepId: input.stepId ?? '',
                event: radioOptionBlock.eventLabel,
                blockId: radioOptionBlock.id,
                journeyId: journey?.id
              }),
              templateKey: templateKeyify({
                event: radioOptionBlock.eventLabel,
                journeyId: journey?.id
              })
            }
          })
        }
      }
      sendGTMEvent({
        event: 'radio_question_submission',
        eventId: id,
        blockId,
        radioOptionSelectedId: radioOptionBlockId,
        radioOptionSelectedLabel: radioOptionLabel,
        stepName: heading
      })
    }
    setSelectedId(radioOptionBlockId)
  }

  const options = children?.map(
    (option) =>
      option.__typename === 'RadioOptionBlock' &&
      (wrappers != null ? (
        <BlockRenderer
          block={{ ...option, gridView }}
          wrappers={wrappers}
          key={option.id}
        />
      ) : (
        <RadioOption
          {...option}
          key={option.id}
          selected={selectedId === option.id}
          disabled={Boolean(selectedId)}
          onClick={handleClick}
          gridView={gridView}
        />
      ))
  )

  return gridView === true ? (
    <GridVariant blockId={blockId} options={options} addOption={addOption} />
  ) : (
    <ListVariant blockId={blockId} options={options} addOption={addOption} />
  )
}
