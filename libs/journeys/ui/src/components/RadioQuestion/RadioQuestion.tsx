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
import { JourneyPlausibleEvents, keyify } from '../../libs/plausibleHelpers'
// eslint-disable-next-line import/no-cycle
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
  // addOption?: ReactElement
}

export function RadioQuestion({
  id: blockId,
  // gridView,
  children,
  uuid = uuidv4,
  wrappers,
  addOption
}: RadioQuestionProps): ReactElement {
  const gridView = true // TODO: remove this

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
              target: radioOptionBlock.action
            }),
            simpleKey: keyify({
              stepId: input.stepId ?? '',
              event: 'radioQuestionSubmit',
              blockId: radioOptionBlock.id
            })
          }
        })
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
