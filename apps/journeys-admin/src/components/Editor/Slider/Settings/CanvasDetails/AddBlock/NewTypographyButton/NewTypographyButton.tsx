import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'
import type { TreeBlock } from '@core/journeys/ui/block'
import Type3Icon from '@core/shared/ui/icons/Type3'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../__generated__/BlockFields'
import { TypographyBlockCreate } from '../../../../../../../../__generated__/TypographyBlockCreate'
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
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { addBlockCommand } = useBlockCreateCommand()

  async function handleClick(): Promise<void> {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    const checkTypography = card?.children.map((block) =>
      block.children.find((child) => child.__typename === 'TypographyBlock')
    )
    if (card != null && checkTypography !== undefined && journey != null) {
      const { data } = await addBlockCommand(typographyBlockCreate, {
        variables: {
          input: {
            journeyId: journey.id,
            parentBlockId: card.id,
            content: '',
            variant: checkTypography.length > 0 ? 'body2' : 'h1'
          }
        },
        update(cache, { data }) {
          if (data?.typographyBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newBlockRef = cache.writeFragment({
                    data: data.typographyBlockCreate,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  return [...existingBlockRefs, newBlockRef]
                }
              }
            })
          }
        }
      })
      if (data?.typographyBlockCreate != null) {
        dispatch({
          type: 'SetActiveFabAction',
          activeFab: ActiveFab.Save
        })
      }
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
