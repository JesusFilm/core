import { ReactElement, useContext } from 'react'
import TextFieldsRounded from '@mui/icons-material/TextFieldsRounded'
import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  EditorContext,
  TreeBlock,
  TYPOGRAPHY_FIELDS
} from '@core/journeys/ui'
import { useJourney } from '../../../../../libs/context'
import { Button } from '../../Button'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourney'
import { TypographyBlockCreate } from '../../../../../../__generated__/TypographyBlockCreate'

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

export function Typography(): ReactElement {
  const [typographyBlockCreate] = useMutation<TypographyBlockCreate>(
    TYPOGRAPHY_BLOCK_CREATE
  )
  const { id: journeyId } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useContext(EditorContext)

  const handleClick = async (): Promise<void> => {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    const checkTypography = card?.children.map((block) =>
      block.children.find((child) => child.__typename === 'TypographyBlock')
    )
    if (card != null && checkTypography !== undefined) {
      const { data } = await typographyBlockCreate({
        variables: {
          input: {
            journeyId,
            parentBlockId: card.id,
            content: 'Add your text here...',
            variant: checkTypography.length > 0 ? 'body2' : 'h1'
          }
        },
        update(cache, { data }) {
          if (data?.typographyBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journeyId }),
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
          type: 'SetSelectedBlockByIdAction',
          id: data.typographyBlockCreate.id
        })
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
      }
    }
  }

  return (
    <Button icon={<TextFieldsRounded />} value="Text" onClick={handleClick} />
  )
}
