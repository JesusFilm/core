import { gql, useMutation } from '@apollo/client'
import Box, { BoxProps } from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import { styled } from '@mui/material/styles'
import { ReactElement, useState } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '../../libs/block'
import { useBlocks } from '../../libs/block'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider'
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { RadioOption } from '../RadioOption'

import { RadioQuestionFields } from './__generated__/RadioQuestionFields'
import { RadioQuestionSubmissionEventCreate } from './__generated__/RadioQuestionSubmissionEventCreate'

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
  addOption?: ReactElement
}

const StyledRadioQuestion = styled(Box)<BoxProps>(({ theme }) => ({
  marginBottom: theme.spacing(4)
}))

export function RadioQuestion({
  id: blockId,
  children,
  uuid = uuidv4,
  wrappers,
  addOption
}: RadioQuestionProps): ReactElement {
  const [radioQuestionSubmissionEventCreate] =
    useMutation<RadioQuestionSubmissionEventCreate>(
      RADIO_QUESTION_SUBMISSION_EVENT_CREATE
    )
  const { variant } = useJourney()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { blockHistory, treeBlocks } = useBlocks()
  const { t } = useTranslation('libs-journeys-ui')
  const activeBlock = blockHistory[blockHistory.length - 1]

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
      void radioQuestionSubmissionEventCreate({
        variables: {
          input: {
            id,
            blockId,
            radioOptionBlockId,
            stepId: activeBlock?.id,
            label: heading,
            value: radioOptionLabel
          }
        }
      })
      TagManager.dataLayer({
        dataLayer: {
          event: 'radio_question_submission',
          eventId: id,
          blockId,
          radioOptionSelectedId: radioOptionBlockId,
          stepName: heading
        }
      })
    }
    setSelectedId(radioOptionBlockId)
  }

  const options = children?.map(
    (option) =>
      option.__typename === 'RadioOptionBlock' &&
      (wrappers != null ? (
        <BlockRenderer block={option} wrappers={wrappers} key={option.id} />
      ) : (
        <RadioOption
          {...option}
          key={option.id}
          selected={selectedId === option.id}
          disabled={Boolean(selectedId)}
          onClick={handleClick}
        />
      ))
  )

  return (
    <StyledRadioQuestion data-testid={`radioQuestion-${blockId}`}>
      <ButtonGroup orientation="vertical" variant="contained" fullWidth>
        {options}
        {addOption}
      </ButtonGroup>
    </StyledRadioQuestion>
  )
}
