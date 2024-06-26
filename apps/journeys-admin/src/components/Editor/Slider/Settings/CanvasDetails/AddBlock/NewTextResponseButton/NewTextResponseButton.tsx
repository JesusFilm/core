import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TEXT_RESPONSE_FIELDS } from '@core/journeys/ui/TextResponse/textResponseFields'
import type { TreeBlock } from '@core/journeys/ui/block'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../__generated__/BlockFields'
import { TextResponseBlockCreate } from '../../../../../../../../__generated__/TextResponseBlockCreate'
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
    state: { selectedStep },
    dispatch
  } = useEditor()

  const handleClick = async (): Promise<void> => {
    const id = uuidv4()
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card != null && journey != null) {
      const { data } = await textResponseBlockCreate({
        variables: {
          input: {
            id,
            journeyId: journey.id,
            parentBlockId: card.id,
            label: t('Your answer here')
          }
        },
        update(cache, { data }) {
          if (data?.textResponseBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newBlockRef = cache.writeFragment({
                    data: data.textResponseBlockCreate,
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

      if (data?.textResponseBlockCreate != null) {
        dispatch({
          type: 'SetSelectedBlockByIdAction',
          selectedBlockId: data.textResponseBlockCreate.id
        })
      }
    }
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
