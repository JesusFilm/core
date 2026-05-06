import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { SPACER_FIELDS } from '@core/journeys/ui/Spacer/spacerFields'
import Crop169Icon from '@core/shared/ui/icons/Crop169'

import type { BlockFields_CardBlock as CardBlock } from '../../../../../../../../__generated__/BlockFields'
import { BlockFields_SpacerBlock as SpacerBlock } from '../../../../../../../../__generated__/BlockFields'
import { SpacerBlockCreate } from '../../../../../../../../__generated__/SpacerBlockCreate'
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand/useBlockCreateCommand'
import { Button } from '../Button'

export const SPACER_BLOCK_CREATE = gql`
  ${SPACER_FIELDS}
  mutation SpacerBlockCreate($input: SpacerBlockCreateInput!) {
    spacerBlockCreate(input: $input) {
      id
      parentBlockId
      parentOrder
      ...SpacerFields
    }
  }
`

export function NewSpacerButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [spacerBlockCreate, { loading }] =
    useMutation<SpacerBlockCreate>(SPACER_BLOCK_CREATE)
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

    const spacerBlock: SpacerBlock = {
      id: uuidv4(),
      __typename: 'SpacerBlock',
      parentBlockId: card.id,
      parentOrder: card.children.length ?? 0,
      spacing: 100
    }

    addBlock({
      block: spacerBlock,
      execute() {
        void spacerBlockCreate({
          variables: {
            input: {
              id: spacerBlock.id,
              journeyId: journey.id,
              parentBlockId: spacerBlock.parentBlockId,
              spacing: spacerBlock.spacing
            }
          },
          optimisticResponse: {
            spacerBlockCreate: spacerBlock
          },
          update(cache, { data }) {
            blockCreateUpdate(cache, journey?.id, data?.spacerBlockCreate)
          }
        })
      }
    })
  }

  return (
    <Button
      icon={<Crop169Icon />}
      value={t('Spacer')}
      onClick={handleClick}
      testId="NewSpacerButton"
      disabled={loading}
    />
  )
}
