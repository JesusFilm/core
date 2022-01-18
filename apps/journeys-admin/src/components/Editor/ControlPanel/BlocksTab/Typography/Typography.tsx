import { ReactElement, useContext } from 'react'
import TextFieldsRounded from '@mui/icons-material/TextFieldsRounded'
import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  EditorContext,
  TreeBlock,
  TYPOGRAPHY_FIELDS,
  transformer
} from '@core/journeys/ui'
import { Button } from '../../Button'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourneyForEdit'
import { TypographyBlockCreate } from '../../../../../../__generated__/TypographyBlockCreate'

const TYPOGRAPHY_BLOCK_CREATE = gql`
  ${TYPOGRAPHY_FIELDS}
  mutation TypographyBlockCreate($input: TypographyBlockCreateInput!) {
    typographyBlockCreate(input: $input) {
      id
      parentBlockId
      journeyId
      ...TypographyFields
    }
  }
`

export function Typography(): ReactElement {
  const [typographyBlockCreate] = useMutation<TypographyBlockCreate>(
    TYPOGRAPHY_BLOCK_CREATE
  )
  const {
    state: { journey, selectedStep },
    dispatch
  } = useContext(EditorContext)

  const handleClick = async (): Promise<void> => {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (card != null) {
      const { data } = await typographyBlockCreate({
        variables: {
          input: {
            journeyId: journey.id,
            parentBlockId: card.id,
            content: ''
          }
        }
      })
      if (data?.typographyBlockCreate != null) {
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
        dispatch({
          type: 'SetSelectedBlockAction',
          block: transformer([data.typographyBlockCreate])[0]
        })
      }
    }
  }

  return (
    <Button icon={<TextFieldsRounded />} value="Text" onClick={handleClick} />
  )
}
