import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { RADIO_OPTION_FIELDS } from '@core/journeys/ui/RadioOption/radioOptionFields'
import { RADIO_QUESTION_FIELDS } from '@core/journeys/ui/RadioQuestion/radioQuestionFields'
import type { TreeBlock } from '@core/journeys/ui/block'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'

import type { BlockFields_CardBlock as CardBlock } from '../../../../../../../../__generated__/BlockFields'
import type { RadioQuestionBlockCreate } from '../../../../../../../../__generated__/RadioQuestionBlockCreate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'
import { Button } from '../Button'

export const RADIO_QUESTION_BLOCK_CREATE = gql`
  ${RADIO_QUESTION_FIELDS}
  ${RADIO_OPTION_FIELDS}
  mutation RadioQuestionBlockCreate(
    $input: RadioQuestionBlockCreateInput!
    $radioOptionBlockCreateInput1: RadioOptionBlockCreateInput!
    $radioOptionBlockCreateInput2: RadioOptionBlockCreateInput!
  ) {
    radioQuestionBlockCreate(input: $input) {
      id
      parentBlockId
      parentOrder
      ...RadioQuestionFields
    }
    radioOption1: radioOptionBlockCreate(input: $radioOptionBlockCreateInput1) {
      id
      parentBlockId
      parentOrder
      ...RadioOptionFields
    }
    radioOption2: radioOptionBlockCreate(input: $radioOptionBlockCreateInput2) {
      id
      parentBlockId
      parentOrder
      ...RadioOptionFields
    }
  }
`

export function NewRadioQuestionButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [radioQuestionBlockCreate, { loading }] =
    useMutation<RadioQuestionBlockCreate>(RADIO_QUESTION_BLOCK_CREATE)
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()
  const { addBlockCommand } = useBlockCreateCommand()

  async function handleClick(): Promise<void> {
    const id = uuidv4()
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card != null && journey != null) {
      await addBlockCommand(radioQuestionBlockCreate, {
        variables: {
          input: {
            journeyId: journey.id,
            id,
            parentBlockId: card.id
          },
          radioOptionBlockCreateInput1: {
            journeyId: journey.id,
            parentBlockId: id,
            label: t('Option 1')
          },
          radioOptionBlockCreateInput2: {
            journeyId: journey.id,
            parentBlockId: id,
            label: t('Option 2')
          }
        },
        update(cache, { data }) {
          if (data?.radioQuestionBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newBlockRef = cache.writeFragment({
                    data: data.radioQuestionBlockCreate,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  const newRadioOption1BlockRef = cache.writeFragment({
                    data: data.radioOption1,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  const newRadioOption2BlockRef = cache.writeFragment({
                    data: data.radioOption2,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  return [
                    ...existingBlockRefs,
                    newBlockRef,
                    newRadioOption1BlockRef,
                    newRadioOption2BlockRef
                  ]
                }
              }
            })
          }
        }
      })
    }
  }

  return (
    <Button
      icon={<CheckContainedIcon />}
      value={t('Poll')}
      onClick={handleClick}
      testId="NewRadioQuestionButton"
      disabled={loading}
    />
  )
}
