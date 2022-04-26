import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  TreeBlock,
  useEditor,
  RADIO_OPTION_FIELDS,
  RADIO_QUESTION_FIELDS
} from '@core/journeys/ui'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../../Button'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourney'
import { RadioQuestionBlockCreate } from '../../../../../../__generated__/RadioQuestionBlockCreate'
import { TypographyBlockCreate } from '../../../../../../__generated__/TypographyBlockCreate'
import { useJourney } from '../../../../../libs/context'
import { TYPOGRAPHY_BLOCK_CREATE } from '../NewTypographyButton'

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
  const [radioQuestionBlockCreate] = useMutation<RadioQuestionBlockCreate>(
    RADIO_QUESTION_BLOCK_CREATE
  )
  const [typographyBlockCreate] = useMutation<TypographyBlockCreate>(
    TYPOGRAPHY_BLOCK_CREATE
  )
  const journey = useJourney()
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
      const { data } = await typographyBlockCreate({
        variables: {
          input: {
            journeyId: journey.id,
            parentBlockId: card.id,
            content: 'Your Question Here?',
            variant: 'h3'
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
      await typographyBlockCreate({
        variables: {
          input: {
            journeyId: journey.id,
            parentBlockId: card.id,
            content: 'Your Description Here',
            variant: 'body2'
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

      await radioQuestionBlockCreate({
        variables: {
          input: {
            journeyId: journey.id,
            id,
            parentBlockId: card.id,
            label: ''
          },
          radioOptionBlockCreateInput1: {
            journeyId: journey.id,
            parentBlockId: id,
            label: 'Option 1'
          },
          radioOptionBlockCreateInput2: {
            journeyId: journey.id,
            parentBlockId: id,
            label: 'Option 2'
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
    <Button
      icon={<ContactSupportRounded />}
      value="Poll"
      onClick={handleClick}
    />
  )
}
