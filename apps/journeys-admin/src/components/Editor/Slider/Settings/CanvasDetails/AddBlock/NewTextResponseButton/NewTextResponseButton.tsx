import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TEXT_RESPONSE_FIELDS } from '@core/journeys/ui/TextResponse/textResponseFields'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import type {
  BlockFields_CardBlock as CardBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../__generated__/BlockFields'
import type { TextResponseBlockCreate } from '../../../../../../../../__generated__/TextResponseBlockCreate'
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand/useBlockCreateCommand'
import { Button } from '../Button'

export const TEXT_RESPONSE_BLOCK_CREATE = gql`
  ${TEXT_RESPONSE_FIELDS}
  mutation TextResponseBlockCreate($input: TextResponseBlockCreateInput!) {
    textResponseBlockCreate(input: $input) {
      id
      parentBlockId
      parentOrder
      ...TextResponseFields
    }
  }
`

export function NewTextResponseButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponseBlockCreate, { loading }] =
    useMutation<TextResponseBlockCreate>(TEXT_RESPONSE_BLOCK_CREATE)
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()
  const { addBlock } = useBlockCreateCommand()

  function handleClick(): void {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card == null || journey == null) return

    const textResponseBlock: TextResponseBlock = {
      id: uuidv4(),
      parentBlockId: card.id,
      parentOrder: card.children.length ?? 0,
      label: t('Your answer here'),
      hint: null,
      minRows: null,
      type: null,
      routeId: null,
      integrationId: null,
      __typename: 'TextResponseBlock'
    }
    addBlock({
      block: textResponseBlock,
      execute() {
        void textResponseBlockCreate({
          variables: {
            input: {
              id: textResponseBlock.id,
              journeyId: journey.id,
              parentBlockId: textResponseBlock.parentBlockId,
              label: textResponseBlock.label
            }
          },
          optimisticResponse: {
            textResponseBlockCreate: textResponseBlock
          },
          update(cache, { data }) {
            blockCreateUpdate(cache, journey?.id, data?.textResponseBlockCreate)
          }
        })
      }
    })
  }
  return (
    <Button
      icon={<TextInput1Icon />}
      value={t('Text Input')}
      onClick={handleClick}
      testId="NewTextResponseButton"
      disabled={loading}
    />
  )
}
