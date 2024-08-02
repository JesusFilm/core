import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'
import type { TreeBlock } from '@core/journeys/ui/block'
import Type3Icon from '@core/shared/ui/icons/Type3'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../__generated__/BlockFields'
import { TypographyBlockCreate } from '../../../../../../../../__generated__/TypographyBlockCreate'
import { TypographyVariant } from '../../../../../../../../__generated__/globalTypes'
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'
import { Button } from '../Button'

export const TYPOGRAPHY_BLOCK_CREATE = gql`
  ${TYPOGRAPHY_FIELDS}
  mutation TypographyBlockCreate($input: TypographyBlockCreateInput!) {
    typographyBlockCreate(input: $input) {
      id
      parentBlockId
      ...TypographyFields
    }
  }
`

export function NewTypographyButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockCreate, { loading }] =
    useMutation<TypographyBlockCreate>(TYPOGRAPHY_BLOCK_CREATE)
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()
  const { addBlock } = useBlockCreateCommand()

  function handleClick(): void {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    const checkTypography = card?.children.map((block) =>
      block.children.find((child) => child.__typename === 'TypographyBlock')
    )
    if (card != null && checkTypography !== undefined && journey != null) {
      const typography: TreeBlock<TypographyBlock> = {
        id: uuidv4(),
        parentBlockId: card.id,
        parentOrder: card.children.length ?? 0,
        align: null,
        color: null,
        content: '',
        variant:
          checkTypography.length > 0
            ? TypographyVariant.body2
            : TypographyVariant.h1,
        __typename: 'TypographyBlock',
        children: []
      }

      void addBlock({
        block: typography,
        execute() {
          void typographyBlockCreate({
            variables: {
              input: {
                id: typography.id,
                journeyId: journey.id,
                parentBlockId: typography.parentBlockId,
                content: typography.content,
                variant: typography.variant
              }
            },
            optimisticResponse: { typographyBlockCreate: typography },
            update(cache, { data }) {
              blockCreateUpdate(cache, journey?.id, data?.typographyBlockCreate)
            }
          })
        }
      })
    }
  }

  return (
    <Button
      icon={<Type3Icon />}
      value={t('Text')}
      onClick={handleClick}
      testId="NewTypographyButton"
      disabled={loading}
    />
  )
}
